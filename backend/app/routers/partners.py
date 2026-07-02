from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import Optional, List
from pydantic import BaseModel

from app.database import get_db
from app.models import User, Partner
from app.core.security import get_current_admin

router = APIRouter(prefix="/partners", tags=["Partners"])


class PartnerCreate(BaseModel):
    name: str
    logo_url: str
    website_url: Optional[str] = None
    is_active: bool = True


class PartnerUpdate(BaseModel):
    name: Optional[str] = None
    logo_url: Optional[str] = None
    website_url: Optional[str] = None
    is_active: Optional[bool] = None


def _serialize_partner(p: Partner) -> dict:
    return {
        "id": p.id,
        "name": p.name,
        "logo_url": p.logo_url,
        "website_url": p.website_url,
        "is_active": p.is_active,
        "created_at": p.created_at.isoformat() if p.created_at else None,
        "updated_at": p.updated_at.isoformat() if p.updated_at else None,
    }


@router.get("/")
async def list_partners(active_only: bool = True, db: AsyncSession = Depends(get_db)):
    q = select(Partner)
    if active_only:
        q = q.where(Partner.is_active == True)
    q = q.order_by(desc(Partner.created_at))
    result = await db.execute(q)
    partners = result.scalars().all()
    return [_serialize_partner(p) for p in partners]


@router.post("/", status_code=201)
async def create_partner(
    data: PartnerCreate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    partner = Partner(
        name=data.name,
        logo_url=data.logo_url,
        website_url=data.website_url,
        is_active=data.is_active,
    )
    db.add(partner)
    await db.commit()
    return {"message": "Partner created successfully", "id": partner.id}


@router.put("/{partner_id}")
async def update_partner(
    partner_id: str,
    data: PartnerUpdate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    partner = await db.get(Partner, partner_id)
    if not partner:
        raise HTTPException(404, "Partner not found")

    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(partner, field, val)

    await db.commit()
    return {"message": "Partner updated successfully", "partner": _serialize_partner(partner)}


@router.delete("/{partner_id}")
async def delete_partner(
    partner_id: str,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    partner = await db.get(Partner, partner_id)
    if not partner:
        raise HTTPException(404, "Partner not found")

    await db.delete(partner)
    await db.commit()
    return {"message": "Partner deleted successfully"}
