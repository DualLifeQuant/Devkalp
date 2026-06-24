from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc
from typing import Optional, List
from pydantic import BaseModel
from datetime import date, datetime
import uuid

from app.database import get_db
from app.models import (
    MatrimonyProfile, MatrimonyMatch, User,
    UserRole, ProfileStatus, MatchStatus, MarriageStatus,
    CounselingSession, CounselorProfile
)
from app.core.security import get_current_user, get_current_admin
from app.core.email import send_email
from app.core.notifications import notify_match_suggested, notify_profile_approved
from app.utils.storage import upload_image, upload_document, delete_asset
from app.config import settings

router = APIRouter(prefix="/matrimony", tags=["Matrimony"])


class ProfileCreate(BaseModel):
    date_of_birth: date
    gender: str
    height_cm: Optional[int] = None
    weight_kg: Optional[int] = None
    complexion: Optional[str] = None
    blood_group: Optional[str] = None
    religion: str
    caste: Optional[str] = None
    sub_caste: Optional[str] = None
    gotra: Optional[str] = None
    manglik: Optional[str] = None
    city: str
    state: str
    country: str = "India"
    education: str
    occupation: str
    employer: Optional[str] = None
    annual_income: Optional[str] = None
    family_type: Optional[str] = None
    family_status: Optional[str] = None
    father_occupation: Optional[str] = None
    mother_occupation: Optional[str] = None
    siblings: Optional[str] = None
    marriage_status: str = MarriageStatus.NEVER_MARRIED
    children: int = 0
    bio: Optional[str] = None
    hobbies: Optional[List[str]] = None
    values: Optional[str] = None
    expectations: Optional[str] = None


# ── User Routes ───────────────────────────────────────────────

@router.post("/profile", status_code=201)
async def create_profile(data: ProfileCreate, current_user=Depends(get_current_user),
                          db: AsyncSession = Depends(get_db)):
    if current_user.role not in (UserRole.MATRIMONY, UserRole.ADMIN):
        raise HTTPException(403, "Only matrimony users can create profiles")
    existing = await db.execute(select(MatrimonyProfile).where(MatrimonyProfile.user_id == current_user.id))
    if existing.scalar_one_or_none():
        raise HTTPException(400, "Profile already exists. Use PUT to update.")
    profile = MatrimonyProfile(user_id=current_user.id, **data.dict())
    db.add(profile)
    await db.flush()
    return {"message": "Profile submitted for review", "profile_id": profile.id}


@router.get("/profile/me")
async def get_my_profile(current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MatrimonyProfile).where(MatrimonyProfile.user_id == current_user.id))
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(404, "Profile not found")
    return _serialize_profile(p, include_sensitive=True)


@router.put("/profile/me")
async def update_profile(data: ProfileCreate, current_user=Depends(get_current_user),
                          db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MatrimonyProfile).where(MatrimonyProfile.user_id == current_user.id))
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(404, "Profile not found")
    for field, value in data.dict(exclude_none=True).items():
        setattr(p, field, value)
    if p.status == ProfileStatus.APPROVED:
        p.status = ProfileStatus.PENDING
    return {"message": "Profile updated and sent for re-review"}


@router.post("/profile/photo")
async def upload_photo(file: UploadFile = File(...), current_user=Depends(get_current_user),
                        db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MatrimonyProfile).where(MatrimonyProfile.user_id == current_user.id))
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(404, "Create profile first")
    url = await upload_image(file, "matrimony/photos", f"photo_{current_user.id}_{uuid.uuid4().hex[:6]}")
    photos = p.photos or []
    photos.append(url)
    p.photos = photos
    return {"url": url, "total_photos": len(photos)}


