import re
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import Optional

from app.database import get_db
from app.models import Campaign, CampaignRegistration, CampaignStatus, User
from app.core.security import get_current_user, get_current_admin
from app.utils.storage import upload_image, upload_video

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])


def _slug(title: str) -> str:
    s = title.lower().strip()
    s = re.sub(r'[^\w\s-]', '', s)
    return re.sub(r'[\s_-]+', '-', s).strip('-')


@router.get("/")
async def list_campaigns(category: Optional[str] = None, skip: int = 0, limit: int = 20,
                          db: AsyncSession = Depends(get_db)):
    q = select(Campaign).where(Campaign.status == CampaignStatus.ACTIVE)
    if category:
        q = q.where(Campaign.category == category)
    result = await db.execute(q.order_by(desc(Campaign.created_at)).offset(skip).limit(limit))
    campaigns = result.scalars().all()
    total = await db.scalar(
        select(func.count()).select_from(Campaign).where(Campaign.status == CampaignStatus.ACTIVE)
    ) or 0
    return {"items": [_serialize(c) for c in campaigns], "total": total}


@router.get("/admin/all")
async def admin_list_campaigns(skip: int = 0, limit: int = 50,
                                admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Campaign).order_by(desc(Campaign.created_at)).offset(skip).limit(limit))
    campaigns = result.scalars().all()
    total = await db.scalar(select(func.count()).select_from(Campaign)) or 0
    return {"items": [_serialize(c) for c in campaigns], "total": total}


@router.get("/{slug}")
async def get_campaign(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Campaign).where(Campaign.slug == slug))
    c = result.scalar_one_or_none()
    if not c:
        raise HTTPException(404, "Campaign not found")
    return _serialize(c, full=True)


@router.post("/{campaign_id}/register", status_code=201)
async def register_for_campaign(campaign_id: str, data: dict, db: AsyncSession = Depends(get_db)):
    c = await db.get(Campaign, campaign_id)
    if not c or not c.is_registration_open:
        raise HTTPException(400, "Campaign not available for registration")
    if c.max_registrations and (c.registration_count or 0) >= c.max_registrations:
        raise HTTPException(400, "Campaign is full")
    reg = CampaignRegistration(
        campaign_id=campaign_id, name=data["name"],
        email=data["email"], phone=data["phone"],
        organization=data.get("organization"),
        participant_count=data.get("participant_count", 1),
    )
    db.add(reg)
    c.registration_count = (c.registration_count or 0) + 1
    await db.flush()
    return {"message": "Registered", "id": reg.id}


@router.post("/admin/create", status_code=201)
async def create_campaign(data: dict, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    slug = _slug(data["title"])
    existing = await db.execute(select(Campaign).where(Campaign.slug == slug))
    if existing.scalar_one_or_none():
        slug = f"{slug}-{uuid.uuid4().hex[:6]}"
    
    event_date_val = data.get("event_date")
    if event_date_val and isinstance(event_date_val, str):
        from datetime import datetime
        try:
            event_date_val = datetime.fromisoformat(event_date_val.replace("Z", ""))
        except ValueError:
            event_date_val = None

    c = Campaign(
        title=data["title"], slug=slug,
        category=data.get("category", "general"),
        description=data["description"],
        short_description=data.get("short_description"),
        cover_image=data.get("cover_image"),
        media_gallery=data.get("media_gallery"),
        notes=data.get("notes"),
        venue=data.get("venue"), city=data.get("city"),
        event_date=event_date_val,
        max_registrations=data.get("max_registrations"),
        status=data.get("status", CampaignStatus.ACTIVE.value),
        is_registration_open=data.get("is_registration_open", True),
        created_by=admin.id,
    )
    db.add(c)
    await db.flush()
    return {"message": "Campaign created", "id": c.id, "slug": c.slug}


@router.put("/admin/{campaign_id}")
async def update_campaign(campaign_id: str, data: dict,
                           admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    c = await db.get(Campaign, campaign_id)
    if not c:
        raise HTTPException(404, "Not found")
    allowed = {"title", "description", "short_description", "cover_image", "status",
               "venue", "city", "event_date", "is_registration_open", "media_gallery",
               "impact_stats", "report_url", "max_registrations", "notes"}
    for k, v in data.items():
        if k in allowed:
            if k == "event_date" and isinstance(v, str):
                from datetime import datetime
                try:
                    v = datetime.fromisoformat(v.replace("Z", ""))
                except ValueError:
                    v = None
            setattr(c, k, v)
    return {"message": "Updated"}


@router.post("/admin/upload-image")
async def upload_campaign_image(
    file: UploadFile = File(...),
    admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    url = await upload_image(file, "campaigns", f"campaign_{uuid.uuid4().hex[:6]}")
    return {"url": url}


@router.post("/admin/upload-video")
async def upload_campaign_video(
    file: UploadFile = File(...),
    admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    url = await upload_video(file, "campaigns", f"campaign_video_{uuid.uuid4().hex[:6]}")
    return {"url": url}


@router.get("/admin/registrations/{campaign_id}")
async def campaign_registrations(campaign_id: str, admin=Depends(get_current_admin),
                                   db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CampaignRegistration).where(CampaignRegistration.campaign_id == campaign_id)
    )
    regs = result.scalars().all()
    return [{"id": r.id, "name": r.name, "email": r.email, "phone": r.phone,
             "organization": r.organization, "participant_count": r.participant_count,
             "attended": r.attended, "created_at": r.created_at} for r in regs]


def _serialize(c: Campaign, full: bool = False) -> dict:
    d = {
        "id": c.id, "title": c.title, "slug": c.slug, "category": c.category,
        "cover_image": c.cover_image, "short_description": c.short_description,
        "city": c.city, "event_date": c.event_date, "status": c.status,
        "registration_count": c.registration_count or 0,
        "is_registration_open": c.is_registration_open,
        "max_registrations": c.max_registrations,
        "created_at": c.created_at,
    }
    if full:
        d.update({"description": c.description, "venue": c.venue,
                  "media_gallery": c.media_gallery, "impact_stats": c.impact_stats,
                  "notes": c.notes})
    return d
