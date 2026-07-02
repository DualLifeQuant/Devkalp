from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.models import User, PressMention
from app.core.security import get_current_admin

router = APIRouter(prefix="/press", tags=["Press Mentions"])


class PressMentionCreate(BaseModel):
    title: str
    publisher_name: str
    logo_url: Optional[str] = None
    article_url: Optional[str] = None
    publish_date: Optional[str] = None
    summary: Optional[str] = None
    is_active: bool = True


class PressMentionUpdate(BaseModel):
    title: Optional[str] = None
    publisher_name: Optional[str] = None
    logo_url: Optional[str] = None
    article_url: Optional[str] = None
    publish_date: Optional[str] = None
    summary: Optional[str] = None
    is_active: Optional[bool] = None


def _serialize_press(p: PressMention) -> dict:
    return {
        "id": p.id,
        "title": p.title,
        "publisher_name": p.publisher_name,
        "logo_url": p.logo_url,
        "article_url": p.article_url,
        "publish_date": p.publish_date,
        "summary": p.summary,
        "is_active": p.is_active,
        "created_at": p.created_at.isoformat() if p.created_at else None,
    }


@router.get("/")
async def list_press_mentions(active_only: bool = True, db: AsyncSession = Depends(get_db)):
    q = select(PressMention)
    if active_only:
        q = q.where(PressMention.is_active == True)
    q = q.order_by(desc(PressMention.created_at))
    result = await db.execute(q)
    mentions = result.scalars().all()
    return [_serialize_press(p) for p in mentions]


@router.post("/", status_code=201)
async def create_press_mention(
    data: PressMentionCreate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    mention = PressMention(
        title=data.title,
        publisher_name=data.publisher_name,
        logo_url=data.logo_url,
        article_url=data.article_url,
        publish_date=data.publish_date,
        summary=data.summary,
        is_active=data.is_active,
    )
    db.add(mention)
    await db.commit()
    return {"message": "Press mention created successfully", "id": mention.id}


@router.put("/{mention_id}")
async def update_press_mention(
    mention_id: str,
    data: PressMentionUpdate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    mention = await db.get(PressMention, mention_id)
    if not mention:
        raise HTTPException(404, "Press mention not found")

    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(mention, field, val)

    await db.commit()
    return {"message": "Press mention updated successfully", "press_mention": _serialize_press(mention)}


@router.delete("/{mention_id}")
async def delete_press_mention(
    mention_id: str,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    mention = await db.get(PressMention, mention_id)
    if not mention:
        raise HTTPException(404, "Press mention not found")

    await db.delete(mention)
    await db.commit()
    return {"message": "Press mention deleted successfully"}
