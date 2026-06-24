from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from pydantic import BaseModel

from app.database import get_db
from app.models import FamilyMember, FamilyParticipation, MatrimonyProfile, User, UserRole
from app.core.security import get_current_user, get_current_admin

router = APIRouter(prefix="/family", tags=["Family Involvement"])


class FamilyMemberCreate(BaseModel):
    relation: str
    full_name: str
    age: Optional[int] = None
    occupation: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    city: Optional[str] = None
    is_primary_contact: bool = False
    consent_given: bool = False
    notes: Optional[str] = None


@router.get("/my-members")
async def get_my_family_members(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    profile_result = await db.execute(
        select(MatrimonyProfile).where(MatrimonyProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if not profile:
        raise HTTPException(404, "Matrimony profile not found")

    result = await db.execute(
        select(FamilyMember).where(FamilyMember.matrimony_profile_id == profile.id)
    )
    members = result.scalars().all()
    return [_serialize(m) for m in members]


@router.post("/my-members", status_code=201)
async def add_family_member(
    data: FamilyMemberCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    profile_result = await db.execute(
        select(MatrimonyProfile).where(MatrimonyProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if not profile:
        raise HTTPException(404, "Create matrimony profile first")

    member = FamilyMember(
        matrimony_profile_id=profile.id,
        **data.dict()
    )
    db.add(member)
    await db.flush()
    return {"message": "Family member added", "id": member.id}


@router.put("/my-members/{member_id}")
async def update_family_member(
    member_id: str,
    data: FamilyMemberCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify ownership
    profile_result = await db.execute(
        select(MatrimonyProfile).where(MatrimonyProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if not profile:
        raise HTTPException(403, "Not authorized")

    member = await db.get(FamilyMember, member_id)
    if not member or member.matrimony_profile_id != profile.id:
        raise HTTPException(404, "Member not found")

    for field, value in data.dict().items():
        setattr(member, field, value)
    return {"message": "Updated"}


@router.delete("/my-members/{member_id}")
async def delete_family_member(
    member_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    profile_result = await db.execute(
        select(MatrimonyProfile).where(MatrimonyProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    member = await db.get(FamilyMember, member_id)
    if not member or not profile or member.matrimony_profile_id != profile.id:
        raise HTTPException(404, "Member not found")
    await db.delete(member)
    return {"message": "Deleted"}


@router.post("/participation", status_code=201)
async def record_participation(
    data: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    profile_result = await db.execute(
        select(MatrimonyProfile).where(MatrimonyProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if not profile:
        raise HTTPException(404, "Profile not found")

    participation = FamilyParticipation(
        matrimony_profile_id=profile.id,
        family_member_id=data.get("family_member_id"),
        event_type=data["event_type"],
        event_id=data.get("event_id"),
        attended=data.get("attended", False),
        role_played=data.get("role_played"),
        notes=data.get("notes"),
    )
    db.add(participation)
    await db.flush()
    return {"message": "Participation recorded", "id": participation.id}


@router.get("/admin/profile/{profile_id}")
async def admin_get_family(
    profile_id: str,
    admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(FamilyMember).where(FamilyMember.matrimony_profile_id == profile_id)
    )
    members = result.scalars().all()

    participation_result = await db.execute(
        select(FamilyParticipation)
        .where(FamilyParticipation.matrimony_profile_id == profile_id)
    )
    participations = participation_result.scalars().all()

    return {
        "members": [_serialize(m) for m in members],
        "participation_log": [
            {"id": p.id, "event_type": p.event_type, "event_id": p.event_id,
             "attended": p.attended, "role_played": p.role_played,
             "notes": p.notes, "created_at": p.created_at}
            for p in participations
        ]
    }


def _serialize(m: FamilyMember) -> dict:
    return {
        "id": m.id, "relation": m.relation, "full_name": m.full_name,
        "age": m.age, "occupation": m.occupation, "phone": m.phone,
        "email": m.email, "city": m.city,
        "is_primary_contact": m.is_primary_contact,
        "consent_given": m.consent_given, "notes": m.notes,
        "created_at": m.created_at,
    }
