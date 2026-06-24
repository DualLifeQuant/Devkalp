from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.models import Campaign, CampaignSession, CampaignAttendee, User
from app.core.security import get_current_user, get_current_admin
from app.utils.storage import upload_image

router = APIRouter(prefix="/campaign-sessions", tags=["Campaign Sessions"])


class SessionCreate(BaseModel):
    campaign_id: str
    session_number: int = 1
    title: str
    school_name: Optional[str] = None
    school_address: Optional[str] = None
    facilitator_name: Optional[str] = None
    session_date: datetime
    duration_minutes: int = 90
    topics_covered: Optional[List[str]] = None
    expected_students: Optional[int] = None


class SessionUpdate(BaseModel):
    title: Optional[str] = None
    session_notes: Optional[str] = None
    challenges: Optional[str] = None
    outcomes: Optional[str] = None
    girls_count: Optional[int] = None
    boys_count: Optional[int] = None
    teachers_count: Optional[int] = None
    total_attended: Optional[int] = None
    status: Optional[str] = None
    topics_covered: Optional[List[str]] = None


class AttendeeCreate(BaseModel):
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    class_grade: Optional[str] = None
    school_name: Optional[str] = None
    phone: Optional[str] = None
    pre_assessment_score: Optional[int] = None
    post_assessment_score: Optional[int] = None
    feedback: Optional[str] = None


# ─── Session Routes ───────────────────────────────────────────