@router.delete("/profile/photo")
async def delete_photo(photo_url: str = Query(...), current_user=Depends(get_current_user),
                       db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MatrimonyProfile).where(MatrimonyProfile.user_id == current_user.id))
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(404, "Profile not found")
    photos = p.photos or []
    if photo_url in photos:
        photos.remove(photo_url)
        p.photos = photos
        
        # Try to delete from Cloudinary or local storage
        if settings.CLOUDINARY_CLOUD_NAME:
            try:
                if "devkalp/matrimony/photos/" in photo_url:
                    parts = photo_url.split("devkalp/matrimony/photos/")
                    if len(parts) > 1:
                        filename = parts[1].split(".")[0]
                        public_id = f"devkalp/matrimony/photos/{filename}"
                        await delete_asset(public_id)
            except Exception as e:
                logger.error(f"Failed to delete photo from Cloudinary: {e}")
        else:
            try:
                if "/static/uploads/" in photo_url:
                    filename = photo_url.split("/static/uploads/")[-1]
                    import os
                    current_dir = os.path.dirname(os.path.abspath(__file__))
                    filepath = os.path.join(current_dir, "..", "static", "uploads", filename)
                    if os.path.exists(filepath):
                        os.remove(filepath)
            except Exception as e:
                logger.error(f"Failed to delete local photo: {e}")
                
        return {"message": "Photo deleted", "total_photos": len(photos)}
    raise HTTPException(404, "Photo not found in profile")


@router.post("/profile/id-proof")
async def upload_id_proof(file: UploadFile = File(...), id_type: str = Query(...),
                           current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MatrimonyProfile).where(MatrimonyProfile.user_id == current_user.id))
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(404, "Create profile first")
    url = await upload_document(file, "matrimony/id-proofs", f"id_{current_user.id}")
    p.id_proof_url = url
    p.id_proof_type = id_type
    return {"url": url, "message": "ID proof uploaded"}


@router.post("/profile/biodata")
async def upload_biodata(file: UploadFile = File(...),
                         current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MatrimonyProfile).where(MatrimonyProfile.user_id == current_user.id))
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(404, "Create profile first")
    url = await upload_document(file, "matrimony/biodatas", f"biodata_{current_user.id}")
    p.biodata_url = url
    return {"url": url, "message": "Biodata uploaded"}


