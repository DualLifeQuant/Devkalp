from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import Optional
from pydantic import BaseModel
from datetime import datetime
import uuid

from app.database import get_db
from app.models import (
    Donation, DonationCampaign, DonationStatus, CampaignStatus, User
)
from app.core.security import get_current_user, get_current_admin
from app.core.email import send_email
from app.core.notifications import notify_donation_received
from app.config import settings

router = APIRouter(prefix="/donations", tags=["Donations"])


def _make_slug(title: str) -> str:
    import re
    s = title.lower().strip()
    s = re.sub(r'[^\w\s-]', '', s)
    s = re.sub(r'[\s_-]+', '-', s)
    return s.strip('-')


def get_razorpay():
    if not settings.RAZORPAY_KEY_ID:
        return None
    try:
        import razorpay
        return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
    except Exception:
        return None


class DonateRequest(BaseModel):
    amount: float
    campaign_id: Optional[str] = None
    donor_name: Optional[str] = None
    donor_email: Optional[str] = None
    donor_phone: Optional[str] = None
    donor_pan: Optional[str] = None
    is_anonymous: bool = False
    message: Optional[str] = None


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


# ── Campaign Routes ───────────────────────────────────────────

@router.get("/campaigns")
async def list_campaigns(skip: int = 0, limit: int = 20, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(DonationCampaign)
        .where(DonationCampaign.status == CampaignStatus.ACTIVE)
        .order_by(desc(DonationCampaign.created_at))
        .offset(skip).limit(limit)
    )
    campaigns = result.scalars().all()
    total = await db.scalar(
        select(func.count()).select_from(DonationCampaign)
        .where(DonationCampaign.status == CampaignStatus.ACTIVE)
    ) or 0
    return {"items": [_serialize_campaign(c) for c in campaigns], "total": total}


@router.get("/campaigns/{slug}")
async def get_campaign(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DonationCampaign).where(DonationCampaign.slug == slug))
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(404, "Campaign not found")
    return _serialize_campaign(campaign, full=True)


@router.post("/campaigns", status_code=201)
async def create_campaign(data: dict, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    slug = _make_slug(data["title"])
    existing = await db.execute(select(DonationCampaign).where(DonationCampaign.slug == slug))
    if existing.scalar_one_or_none():
        slug = f"{slug}-{uuid.uuid4().hex[:6]}"
    c = DonationCampaign(
        title=data["title"], slug=slug,
        description=data["description"],
        short_description=data.get("short_description"),
        target_amount=data.get("target_amount"),
        start_date=data.get("start_date"),
        end_date=data.get("end_date"),
        created_by=admin.id,
    )
    db.add(c)
    await db.flush()
    return {"message": "Campaign created", "id": c.id, "slug": c.slug}


@router.put("/campaigns/{campaign_id}")
async def update_campaign(campaign_id: str, data: dict, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    c = await db.get(DonationCampaign, campaign_id)
    if not c:
        raise HTTPException(404, "Campaign not found")
    allowed = {"title", "description", "short_description", "cover_image",
               "target_amount", "status", "impact_report", "media_urls"}
    for k, v in data.items():
        if k in allowed:
            setattr(c, k, v)
    return {"message": "Updated"}


# ── Donation Flow ─────────────────────────────────────────────

@router.post("/initiate")
async def initiate_donation(data: DonateRequest, request: Request, db: AsyncSession = Depends(get_db)):
    if data.amount < 1:
        raise HTTPException(400, "Minimum donation is ₹1")

    # Optional auth
    current_user = None
    try:
        from app.core.security import verify_token
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            payload = verify_token(auth[7:])
            if payload:
                r = await db.execute(select(User).where(User.id == payload["sub"]))
                current_user = r.scalar_one_or_none()
    except Exception:
        pass

    receipt_number = f"DKF-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"
    razorpay_order_id = f"order_DEV_{uuid.uuid4().hex[:16]}"

    client = get_razorpay()
    if client:
        try:
            order = client.order.create({
                "amount": int(data.amount * 100),
                "currency": "INR",
                "receipt": receipt_number,
            })
            razorpay_order_id = order["id"]
        except Exception as e:
            raise HTTPException(500, f"Payment gateway error: {e}")

    donation = Donation(
        donor_id=current_user.id if current_user else None,
        campaign_id=data.campaign_id,
        amount=data.amount,
        status=DonationStatus.PENDING,
        razorpay_order_id=razorpay_order_id,
        donor_name=data.donor_name or (current_user.full_name if current_user else "Anonymous"),
        donor_email=data.donor_email or (current_user.email if current_user else None),
        donor_phone=data.donor_phone or (current_user.phone if current_user else None),
        donor_pan=data.donor_pan,
        is_anonymous=data.is_anonymous,
        message=data.message,
        receipt_number=receipt_number,
    )
    db.add(donation)
    await db.flush()

    return {
        "order_id": razorpay_order_id,
        "donation_id": donation.id,
        "amount": data.amount,
        "currency": "INR",
        "key_id": settings.RAZORPAY_KEY_ID or "rzp_test_demo",
        "receipt_number": receipt_number,
    }


@router.post("/verify-payment")
async def verify_payment(data: VerifyPaymentRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Donation).where(Donation.razorpay_order_id == data.razorpay_order_id))
    donation = result.scalar_one_or_none()
    if not donation:
        raise HTTPException(404, "Donation not found")

    client = get_razorpay()
    if client and settings.RAZORPAY_KEY_SECRET:
        try:
            client.utility.verify_payment_signature({
                "razorpay_order_id": data.razorpay_order_id,
                "razorpay_payment_id": data.razorpay_payment_id,
                "razorpay_signature": data.razorpay_signature,
            })
        except Exception:
            donation.status = DonationStatus.FAILED
            raise HTTPException(400, "Payment signature verification failed")

    donation.status = DonationStatus.COMPLETED
    donation.razorpay_payment_id = data.razorpay_payment_id
    donation.razorpay_signature = data.razorpay_signature

    campaign_name = "General Fund"
    if donation.campaign_id:
        campaign = await db.get(DonationCampaign, donation.campaign_id)
        if campaign:
            campaign.collected_amount = (campaign.collected_amount or 0) + donation.amount
            campaign_name = campaign.title

    if donation.donor_email:
        await send_email(donation.donor_email, "donation_receipt", {
            "donor_name": donation.donor_name or "Friend",
            "receipt_number": donation.receipt_number,
            "amount": f"{donation.amount:,.0f}",
            "campaign_name": campaign_name,
            "donation_date": datetime.now().strftime("%d %B %Y"),
            "payment_id": data.razorpay_payment_id,
        })
    if donation.donor_phone:
        await notify_donation_received(
            donation.donor_name or "Friend", donation.donor_phone,
            donation.amount, campaign_name, donation.receipt_number,
        )

    return {"message": "Payment verified", "receipt_number": donation.receipt_number, "amount": donation.amount}


# Mock verify for dev (no Razorpay keys)
@router.post("/mock-complete")
async def mock_complete_donation(data: dict, db: AsyncSession = Depends(get_db)):
    """Dev-only: mark a pending donation as completed without real payment."""
    donation_id = data.get("donation_id")
    result = await db.execute(select(Donation).where(Donation.id == donation_id))
    donation = result.scalar_one_or_none()
    if not donation:
        raise HTTPException(404, "Donation not found")
    donation.status = DonationStatus.COMPLETED
    donation.razorpay_payment_id = f"pay_MOCK_{uuid.uuid4().hex[:12]}"
    if donation.campaign_id:
        campaign = await db.get(DonationCampaign, donation.campaign_id)
        if campaign:
            campaign.collected_amount = (campaign.collected_amount or 0) + donation.amount
    return {"message": "Mock payment completed", "receipt_number": donation.receipt_number}


@router.get("/my-donations")
async def get_my_donations(current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Donation).where(Donation.donor_id == current_user.id).order_by(desc(Donation.created_at))
    )
    donations = result.scalars().all()
    total = sum(d.amount for d in donations if d.status == DonationStatus.COMPLETED)
    return {"donations": [_serialize_donation(d) for d in donations], "total_donated": total}


