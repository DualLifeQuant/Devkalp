from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import Optional, List
from pydantic import BaseModel

from app.database import get_db
from app.models import User, InstagramPost
from app.core.security import get_current_admin

router = APIRouter(prefix="/instagram", tags=["Instagram"])


class InstagramPostCreate(BaseModel):
    post_url: str
    image_url: str
    caption: Optional[str] = None
    likes_count: Optional[int] = 0
    comments_count: Optional[int] = 0
    is_active: bool = True


class InstagramPostUpdate(BaseModel):
    post_url: Optional[str] = None
    image_url: Optional[str] = None
    caption: Optional[str] = None
    likes_count: Optional[int] = None
    comments_count: Optional[int] = None
    is_active: Optional[bool] = None


def _serialize_post(p: InstagramPost) -> dict:
    return {
        "id": p.id,
        "post_url": p.post_url,
        "image_url": p.image_url,
        "caption": p.caption,
        "likes_count": p.likes_count,
        "comments_count": p.comments_count,
        "is_active": p.is_active,
        "created_at": p.created_at.isoformat() if p.created_at else None,
        "updated_at": p.updated_at.isoformat() if p.updated_at else None,
    }


@router.get("/")
async def list_posts(active_only: bool = True, db: AsyncSession = Depends(get_db)):
    q = select(InstagramPost)
    if active_only:
        q = q.where(InstagramPost.is_active == True)
    q = q.order_by(desc(InstagramPost.created_at))
    result = await db.execute(q)
    posts = result.scalars().all()
    return [_serialize_post(p) for p in posts]


@router.post("/", status_code=201)
async def create_post(
    data: InstagramPostCreate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    post = InstagramPost(
        post_url=data.post_url,
        image_url=data.image_url,
        caption=data.caption,
        likes_count=data.likes_count or 0,
        comments_count=data.comments_count or 0,
        is_active=data.is_active,
    )
    db.add(post)
    await db.commit()
    return {"message": "Instagram post added successfully", "id": post.id}


@router.put("/{post_id}")
async def update_post(
    post_id: str,
    data: InstagramPostUpdate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    post = await db.get(InstagramPost, post_id)
    if not post:
        raise HTTPException(404, "Instagram post not found")

    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(post, field, val)

    await db.commit()
    return {"message": "Instagram post updated successfully", "post": _serialize_post(post)}


@router.delete("/{post_id}")
async def delete_post(
    post_id: str,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    post = await db.get(InstagramPost, post_id)
    if not post:
        raise HTTPException(404, "Instagram post not found")

    await db.delete(post)
    await db.commit()
    return {"message": "Instagram post deleted successfully"}
