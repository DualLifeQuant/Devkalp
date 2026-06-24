from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import Optional

from app.database import get_db
from app.models import VolunteerProfile, VolunteerTask, VolunteerStatus, User
from app.core.security import get_current_user, get_current_admin

router = APIRouter(prefix="/volunteers", tags=["Volunteers"])


@router.post("/register", status_code=201)
async def register(data: dict, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(VolunteerProfile).where(VolunteerProfile.user_id == current_user.id))
    if existing.scalar_one_or_none():
        raise HTTPException(400, "Already registered")
    profile = VolunteerProfile(
        user_id=current_user.id,
        occupation=data.get("occupation"), city=data.get("city"),
        availability=data.get("availability"),
        skills=data.get("skills", []), interests=data.get("interests", []),
        motivation=data.get("motivation"),
    )
    db.add(profile)
    await db.flush()
    return {"message": "Registration submitted", "id": profile.id}


@router.get("/my-profile")
async def my_profile(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(VolunteerProfile).where(VolunteerProfile.user_id == current_user.id))
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(404, "Not found")
    return _serialize(p)


@router.get("/my-tasks")
async def my_tasks(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    profile_result = await db.execute(select(VolunteerProfile).where(VolunteerProfile.user_id == current_user.id))
    p = profile_result.scalar_one_or_none()
    if not p:
        raise HTTPException(404, "Not a volunteer")
    tasks_result = await db.execute(select(VolunteerTask).where(VolunteerTask.volunteer_id == p.id))
    tasks = tasks_result.scalars().all()
    return [{"id": t.id, "title": t.title, "description": t.description,
             "due_date": t.due_date, "hours_estimated": t.hours_estimated,
             "is_completed": t.is_completed, "created_at": t.created_at} for t in tasks]


@router.post("/tasks/{task_id}/complete")
async def complete_task(task_id: str, data: dict, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    profile_result = await db.execute(select(VolunteerProfile).where(VolunteerProfile.user_id == current_user.id))
    p = profile_result.scalar_one_or_none()
    if not p:
        raise HTTPException(403, "Not a volunteer")
    task = await db.get(VolunteerTask, task_id)
    if not task or task.volunteer_id != p.id:
        raise HTTPException(404, "Task not found")
    task.is_completed = True
    task.completion_notes = data.get("notes")
    task.hours_actual = data.get("hours_actual")
    p.tasks_completed = (p.tasks_completed or 0) + 1
    if task.hours_actual:
        p.hours_contributed = (p.hours_contributed or 0) + task.hours_actual
    return {"message": "Task completed"}


@router.get("/admin/all")
async def admin_list(status: Optional[str] = None, skip: int = 0, limit: int = 50, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    query = select(VolunteerProfile)
    if status:
        query = query.where(VolunteerProfile.status == status)
    result = await db.execute(query.offset(skip).limit(limit))
    profiles = result.scalars().all()
    items = []
    for p in profiles:
        user = await db.get(User, p.user_id)
        items.append({**_serialize(p), "user_name": user.full_name if user else "Unknown",
                      "user_email": user.email if user else None})
    total = await db.scalar(select(func.count()).select_from(VolunteerProfile))
    return {"items": items, "total": total}


@router.post("/admin/{volunteer_id}/approve")
async def approve(volunteer_id: str, data: dict, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    p = await db.get(VolunteerProfile, volunteer_id)
    if not p:
        raise HTTPException(404, "Not found")
    p.status = VolunteerStatus.ACTIVE if data.get("approve") else VolunteerStatus.INACTIVE
    p.admin_notes = data.get("notes")
    return {"message": "Updated"}


@router.post("/admin/assign-task")
async def assign_task(data: dict, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    due_date = data.get("due_date")
    if isinstance(due_date, str) and due_date.strip():
        try:
            if "T" in due_date:
                due_date = datetime.fromisoformat(due_date.rstrip('Z')).date()
            else:
                due_date = date.fromisoformat(due_date)
        except ValueError:
            due_date = None
    else:
        due_date = None

    task = VolunteerTask(
        volunteer_id=data["volunteer_id"], title=data["title"],
        description=data.get("description"), campaign_id=data.get("campaign_id"),
        assigned_by=admin.id, due_date=due_date,
        hours_estimated=data.get("hours_estimated"),
    )
    db.add(task)
    await db.flush()
    return {"message": "Task assigned", "id": task.id}


def _serialize(p: VolunteerProfile) -> dict:
    return {
        "id": p.id, "status": p.status.value if hasattr(p.status, "value") else p.status,
        "occupation": p.occupation, "city": p.city,
        "availability": p.availability, "skills": p.skills,
        "interests": p.interests, "hours_contributed": p.hours_contributed,
        "tasks_completed": p.tasks_completed, "created_at": p.created_at,
    }
