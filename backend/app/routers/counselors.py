from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime, date

from app.database import get_db
from app.models import (
    CounselorProfile, CounselingSession, MatrimonyProfile,
    User, UserRole, MatrimonyMatch
)
from app.core.security import get_current_user, get_current_admin

router = APIRouter(prefix="/counselors", tags=["Counselors"])


def _require_counselor_or_admin(current_user: User = Depends(get_current_user)):
    if current_user.role not in (UserRole.COUNSELOR, UserRole.ADMIN):
        raise HTTPException(403, "Counselor or admin access required")
    return current_user


class CounselorProfileCreate(BaseModel):
    specialization: Optional[str] = None
    qualifications: Optional[str] = None
    years_experience: int = 0
    languages: Optional[List[str]] = None
    availability_notes: Optional[str] = None
    bio: Optional[str] = None


class SessionCreate(BaseModel):
    matrimony_profile_id: str
    matrimony_profile2_id: Optional[str] = None
    counselor_profile_id: Optional[str] = None   # admin can specify; counselor uses own
    session_date: datetime
    duration_minutes: int = 60
    mode: str = "video"
    topics_covered: Optional[List[str]] = None
    family_present: bool = False
    relation_status: Optional[str] = None


class SessionUpdate(BaseModel):
    status: Optional[str] = None
    session_notes: Optional[str] = None
    recommendations: Optional[str] = None
    next_session_date: Optional[datetime] = None
    family_notes: Optional[str] = None
    topics_covered: Optional[List[str]] = None


# ── Counselor Profile ─────────────────────────────────────────

@router.post("/profile", status_code=201)
async def create_profile(data: CounselorProfileCreate, current_user=Depends(get_current_user),
                          db: AsyncSession = Depends(get_db)):
    if current_user.role != UserRole.COUNSELOR:
        raise HTTPException(403, "Only counselors can create this profile")
    existing = await db.execute(select(CounselorProfile).where(CounselorProfile.user_id == current_user.id))
    if existing.scalar_one_or_none():
        raise HTTPException(400, "Profile already exists")
    cp = CounselorProfile(user_id=current_user.id, **data.dict())
    db.add(cp)
    await db.flush()
    return {"message": "Profile created", "id": cp.id}


@router.get("/profile/me")
async def get_my_profile(current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CounselorProfile).where(CounselorProfile.user_id == current_user.id))
    cp = result.scalar_one_or_none()
    if not cp:
        raise HTTPException(404, "Profile not found")
    return _serialize_counselor(cp)


# ── Profile Access ────────────────────────────────────────────

@router.get("/matrimony-profiles")
async def get_accessible_profiles(skip: int = 0, limit: int = 20, status: Optional[str] = None,
                                   current_user=Depends(_require_counselor_or_admin),
                                   db: AsyncSession = Depends(get_db)):
    q = select(MatrimonyProfile)
    if current_user.role == UserRole.COUNSELOR:
        cp_r = await db.execute(select(CounselorProfile).where(CounselorProfile.user_id == current_user.id))
        cp = cp_r.scalar_one_or_none()
        if not cp:
            return {"items": [], "total": 0}
        ids_r = await db.execute(
            select(CounselingSession.matrimony_profile_id.distinct())
            .where(CounselingSession.counselor_profile_id == cp.id)
        )
        ids = [r[0] for r in ids_r.fetchall()]
        if not ids:
            return {"items": [], "total": 0}
        q = q.where(MatrimonyProfile.id.in_(ids))
    elif status:
        q = q.where(MatrimonyProfile.status == status)

    result = await db.execute(q.offset(skip).limit(limit))
    profiles = result.scalars().all()
    items = []
    for p in profiles:
        user = await db.get(User, p.user_id)
        items.append({
            "id": p.id, "status": p.status,
            "user_name": user.full_name if user else "Unknown",
            "age": _calc_age(p.date_of_birth), "gender": p.gender,
            "city": p.city, "education": p.education, "occupation": p.occupation,
            "photos": p.photos,
        })
    total = await db.scalar(select(func.count()).select_from(MatrimonyProfile)) or 0
    return {"items": items, "total": total}


