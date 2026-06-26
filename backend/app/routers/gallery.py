from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import Optional, List
from pydantic import BaseModel

from app.database import get_db
from app.models import User, GalleryItem
from app.core.security import get_current_admin

router = APIRouter(prefix="/gallery", tags=["Gallery"])


class GalleryItemCreate(BaseModel):
    title: Optional[str] = ""
    description: Optional[str] = None
    image_url: str
    category: Optional[str] = None
    is_active: bool = True


class GalleryItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None


def _serialize_gallery_item(item: GalleryItem) -> dict:
    return {
        "id": item.id,
        "title": item.title,
        "description": item.description,
        "image_url": item.image_url,
        "category": item.category,
        "is_active": item.is_active,
        "created_at": item.created_at.isoformat() if item.created_at else None,
        "updated_at": item.updated_at.isoformat() if item.updated_at else None,
    }


@router.get("/")
async def list_gallery_items(
    active_only: bool = True,
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    q = select(GalleryItem)
    if active_only:
        q = q.where(GalleryItem.is_active == True)
    if category:
        q = q.where(GalleryItem.category == category)
    q = q.order_by(desc(GalleryItem.created_at))
    result = await db.execute(q)
    items = result.scalars().all()
    return [_serialize_gallery_item(item) for item in items]


@router.post("/", status_code=201)
async def create_gallery_item(
    data: GalleryItemCreate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    item = GalleryItem(
        title=data.title or "",
        description=data.description,
        image_url=data.image_url,
        category=data.category,
        is_active=data.is_active,
    )
    db.add(item)
    await db.commit()
    return {"message": "Gallery item created successfully", "id": item.id}


@router.put("/{item_id}")
async def update_gallery_item(
    item_id: str,
    data: GalleryItemUpdate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    item = await db.get(GalleryItem, item_id)
    if not item:
        raise HTTPException(404, "Gallery item not found")

    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(item, field, val)

    await db.commit()
    return {"message": "Gallery item updated successfully", "item": _serialize_gallery_item(item)}


@router.delete("/{item_id}")
async def delete_gallery_item(
    item_id: str,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    item = await db.get(GalleryItem, item_id)
    if not item:
        raise HTTPException(404, "Gallery item not found")

    await db.delete(item)
    await db.commit()
    return {"message": "Gallery item deleted successfully"}
