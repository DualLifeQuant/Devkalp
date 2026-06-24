from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import Optional

from app.database import get_db
from app.models import (
    User, Donation, DonationStatus, MatrimonyProfile, ProfileStatus,
    Job, JobStatus, JobApplication, ApplicationStatus,
    Campaign, CampaignStatus, VolunteerProfile, VolunteerStatus, ActivityLog
)
from app.core.security import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard/stats")
async def dashboard_stats(admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    users_total        = await db.scalar(select(func.count()).select_from(User).where(User.is_active == True)) or 0
    total_donations    = await db.scalar(select(func.sum(Donation.amount)).where(Donation.status == DonationStatus.COMPLETED)) or 0
    donations_count    = await db.scalar(select(func.count()).select_from(Donation).where(Donation.status == DonationStatus.COMPLETED)) or 0
    pending_matrimony  = await db.scalar(select(func.count()).select_from(MatrimonyProfile).where(MatrimonyProfile.status == ProfileStatus.PENDING)) or 0
    open_jobs          = await db.scalar(select(func.count()).select_from(Job).where(Job.status == JobStatus.OPEN)) or 0
    pending_apps       = await db.scalar(select(func.count()).select_from(JobApplication).where(JobApplication.status == ApplicationStatus.APPLIED)) or 0
    pending_volunteers = await db.scalar(select(func.count()).select_from(VolunteerProfile).where(VolunteerProfile.status == VolunteerStatus.PENDING)) or 0
    active_campaigns   = await db.scalar(select(func.count()).select_from(Campaign).where(Campaign.status == CampaignStatus.ACTIVE)) or 0
    return {
        "users_total": users_total,
        "total_donations": total_donations,
        "donations_count": donations_count,
        "pending_matrimony_profiles": pending_matrimony,
        "open_jobs": open_jobs,
        "pending_applications": pending_apps,
        "pending_volunteers": pending_volunteers,
        "active_campaigns": active_campaigns,
    }


@router.get("/users")
async def list_users(role: Optional[str] = None, skip: int = 0, limit: int = 50,
                      admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    q = select(User).order_by(desc(User.created_at))
    if role:
        q = q.where(User.role == role)
    result = await db.execute(q.offset(skip).limit(limit))
    users = result.scalars().all()
    total = await db.scalar(select(func.count()).select_from(User)) or 0
    return {
        "items": [{"id": u.id, "full_name": u.full_name, "email": u.email,
                   "phone": u.phone, "role": u.role, "is_active": u.is_active,
                   "created_at": u.created_at, "last_login": u.last_login} for u in users],
        "total": total,
    }


@router.post("/users/{user_id}/toggle-active")
async def toggle_active(user_id: str, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    if user.role == "admin":
        raise HTTPException(403, "Cannot modify admin accounts")
    user.is_active = not user.is_active
    return {"is_active": user.is_active}


@router.get("/activity-logs")
async def activity_logs(module: Optional[str] = None, skip: int = 0, limit: int = 100,
                         admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    q = select(ActivityLog).order_by(desc(ActivityLog.created_at))
    if module:
        q = q.where(ActivityLog.module == module)
    result = await db.execute(q.offset(skip).limit(limit))
    logs = result.scalars().all()
    items = []
    for log in logs:
        user = await db.get(User, log.user_id) if log.user_id else None
        items.append({
            "id": log.id, "action": log.action, "module": log.module,
            "resource_id": log.resource_id, "details": log.details,
            "ip_address": log.ip_address, "created_at": log.created_at,
            "user_name": user.full_name if user else "System",
            "user_email": user.email if user else None,
        })
    return items