@router.get("/matrimony-profiles/{profile_id}")
async def get_profile_detail(profile_id: str, current_user=Depends(_require_counselor_or_admin),
                              db: AsyncSession = Depends(get_db)):
    p = await db.get(MatrimonyProfile, profile_id)
    if not p:
        raise HTTPException(404, "Profile not found")
    user = await db.get(User, p.user_id)

    sessions_r = await db.execute(
        select(CounselingSession).where(CounselingSession.matrimony_profile_id == profile_id)
        .order_by(desc(CounselingSession.session_date))
    )
    sessions = sessions_r.scalars().all()

    from app.models import FamilyMember, EmotionalReadinessResponse
    fam_r = await db.execute(select(FamilyMember).where(FamilyMember.matrimony_profile_id == profile_id))
    family = fam_r.scalars().all()

    emo_r = await db.execute(
        select(EmotionalReadinessResponse).where(EmotionalReadinessResponse.matrimony_profile_id == profile_id)
        .order_by(desc(EmotionalReadinessResponse.submitted_at))
    )
    emo = emo_r.scalars().first()

    return {
        "profile": {
            "id": p.id, "status": p.status,
            "user_name": user.full_name if user else "Unknown",
            "user_email": user.email if user else None,
            "user_phone": user.phone if user else None,
            "date_of_birth": p.date_of_birth,
            "age": _calc_age(p.date_of_birth), "gender": p.gender,
            "religion": p.religion, "caste": p.caste,
            "city": p.city, "state": p.state,
            "education": p.education, "occupation": p.occupation,
            "bio": p.bio, "hobbies": p.hobbies, "values": p.values,
            "expectations": p.expectations, "photos": p.photos,
            "marriage_status": p.marriage_status, "admin_notes": p.admin_notes,
        },
        "sessions": [_serialize_session(s) for s in sessions],
        "family_members": [{"id": f.id, "relation": f.relation, "full_name": f.full_name,
                             "phone": f.phone, "is_primary_contact": f.is_primary_contact} for f in family],
        "emotional_readiness": {
            "overall_score": emo.overall_score, "category_scores": emo.category_scores,
            "submitted_at": emo.submitted_at, "is_complete": emo.is_complete,
            "counselor_notes": emo.counselor_notes,
        } if emo else None,
    }


# ── Sessions ──────────────────────────────────────────────────

@router.post("/sessions", status_code=201)
async def create_session(data: SessionCreate, current_user=Depends(_require_counselor_or_admin),
                          db: AsyncSession = Depends(get_db)):
    counselor_profile_id = data.counselor_profile_id
    if not counselor_profile_id:
        cp_r = await db.execute(select(CounselorProfile).where(CounselorProfile.user_id == current_user.id))
        cp = cp_r.scalar_one_or_none()
        if not cp:
            # Fallback to the first active counselor for admin
            active_c = await db.execute(select(CounselorProfile).where(CounselorProfile.is_active == True).limit(1))
            cp = active_c.scalar_one_or_none()
            if not cp:
                # Auto-create counselor profile for current_user if none exist at all
                cp = CounselorProfile(
                    user_id=current_user.id,
                    specialization="General Matchmaking",
                    qualifications="System Matchmaker",
                    is_active=True,
                    bio="Auto-created default matchmaking counselor profile"
                )
                db.add(cp)
                await db.flush()
        counselor_profile_id = cp.id

    mp = await db.get(MatrimonyProfile, data.matrimony_profile_id)
    if not mp:
        raise HTTPException(404, "Matrimony profile not found")

    if data.matrimony_profile2_id:
        mp2 = await db.get(MatrimonyProfile, data.matrimony_profile2_id)
        if not mp2:
            raise HTTPException(404, "Second matrimony profile not found")

    session = CounselingSession(
        counselor_profile_id=counselor_profile_id,
        matrimony_profile_id=data.matrimony_profile_id,
        matrimony_profile2_id=data.matrimony_profile2_id,
        session_date=data.session_date,
        duration_minutes=data.duration_minutes,
        mode=data.mode,
        topics_covered=data.topics_covered,
        family_present=data.family_present,
    )
    db.add(session)

    p1 = data.matrimony_profile_id
    p2 = data.matrimony_profile2_id
    r_status = data.relation_status
    if p2 and r_status:
        match_q = select(MatrimonyMatch).where(
            ((MatrimonyMatch.profile1_id == p1) & (MatrimonyMatch.profile2_id == p2)) |
            ((MatrimonyMatch.profile1_id == p2) & (MatrimonyMatch.profile2_id == p1))
        )
        match_res = await db.execute(match_q)
        match_obj = match_res.scalar_one_or_none()
        if not match_obj:
            match_obj = MatrimonyMatch(
                profile1_id=p1,
                profile2_id=p2,
                status=r_status,
                suggested_by=current_user.id
            )
            db.add(match_obj)
        else:
            match_obj.status = r_status

    await db.flush()
    return {"message": "Session scheduled", "id": session.id}