@router.get("/profiles")
async def list_approved_profiles(current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Get current user's profile if it exists
    my_profile_r = await db.execute(select(MatrimonyProfile).where(MatrimonyProfile.user_id == current_user.id))
    my_profile = my_profile_r.scalar_one_or_none()
    
    # Get all matches for this user to check clearance
    cleared_profile_ids = set()
    if my_profile:
        matches_r = await db.execute(
            select(MatrimonyMatch).where(
                (MatrimonyMatch.profile1_id == my_profile.id) | (MatrimonyMatch.profile2_id == my_profile.id)
            )
        )
        for match in matches_r.scalars().all():
            if match.suggested_by != current_user.id or match.status == MatchStatus.INTERESTED.value:
                other_id = match.profile2_id if match.profile1_id == my_profile.id else match.profile1_id
                cleared_profile_ids.add(other_id)

    result = await db.execute(
        select(MatrimonyProfile).where(MatrimonyProfile.status == ProfileStatus.APPROVED.value)
    )
    profiles = result.scalars().all()
    items = []
    for p in profiles:
        user = await db.get(User, p.user_id)
        # Check clearance
        include_sensitive = (p.id in cleared_profile_ids) or (current_user.role == UserRole.ADMIN.value)
        items.append({
            **_serialize_profile(p, include_sensitive=include_sensitive),
            "name": user.full_name if user else "Unknown",
        })
    return items


@router.get("/public-profiles")
async def list_public_profiles(db: AsyncSession = Depends(get_db)):
    """Public endpoint – no auth required. Returns safe, non-sensitive fields only."""
    result = await db.execute(
        select(MatrimonyProfile)
        .where(MatrimonyProfile.status == ProfileStatus.APPROVED.value)
        .order_by(desc(MatrimonyProfile.created_at))
    )
    profiles = result.scalars().all()
    items = []
    for p in profiles:
        user = await db.get(User, p.user_id)
        full_name = user.full_name if user else "Unknown"
        # Show only first name + last initial for privacy
        parts = full_name.split()
        display_name = f"{parts[0]} {parts[-1][0]}." if len(parts) > 1 else full_name
        items.append({
            "id": p.id,
            "name": display_name,
            "age": _calc_age(p.date_of_birth),
            "gender": p.gender,
            "city": p.city,
            "state": p.state,
            "education": p.education,
            "occupation": p.occupation,
            "religion": p.religion,
            "caste": p.caste,
            "bio": p.bio,
            "photos": p.photos or [],
            "created_at": p.created_at,
        })
    return items




@router.get("/my-matches")
async def get_my_matches(current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    profile_r = await db.execute(select(MatrimonyProfile).where(MatrimonyProfile.user_id == current_user.id))
    p = profile_r.scalar_one_or_none()
    if not p:
        raise HTTPException(404, "Profile not found")
    matches_r = await db.execute(
        select(MatrimonyMatch).where(
            (MatrimonyMatch.profile1_id == p.id) | (MatrimonyMatch.profile2_id == p.id)
        )
    )
    matches = matches_r.scalars().all()
    result = []
    for match in matches:
        other_id = match.profile2_id if match.profile1_id == p.id else match.profile1_id
        other_r = await db.execute(select(MatrimonyProfile).where(MatrimonyProfile.id == other_id))
        other = other_r.scalar_one_or_none()
        if other:
            other_user = await db.get(User, other.user_id)
            include_sensitive = match.suggested_by != current_user.id or match.status == MatchStatus.INTERESTED.value
            result.append({
                "match_id": match.id, "status": match.status,
                "suggested_at": match.created_at, "meeting_date": match.meeting_date,
                "admin_notes": match.admin_notes,
                "profile1_id": match.profile1_id,
                "profile2_id": match.profile2_id,
                "profile1_response": match.profile1_response,
                "profile2_response": match.profile2_response,
                "suggested_by": match.suggested_by,
                "other_profile": {
                    **_serialize_profile(other, include_sensitive=include_sensitive),
                    "name": other_user.full_name if other_user else "Unknown",
                },
            })
    return result



@router.post("/matches/{match_id}/respond")
async def respond_to_match(match_id: str, response: dict, current_user=Depends(get_current_user),
                            db: AsyncSession = Depends(get_db)):
    profile_r = await db.execute(select(MatrimonyProfile).where(MatrimonyProfile.user_id == current_user.id))
    p = profile_r.scalar_one_or_none()
    if not p:
        raise HTTPException(404, "Profile not found")
    match = await db.get(MatrimonyMatch, match_id)
    if not match:
        raise HTTPException(404, "Match not found")
    interested = response.get("interested", False)
    if match.profile1_id == p.id:
        match.profile1_response = "interested" if interested else "declined"
    elif match.profile2_id == p.id:
        match.profile2_response = "interested" if interested else "declined"
    else:
        raise HTTPException(403, "Not your match")
    if match.profile1_response == "interested" and match.profile2_response == "interested":
        match.status = MatchStatus.INTERESTED
    elif "declined" in [match.profile1_response, match.profile2_response]:
        match.status = MatchStatus.DECLINED
    return {"message": "Response recorded", "status": match.status}


# ── Admin Routes ──────────────────────────────────────────────

@router.get("/admin/profiles")
async def admin_list_profiles(status: Optional[str] = None, skip: int = 0, limit: int = 20,
                               admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    q = select(MatrimonyProfile)
    if status and status != "all":
        q = q.where(MatrimonyProfile.status == status)
    result = await db.execute(q.order_by(desc(MatrimonyProfile.created_at)).offset(skip).limit(limit))
    profiles = result.scalars().all()
    items = []
    for p in profiles:
        user = await db.get(User, p.user_id)
        items.append({
            **_serialize_profile(p, include_sensitive=True),
            "user_name": user.full_name if user else "Unknown",
            "user_email": user.email if user else None,
            "user_phone": user.phone if user else None,
        })
    total = await db.scalar(select(func.count()).select_from(MatrimonyProfile)) or 0
    return {"items": items, "total": total}


@router.get("/admin/matches")
async def admin_list_matches(admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    matches_r = await db.execute(select(MatrimonyMatch).order_by(desc(MatrimonyMatch.created_at)))
    matches = matches_r.scalars().all()
    result = []
    for match in matches:
        p1 = await db.get(MatrimonyProfile, match.profile1_id)
        u1 = await db.get(User, p1.user_id) if p1 else None
        
        p2 = await db.get(MatrimonyProfile, match.profile2_id)
        u2 = await db.get(User, p2.user_id) if p2 else None
        
        # Load meetings history for this pair
        sessions_r = await db.execute(
            select(CounselingSession)
            .where(
                ((CounselingSession.matrimony_profile_id == match.profile1_id) & (CounselingSession.matrimony_profile2_id == match.profile2_id)) |
                ((CounselingSession.matrimony_profile_id == match.profile2_id) & (CounselingSession.matrimony_profile2_id == match.profile1_id))
            )
            .order_by(desc(CounselingSession.session_date))
        )
        sessions = sessions_r.scalars().all()
        sessions_list = []
        for s in sessions:
            counselor_user = None
            if s.counselor_profile_id:
                cp = await db.get(CounselorProfile, s.counselor_profile_id)
                counselor_user = await db.get(User, cp.user_id) if cp else None
            
            sessions_list.append({
                "id": s.id,
                "session_date": s.session_date.isoformat() if s.session_date else None,
                "duration_minutes": s.duration_minutes,
                "mode": s.mode,
                "status": s.status,
                "topics_covered": s.topics_covered,
                "session_notes": s.session_notes,
                "recommendations": s.recommendations,
                "counselor_name": counselor_user.full_name if counselor_user else "Unknown"
            })
            
        result.append({
            "id": match.id,
            "profile1_id": match.profile1_id,
            "profile1_name": u1.full_name if u1 else "Unknown",
            "profile1_gender": p1.gender if p1 else "male",
            "profile2_id": match.profile2_id,
            "profile2_name": u2.full_name if u2 else "Unknown",
            "profile2_gender": p2.gender if p2 else "female",
            "status": match.status,
            "profile1_response": match.profile1_response,
            "profile2_response": match.profile2_response,
            "admin_notes": match.admin_notes,
            "meeting_date": match.meeting_date,
            "meeting_notes": match.meeting_notes,
            "created_at": match.created_at,
            "meetings_history": sessions_list
        })
    return result


@router.post("/admin/profiles/{profile_id}/approve")
async def approve_profile(profile_id: str, data: dict, admin=Depends(get_current_admin),
                           db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MatrimonyProfile).where(MatrimonyProfile.id == profile_id))
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(404, "Profile not found")
    action = data.get("action", "approve")
    if action == "approve":
        p.status = ProfileStatus.APPROVED
        p.approved_by = admin.id
        p.approved_at = datetime.utcnow()
        p.admin_notes = data.get("notes", "")
        user = await db.get(User, p.user_id)
        if user:
            await send_email(user.email, "profile_approved", {
                "name": user.full_name,
                "dashboard_url": f"{settings.FRONTEND_URL}/dashboard/matrimony",
            })
            if user.phone:
                await notify_profile_approved(user.full_name, user.phone, "matrimony")
        return {"message": "Profile approved"}
    else:
        p.status = ProfileStatus.REJECTED
        p.rejection_reason = data.get("reason", "")
        return {"message": "Profile rejected"}


@router.post("/admin/suggest-match")
async def suggest_match(data: dict, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    p1_id, p2_id = data["profile1_id"], data["profile2_id"]
    for pid in [p1_id, p2_id]:
        r = await db.execute(
            select(MatrimonyProfile).where(and_(MatrimonyProfile.id == pid,
                                                MatrimonyProfile.status == ProfileStatus.APPROVED))
        )
        if not r.scalar_one_or_none():
            raise HTTPException(404, f"Profile {pid} not found or not approved")
    existing = await db.execute(
        select(MatrimonyMatch).where(
            ((MatrimonyMatch.profile1_id == p1_id) & (MatrimonyMatch.profile2_id == p2_id)) |
            ((MatrimonyMatch.profile1_id == p2_id) & (MatrimonyMatch.profile2_id == p1_id))
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(400, "Match already exists")
    match = MatrimonyMatch(profile1_id=p1_id, profile2_id=p2_id,
                            suggested_by=admin.id, admin_notes=data.get("notes", ""))
    db.add(match)
    await db.flush()
    for pid in [p1_id, p2_id]:
        p = await db.get(MatrimonyProfile, pid)
        user = await db.get(User, p.user_id) if p else None
        if user and user.phone:
            await notify_match_suggested(user.full_name, user.phone)
    return {"message": "Match suggested", "match_id": match.id}


@router.put("/admin/matches/{match_id}")
async def update_match(match_id: str, data: dict, admin=Depends(get_current_admin),
                        db: AsyncSession = Depends(get_db)):
    match = await db.get(MatrimonyMatch, match_id)
    if not match:
        raise HTTPException(404, "Match not found")
    for k in ("status", "meeting_date", "meeting_notes", "admin_notes"):
        if k in data:
            setattr(match, k, data[k])
    return {"message": "Match updated"}


@router.delete("/admin/profiles/{profile_id}")
async def admin_delete_profile(profile_id: str, admin=Depends(get_current_admin),
                               db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MatrimonyProfile).where(MatrimonyProfile.id == profile_id))
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(404, "Profile not found")
    
    # Delete matches
    matches_r = await db.execute(
        select(MatrimonyMatch).where(
            (MatrimonyMatch.profile1_id == profile_id) | (MatrimonyMatch.profile2_id == profile_id)
        )
    )
    for m in matches_r.scalars().all():
        await db.delete(m)
        
    # Delete sessions
    sessions_r = await db.execute(
        select(CounselingSession).where(
            (CounselingSession.matrimony_profile_id == profile_id) |
            (CounselingSession.matrimony_profile2_id == profile_id)
        )
    )
    for s in sessions_r.scalars().all():
        await db.delete(s)
        
    await db.delete(p)
    return {"message": "Profile deleted successfully"}


# ── User Interest & Detailed Profile Endpoints ────────────────

@router.post("/interest/{profile_id}", status_code=201)
async def express_interest(profile_id: str, current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    my_prof_r = await db.execute(select(MatrimonyProfile).where(MatrimonyProfile.user_id == current_user.id))
    my_p = my_prof_r.scalar_one_or_none()
    if not my_p:
        raise HTTPException(400, "Please create a matrimony profile first")
        
    if my_p.id == profile_id:
        raise HTTPException(400, "Cannot express interest in your own profile")
        
    match_r = await db.execute(
        select(MatrimonyMatch).where(
            ((MatrimonyMatch.profile1_id == my_p.id) & (MatrimonyMatch.profile2_id == profile_id)) |
            ((MatrimonyMatch.profile1_id == profile_id) & (MatrimonyMatch.profile2_id == my_p.id))
        )
    )
    match = match_r.scalar_one_or_none()
    
    if match:
        if match.profile1_id == my_p.id:
            match.profile1_response = "interested"
        else:
            match.profile2_response = "interested"
            
        if match.profile1_response == "interested" and match.profile2_response == "interested":
            match.status = MatchStatus.INTERESTED.value
            
        await db.commit()
        return {"message": "Interest recorded", "status": match.status}
    else:
        match = MatrimonyMatch(
            profile1_id=my_p.id,
            profile2_id=profile_id,
            suggested_by=current_user.id,
            profile1_response="interested",
            profile2_response=None,
            status=MatchStatus.SUGGESTED.value
        )
        db.add(match)
        await db.commit()
        return {"message": "Interest recorded", "status": match.status}


@router.delete("/interest/{profile_id}")
async def remove_interest(profile_id: str, current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    my_prof_r = await db.execute(select(MatrimonyProfile).where(MatrimonyProfile.user_id == current_user.id))
    my_p = my_prof_r.scalar_one_or_none()
    if not my_p:
        raise HTTPException(400, "Please create a matrimony profile first")
        
    match_r = await db.execute(
        select(MatrimonyMatch).where(
            ((MatrimonyMatch.profile1_id == my_p.id) & (MatrimonyMatch.profile2_id == profile_id)) |
            ((MatrimonyMatch.profile1_id == profile_id) & (MatrimonyMatch.profile2_id == my_p.id))
        )
    )
    match = match_r.scalar_one_or_none()
    if not match:
        raise HTTPException(404, "No interest or match found with this profile")
        
    if match.suggested_by == current_user.id:
        await db.delete(match)
        await db.commit()
        return {"message": "Interest removed"}
    else:
        if match.profile1_id == my_p.id:
            match.profile1_response = None
        else:
            match.profile2_response = None
            
        match.status = MatchStatus.SUGGESTED.value
        await db.commit()
        return {"message": "Interest removed", "status": match.status}


@router.get("/profiles/{profile_id}")
async def get_profile_by_id(profile_id: str, current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    profile_r = await db.execute(select(MatrimonyProfile).where(MatrimonyProfile.id == profile_id))
    p = profile_r.scalar_one_or_none()
    if not p:
        raise HTTPException(404, "Profile not found")
    
    include_sensitive = False
    
    if current_user.role in (UserRole.ADMIN.value, UserRole.COUNSELOR.value):
        include_sensitive = True
    else:
        my_prof_r = await db.execute(select(MatrimonyProfile).where(MatrimonyProfile.user_id == current_user.id))
        my_p = my_prof_r.scalar_one_or_none()
        if my_p:
            if my_p.id == profile_id:
                include_sensitive = True
            else:
                match_r = await db.execute(
                    select(MatrimonyMatch).where(
                        ((MatrimonyMatch.profile1_id == my_p.id) & (MatrimonyMatch.profile2_id == p.id)) |
                        ((MatrimonyMatch.profile1_id == p.id) & (MatrimonyMatch.profile2_id == my_p.id))
                    )
                )
                match = match_r.scalar_one_or_none()
                if match:
                    if match.suggested_by != current_user.id or match.status == MatchStatus.INTERESTED.value:
                        include_sensitive = True

    user = await db.get(User, p.user_id)
    
    sessions_list = []
    if include_sensitive:
        sessions_r = await db.execute(
            select(CounselingSession)
            .where(
                (CounselingSession.matrimony_profile_id == profile_id) |
                (CounselingSession.matrimony_profile2_id == profile_id)
            )
            .order_by(desc(CounselingSession.session_date))
        )
        sessions = sessions_r.scalars().all()
        for s in sessions:
            partner_name = None
            if s.matrimony_profile2_id:
                partner_pid = s.matrimony_profile2_id if s.matrimony_profile_id == profile_id else s.matrimony_profile_id
                part_prof = await db.get(MatrimonyProfile, partner_pid)
                part_user = await db.get(User, part_prof.user_id) if part_prof else None
                partner_name = part_user.full_name if part_user else None
            
            sessions_list.append({
                "id": s.id,
                "session_date": s.session_date,
                "duration_minutes": s.duration_minutes,
                "mode": s.mode,
                "status": s.status,
                "topics_covered": s.topics_covered,
                "session_notes": s.session_notes,
                "recommendations": s.recommendations,
                "next_session_date": s.next_session_date,
                "family_present": s.family_present,
                "family_notes": s.family_notes,
                "created_at": s.created_at,
                "partner_name": partner_name,
                "matrimony_profile2_id": s.matrimony_profile2_id
            })

    return {
        **_serialize_profile(p, include_sensitive=include_sensitive),
        "name": user.full_name if user else "Unknown",
        "sessions": sessions_list
    }


@router.get("/admin/interests-summary")
async def admin_interests_summary(admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    profiles_r = await db.execute(select(MatrimonyProfile).where(MatrimonyProfile.status == ProfileStatus.APPROVED.value))
    profiles = profiles_r.scalars().all()
    
    result = []
    for p in profiles:
        user = await db.get(User, p.user_id)
        # Find all matches where this profile has expressed interest
        matches_r = await db.execute(
            select(MatrimonyMatch).where(
                ((MatrimonyMatch.profile1_id == p.id) & (MatrimonyMatch.profile1_response == "interested")) |
                ((MatrimonyMatch.profile2_id == p.id) & (MatrimonyMatch.profile2_response == "interested"))
            )
        )
        matches = matches_r.scalars().all()
        
        interested_in = []
        for m in matches:
            target_id = m.profile2_id if m.profile1_id == p.id else m.profile1_id
            target_p = await db.get(MatrimonyProfile, target_id)
            if target_p:
                target_user = await db.get(User, target_p.user_id)
                liked_back = False
                if m.profile1_id == p.id:
                    liked_back = m.profile2_response == "interested"
                else:
                    liked_back = m.profile1_response == "interested"
                    
                interested_in.append({
                    "profile_id": target_p.id,
                    "name": target_user.full_name if target_user else "Unknown",
                    "gender": target_p.gender,
                    "city": target_p.city,
                    "photos": target_p.photos,
                    "liked_back": liked_back,
                    "match_status": m.status,
                    "match_id": m.id
                })
        
        if interested_in:
            result.append({
                "profile_id": p.id,
                "name": user.full_name if user else "Unknown",
                "gender": p.gender,
                "city": p.city,
                "age": _calc_age(p.date_of_birth),
                "photos": p.photos,
                "interested_count": len(interested_in),
                "interested_in": interested_in
            })
            
    result.sort(key=lambda x: x["interested_count"], reverse=True)
    return result


@router.post("/admin/matches/{match_id}/notify-suggest")
async def notify_suggest(match_id: str, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    match = await db.get(MatrimonyMatch, match_id)
    if not match:
        raise HTTPException(404, "Match not found")
        
    p1 = await db.get(MatrimonyProfile, match.profile1_id)
    p2 = await db.get(MatrimonyProfile, match.profile2_id)
    
    for p in (p1, p2):
        if p:
            user = await db.get(User, p.user_id)
            if user and user.phone:
                await notify_match_suggested(user.full_name, user.phone)
                
    return {"message": "Notification sent successfully"}


def _serialize_profile(p: MatrimonyProfile, include_sensitive: bool = False) -> dict:
    d = {
        "id": p.id, "status": p.status,
        "date_of_birth": p.date_of_birth, "age": _calc_age(p.date_of_birth),
        "gender": p.gender, "height_cm": p.height_cm,
        "religion": p.religion, "caste": p.caste,
        "city": p.city, "state": p.state, "country": p.country,
        "education": p.education, "occupation": p.occupation,
        "bio": p.bio, "photos": p.photos, "hobbies": p.hobbies,
        "marriage_status": p.marriage_status, "children": p.children,
        "created_at": p.created_at, "updated_at": p.updated_at,
    }
    if include_sensitive:
        d.update({
            "blood_group": p.blood_group, "annual_income": p.annual_income,
            "family_type": p.family_type, "family_status": p.family_status,
            "father_occupation": p.father_occupation, "mother_occupation": p.mother_occupation,
            "id_proof_url": p.id_proof_url, "id_proof_type": p.id_proof_type,
            "biodata_url": p.biodata_url,
            "admin_notes": p.admin_notes, "rejection_reason": p.rejection_reason,
            "values": p.values, "expectations": p.expectations,
        })
    return d


def _calc_age(dob) -> int:
    if not dob:
        return 0
    today = date.today()
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
