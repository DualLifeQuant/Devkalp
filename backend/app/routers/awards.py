from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.models import User, Award
from app.core.security import get_current_admin

router = APIRouter(prefix="/awards", tags=["Awards"])


class AwardCreate(BaseModel):
    title: str
    issuer: Optional[str] = None
    date_given: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    link: Optional[str] = None
    is_active: bool = True


class AwardUpdate(BaseModel):
    title: Optional[str] = None
    issuer: Optional[str] = None
    date_given: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    link: Optional[str] = None
    is_active: Optional[bool] = None


def _serialize_award(a: Award) -> dict:
    return {
        "id": a.id,
        "title": a.title,
        "issuer": a.issuer,
        "date_given": a.date_given,
        "description": a.description,
        "image_url": a.image_url,
        "link": a.link,
        "is_active": a.is_active,
        "created_at": a.created_at.isoformat() if a.created_at else None,
    }


@router.get("/")
async def list_awards(active_only: bool = True, db: AsyncSession = Depends(get_db)):
    q = select(Award)
    if active_only:
        q = q.where(Award.is_active == True)
    q = q.order_by(desc(Award.created_at))
    result = await db.execute(q)
    awards = result.scalars().all()
    return [_serialize_award(a) for a in awards]


@router.post("/", status_code=201)
async def create_award(
    data: AwardCreate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    award = Award(
        title=data.title,
        issuer=data.issuer,
        date_given=data.date_given,
        description=data.description,
        image_url=data.image_url,
        link=data.link,
        is_active=data.is_active,
    )
    db.add(award)
    await db.commit()
    return {"message": "Award created successfully", "id": award.id}


@router.put("/{award_id}")
async def update_award(
    award_id: str,
    data: AwardUpdate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    award = await db.get(Award, award_id)
    if not award:
        raise HTTPException(404, "Award not found")

    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(award, field, val)

    await db.commit()
    return {"message": "Award updated successfully", "award": _serialize_award(award)}


@router.delete("/{award_id}")
async def delete_award(
    award_id: str,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    award = await db.get(Award, award_id)
    if not award:
        raise HTTPException(404, "Award not found")

    await db.delete(award)
    await db.commit()
    return {"message": "Award deleted successfully"}