@router.put("/sessions/{session_id}")
async def update_session(session_id: str, data: SessionUpdate,
                          current_user=Depends(_require_counselor_or_admin),
                          db: AsyncSession = Depends(get_db)):
    session = await db.get(CounselingSession, session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    for field, value in data.dict(exclude_none=True).items():
        setattr(session, field, value)
    return {"message": "Session updated"}


@router.get("/sessions/my")
async def my_sessions(status: Optional[str] = None, skip: int = 0, limit: int = 20,
                       current_user=Depends(_require_counselor_or_admin),
                       db: AsyncSession = Depends(get_db)):
    cp_r = await db.execute(select(CounselorProfile).where(CounselorProfile.user_id == current_user.id))
    cp = cp_r.scalar_one_or_none()
    if not cp:
        return []
    q = select(CounselingSession).where(CounselingSession.counselor_profile_id == cp.id)
    if status:
        q = q.where(CounselingSession.status == status)
    result = await db.execute(q.order_by(desc(CounselingSession.session_date)).offset(skip).limit(limit))
    sessions = result.scalars().all()
    items = []
    for s in sessions:
        mp = await db.get(MatrimonyProfile, s.matrimony_profile_id)
        user = await db.get(User, mp.user_id) if mp else None
        
        user2_name = None
        if s.matrimony_profile2_id:
            mp2 = await db.get(MatrimonyProfile, s.matrimony_profile2_id)
            user2 = await db.get(User, mp2.user_id) if mp2 else None
            user2_name = user2.full_name if user2 else None

        items.append({
            **_serialize_session(s),
            "user_name": user.full_name if user else "Unknown",
            "user2_name": user2_name
        })
    return items


@router.post("/sessions/{session_id}/notes")
async def add_notes(session_id: str, data: dict, current_user=Depends(_require_counselor_or_admin),
                     db: AsyncSession = Depends(get_db)):
    session = await db.get(CounselingSession, session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    if "notes" in data:
        session.session_notes = data["notes"]
    if "recommendations" in data:
        session.recommendations = data["recommendations"]
    if "status" in data:
        session.status = data["status"]
    return {"message": "Notes saved"}


@router.get("/admin/all")
async def admin_list_counselors(admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CounselorProfile).where(CounselorProfile.is_active == True))
    profiles = result.scalars().all()
    items = []
    for cp in profiles:
        user = await db.get(User, cp.user_id)
        sessions_count = await db.scalar(
            select(func.count()).select_from(CounselingSession)
            .where(CounselingSession.counselor_profile_id == cp.id)
        ) or 0
        items.append({**_serialize_counselor(cp),
                      "user_name": user.full_name if user else "Unknown",
                      "user_email": user.email if user else None,
                      "total_sessions": sessions_count})
    return items


@router.post("/admin/assign-session")
async def admin_assign_session(data: dict, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    counselor_profile_id = data.get("counselor_profile_id")
    if not counselor_profile_id:
        # Fallback to the first active counselor
        active_c = await db.execute(select(CounselorProfile).where(CounselorProfile.is_active == True).limit(1))
        cp = active_c.scalar_one_or_none()
        if not cp:
            # Check if current admin already has one
            cp_r = await db.execute(select(CounselorProfile).where(CounselorProfile.user_id == admin.id))
            cp = cp_r.scalar_one_or_none()
            if not cp:
                cp = CounselorProfile(
                    user_id=admin.id,
                    specialization="General Matchmaking",
                    qualifications="System Matchmaker",
                    is_active=True,
                    bio="Auto-created default matchmaking counselor profile"
                )
                db.add(cp)
                await db.flush()
        counselor_profile_id = cp.id

    session_date = data["session_date"]
    if isinstance(session_date, str):
        session_date = datetime.fromisoformat(session_date.rstrip('Z'))

    session = CounselingSession(
        counselor_profile_id=counselor_profile_id,
        matrimony_profile_id=data["matrimony_profile_id"],
        matrimony_profile2_id=data.get("matrimony_profile2_id"),
        session_date=session_date,
        duration_minutes=data.get("duration_minutes", 60),
        mode=data.get("mode", "video"),
        family_present=data.get("family_present", False),
    )
    db.add(session)
    
    p1 = data["matrimony_profile_id"]
    p2 = data.get("matrimony_profile2_id")
    r_status = data.get("relation_status")
    if p2 and r_status:
        match_q = select(MatrimonyMatch).where(
            ((MatrimonyMatch.profile1_id == p1) & (MatrimonyMatch.profile2_id == p2)) |
            ((MatrimonyMatch.profile1_id == p2) & (MatrimonyMatch.profile2_id == p1))
        )
        match_res = await db.execute(match_q)
        match_obj = match_res.scalar_one_or_none()
        if not match_obj:
            match_obj = MatrimonyMatch(
                profile1_id=p1,
                profile2_id=p2,
                status=r_status,
                suggested_by=admin.id
            )
            db.add(match_obj)
        else:
            match_obj.status = r_status

    await db.flush()
    return {"message": "Session assigned", "id": session.id}


def _serialize_counselor(cp: CounselorProfile) -> dict:
    return {"id": cp.id, "specialization": cp.specialization, "qualifications": cp.qualifications,
            "years_experience": cp.years_experience, "languages": cp.languages,
            "bio": cp.bio, "availability_notes": cp.availability_notes,
            "is_active": cp.is_active, "created_at": cp.created_at}


def _serialize_session(s: CounselingSession) -> dict:
    return {"id": s.id, "session_date": s.session_date, "duration_minutes": s.duration_minutes,
            "mode": s.mode, "status": s.status, "topics_covered": s.topics_covered,
            "session_notes": s.session_notes, "recommendations": s.recommendations,
            "next_session_date": s.next_session_date, "family_present": s.family_present,
            "family_notes": s.family_notes, "created_at": s.created_at,
            "counselor_profile_id": s.counselor_profile_id,
            "matrimony_profile_id": s.matrimony_profile_id,
            "matrimony_profile2_id": s.matrimony_profile2_id}


def _calc_age(dob) -> int:
    if not dob:
        return 0
    today = date.today()
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
