from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr
from typing import Optional

from app.database import get_db
from app.models import User, UserRole, ActivityLog
from app.core.security import (
    verify_password, get_password_hash, create_access_token,
    create_refresh_token, verify_token, get_current_user
)
from app.core.email import send_email
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ─── Schemas ────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str
    role: UserRole = UserRole.DONOR

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict

class RefreshRequest(BaseModel):
    refresh_token: str


# ─── Helpers ─────────────────────────────────────────────────

async def log_activity(db, user_id, action, module, request=None, details=None):
    log = ActivityLog(
        user_id=user_id,
        action=action,
        module=module,
        details=details,
        ip_address=request.client.host if request else None,
    )
    db.add(log)
    await db.flush()


# ─── Routes ──────────────────────────────────────────────────

@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(data: RegisterRequest, request: Request, db: AsyncSession = Depends(get_db)):
    # Check duplicate
    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(400, "Email already registered")

    if data.phone:
        existing_phone = await db.execute(select(User).where(User.phone == data.phone))
        if existing_phone.scalar_one_or_none():
            raise HTTPException(400, "Phone number already registered")

    # Prevent admin self-registration
    if data.role == UserRole.ADMIN:
        raise HTTPException(403, "Admin accounts cannot be self-registered")

    user = User(
        full_name=data.full_name,
        email=data.email,
        phone=data.phone,
        hashed_password=get_password_hash(data.password),
        role=data.role,
    )
    db.add(user)
    await db.flush()

    # Welcome email
    role_messages = {
        UserRole.MATRIMONY: "Your profile is under review. We will notify you once approved.",
        UserRole.CANDIDATE: "Browse job openings and apply. Good luck!",
        UserRole.VOLUNTEER: "Your volunteer registration is under review.",
        UserRole.DONOR: "Thank you for your support. Explore our campaigns.",
    }
    await send_email(user.email, "welcome", {
        "name": user.full_name,
        "email": user.email,
        "role": data.role.value.capitalize(),
        "message": role_messages.get(data.role, "Welcome to Devkalp Foundation!"),
        "dashboard_url": f"{settings.FRONTEND_URL}/dashboard",
    })

    await log_activity(db, user.id, "register", "auth", request)

    access_token = create_access_token({"sub": user.id, "role": user.role})
    refresh_token = create_refresh_token({"sub": user.id})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "is_verified": user.is_verified,
        }
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(401, "Invalid email or password")

    if not user.is_active:
        raise HTTPException(403, "Account suspended. Contact admin.")

    # Update last login
    user.last_login = datetime.utcnow()
    await log_activity(db, user.id, "login", "auth", request)

    access_token = create_access_token({"sub": user.id, "role": user.role})
    refresh_token = create_refresh_token({"sub": user.id})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "is_verified": user.is_verified,
            "profile_picture": user.profile_picture,
        }
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    payload = verify_token(data.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(401, "Invalid refresh token")

    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(401, "User not found or inactive")

    access_token = create_access_token({"sub": user.id, "role": user.role})
    new_refresh = create_refresh_token({"sub": user.id})

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh,
        user={"id": user.id, "full_name": user.full_name, "email": user.email, "role": user.role}
    )


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "phone": current_user.phone,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "is_verified": current_user.is_verified,
        "profile_picture": current_user.profile_picture,
        "created_at": current_user.created_at,
        "last_login": current_user.last_login,
    }


@router.post("/change-password")
async def change_password(
    data: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not verify_password(data["current_password"], current_user.hashed_password):
        raise HTTPException(400, "Current password is incorrect")
    current_user.hashed_password = get_password_hash(data["new_password"])
    return {"message": "Password changed successfully"}