@router.post("/", status_code=201)
async def create_session(
    data: SessionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role not in ("admin", "volunteer"):
        from app.models import UserRole
        if current_user.role not in (UserRole.ADMIN, UserRole.VOLUNTEER):
            raise HTTPException(403, "Admin or volunteer access required")

    campaign = await db.get(Campaign, data.campaign_id)
    if not campaign:
        raise HTTPException(404, "Campaign not found")

    session = CampaignSession(
        campaign_id=data.campaign_id,
        session_number=data.session_number,
        title=data.title,
        school_name=data.school_name,
        school_address=data.school_address,
        facilitator_name=data.facilitator_name,
        session_date=data.session_date,
        duration_minutes=data.duration_minutes,
        topics_covered=data.topics_covered,
        expected_students=data.expected_students,
        created_by=current_user.id,
    )
    db.add(session)
    await db.flush()
    return {"message": "Session created", "id": session.id}


@router.get("/campaign/{campaign_id}")
async def get_campaign_sessions(
    campaign_id: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(CampaignSession)
        .where(CampaignSession.campaign_id == campaign_id)
        .order_by(CampaignSession.session_date)
    )
    sessions = result.scalars().all()

    items = []
    for s in sessions:
        count = await db.scalar(
            select(func.count()).select_from(CampaignAttendee)
            .where(CampaignAttendee.session_id == s.id)
        ) or 0
        items.append({**_serialize_session(s), "registered_attendees": count})
    return items


@router.get("/{session_id}")
async def get_session(session_id: str, db: AsyncSession = Depends(get_db)):
    s = await db.get(CampaignSession, session_id)
    if not s:
        raise HTTPException(404, "Session not found")

    attendees_result = await db.execute(
        select(CampaignAttendee).where(CampaignAttendee.session_id == session_id)
    )
    attendees = attendees_result.scalars().all()

    return {
        **_serialize_session(s),
        "attendees": [_serialize_attendee(a) for a in attendees],
        "stats": {
            "total_registered": len(attendees),
            "girls": s.girls_count or 0,
            "boys": s.boys_count or 0,
            "teachers": s.teachers_count or 0,
            "total_attended": s.total_attended or 0,
        }
    }


@router.put("/{session_id}")
async def update_session(
    session_id: str,
    data: SessionUpdate,
    admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    s = await db.get(CampaignSession, session_id)
    if not s:
        raise HTTPException(404, "Session not found")
    for field, value in data.dict(exclude_none=True).items():
        setattr(s, field, value)
    return {"message": "Session updated"}


@router.post("/{session_id}/photo")
async def upload_session_photo(
    session_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    s = await db.get(CampaignSession, session_id)
    if not s:
        raise HTTPException(404, "Session not found")
    import uuid
    url = await upload_image(file, "campaigns/sessions", f"session_{session_id}_{uuid.uuid4().hex[:6]}")
    media = s.media_urls or []
    media.append(url)
    s.media_urls = media
    return {"url": url}


# ─── Attendance Routes ────────────────────────────────────────

@router.post("/{session_id}/attendees", status_code=201)
async def add_attendee(
    session_id: str,
    data: AttendeeCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    s = await db.get(CampaignSession, session_id)
    if not s:
        raise HTTPException(404, "Session not found")

    attendee = CampaignAttendee(session_id=session_id, **data.dict())
    db.add(attendee)

    # Update counts
    if data.gender == "female":
        s.girls_count = (s.girls_count or 0) + 1
    elif data.gender == "male":
        s.boys_count = (s.boys_count or 0) + 1
    s.total_attended = (s.total_attended or 0) + 1

    await db.flush()
    return {"message": "Attendee added", "id": attendee.id}


@router.post("/{session_id}/bulk-attendance")
async def bulk_attendance(
    session_id: str,
    data: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Batch add attendance: {girls: 45, boys: 30, teachers: 5, notes: '...'}"""
    s = await db.get(CampaignSession, session_id)
    if not s:
        raise HTTPException(404, "Session not found")

    s.girls_count = data.get("girls", 0)
    s.boys_count = data.get("boys", 0)
    s.teachers_count = data.get("teachers", 0)
    s.total_attended = s.girls_count + s.boys_count + s.teachers_count
    s.session_notes = data.get("notes", s.session_notes)
    s.outcomes = data.get("outcomes", s.outcomes)
    s.challenges = data.get("challenges", s.challenges)
    s.status = "completed"

    return {"message": "Attendance recorded", "total": s.total_attended}


@router.get("/{session_id}/attendees")
async def get_attendees(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(CampaignAttendee).where(CampaignAttendee.session_id == session_id)
    )
    attendees = result.scalars().all()
    return [_serialize_attendee(a) for a in attendees]


# ─── Analytics ───────────────────────────────────────────────

@router.get("/admin/analytics/{campaign_id}")
async def session_analytics(
    campaign_id: str,
    admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    sessions_result = await db.execute(
        select(CampaignSession).where(CampaignSession.campaign_id == campaign_id)
    )
    sessions = sessions_result.scalars().all()

    total_students = sum((s.total_attended or 0) for s in sessions)
    total_girls = sum((s.girls_count or 0) for s in sessions)
    total_boys = sum((s.boys_count or 0) for s in sessions)
    total_teachers = sum((s.teachers_count or 0) for s in sessions)
    completed = sum(1 for s in sessions if s.status == "completed")
    schools = list(set(s.school_name for s in sessions if s.school_name))

    return {
        "total_sessions": len(sessions),
        "completed_sessions": completed,
        "total_students_reached": total_students,
        "girls_reached": total_girls,
        "boys_reached": total_boys,
        "teachers_reached": total_teachers,
        "unique_schools": len(schools),
        "school_names": schools,
        "sessions": [_serialize_session(s) for s in sessions],
    }


# ─── Helpers ─────────────────────────────────────────────────

def _serialize_session(s: CampaignSession) -> dict:
    return {
        "id": s.id, "campaign_id": s.campaign_id,
        "session_number": s.session_number, "title": s.title,
        "school_name": s.school_name, "school_address": s.school_address,
        "facilitator_name": s.facilitator_name,
        "session_date": s.session_date, "duration_minutes": s.duration_minutes,
        "topics_covered": s.topics_covered, "expected_students": s.expected_students,
        "girls_count": s.girls_count, "boys_count": s.boys_count,
        "teachers_count": s.teachers_count, "total_attended": s.total_attended,
        "session_notes": s.session_notes, "challenges": s.challenges,
        "outcomes": s.outcomes, "media_urls": s.media_urls, "status": s.status,
        "created_at": s.created_at,
    }


def _serialize_attendee(a: CampaignAttendee) -> dict:
    return {
        "id": a.id, "name": a.name, "age": a.age, "gender": a.gender,
        "class_grade": a.class_grade, "school_name": a.school_name,
        "pre_assessment_score": a.pre_assessment_score,
        "post_assessment_score": a.post_assessment_score,
        "feedback": a.feedback,
    }