@router.get("/transparency")
async def transparency_report(db: AsyncSession = Depends(get_db)):
    campaigns_r = await db.execute(select(DonationCampaign).where(DonationCampaign.status == CampaignStatus.ACTIVE))
    total_collected = await db.scalar(
        select(func.sum(Donation.amount)).where(Donation.status == DonationStatus.COMPLETED)
    ) or 0
    total_donors = await db.scalar(
        select(func.count(func.distinct(Donation.donor_id))).where(Donation.status == DonationStatus.COMPLETED)
    ) or 0
    return {
        "total_collected": total_collected,
        "total_donors": total_donors,
        "campaigns": [_serialize_campaign(c, full=True) for c in campaigns_r.scalars().all()],
    }


@router.get("/admin/all")
async def admin_all_donations(skip: int = 0, limit: int = 50, status: Optional[str] = None,
                               admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    q = select(Donation).order_by(desc(Donation.created_at))
    if status:
        q = q.where(Donation.status == status)
    result = await db.execute(q.offset(skip).limit(limit))
    donations = result.scalars().all()
    total = await db.scalar(select(func.count()).select_from(Donation)) or 0
    total_amount = await db.scalar(
        select(func.sum(Donation.amount)).where(Donation.status == DonationStatus.COMPLETED)
    ) or 0
    return {"items": [_serialize_donation(d) for d in donations], "total": total, "total_amount": total_amount}


def _serialize_campaign(c: DonationCampaign, full: bool = False) -> dict:
    d = {
        "id": c.id, "title": c.title, "slug": c.slug,
        "short_description": c.short_description, "cover_image": c.cover_image,
        "target_amount": c.target_amount, "collected_amount": c.collected_amount or 0,
        "status": c.status, "start_date": c.start_date, "end_date": c.end_date,
        "progress_pct": round((c.collected_amount or 0) / c.target_amount * 100, 1) if c.target_amount else None,
    }
    if full:
        d.update({"description": c.description, "used_amount": c.used_amount,
                  "impact_report": c.impact_report, "media_urls": c.media_urls})
    return d


def _serialize_donation(d: Donation) -> dict:
    return {
        "id": d.id, "amount": d.amount, "status": d.status,
        "receipt_number": d.receipt_number, "donor_name": d.donor_name,
        "campaign_id": d.campaign_id, "message": d.message,
        "created_at": d.created_at, "razorpay_payment_id": d.razorpay_payment_id,
    }
