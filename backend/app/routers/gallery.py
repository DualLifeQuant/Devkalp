from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import Optional, List
from pydantic import BaseModel

from app.database import get_db
from app.models import User, GalleryItem, GalleryCategory
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

# ── Category Schemas ────────────────────────────────────────────

class GalleryCategoryCreate(BaseModel):
    value: str
    label: str
    order_index: Optional[int] = 0


class GalleryCategoryUpdate(BaseModel):
    value: Optional[str] = None
    label: Optional[str] = None
    order_index: Optional[int] = None


def _serialize_category(cat: GalleryCategory) -> dict:
    return {
        "id": cat.id,
        "value": cat.value,
        "label": cat.label,
        "order_index": cat.order_index,
    }


# ── Category Endpoints ──────────────────────────────────────────

@router.get("/categories/")
async def list_gallery_categories(db: AsyncSession = Depends(get_db)):
    q = select(GalleryCategory).order_by(GalleryCategory.order_index, GalleryCategory.label)
    result = await db.execute(q)
    cats = result.scalars().all()
    return [_serialize_category(c) for c in cats]


@router.post("/categories/", status_code=201)
async def create_gallery_category(
    data: GalleryCategoryCreate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    existing = await db.execute(select(GalleryCategory).where(GalleryCategory.value == data.value))
    if existing.scalar_one_or_none():
        raise HTTPException(400, "Category with this value already exists")

    cat = GalleryCategory(value=data.value, label=data.label, order_index=data.order_index or 0)
    db.add(cat)
    await db.commit()
    return {"message": "Category created successfully", "id": cat.id}


@router.put("/categories/{category_id}")
async def update_gallery_category(
    category_id: str,
    data: GalleryCategoryUpdate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    cat = await db.get(GalleryCategory, category_id)
    if not cat:
        raise HTTPException(404, "Category not found")

    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(cat, field, val)

    await db.commit()
    return {"message": "Category updated successfully", "category": _serialize_category(cat)}


@router.delete("/categories/{category_id}")
async def delete_gallery_category(
    category_id: str,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    cat = await db.get(GalleryCategory, category_id)
    if not cat:
        raise HTTPException(404, "Category not found")

    await db.delete(cat)
    await db.commit()
    return {"message": "Category deleted successfully"}
