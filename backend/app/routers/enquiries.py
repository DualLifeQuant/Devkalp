from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from datetime import datetime

from app.database import get_db
from app.models import Enquiry, User
from app.core.security import get_current_admin

router = APIRouter(prefix="/enquiries", tags=["Enquiries"])


class EnquiryCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    enquiry_type: str = "general"
    message: str


def _serialize_enquiry(e: Enquiry) -> dict:
    return {
        "id": e.id,
        "name": e.name,
        "email": e.email,
        "phone": e.phone,
        "enquiry_type": e.enquiry_type,
        "message": e.message,
        "created_at": e.created_at.isoformat() if e.created_at else None,
    }


@router.post("/", status_code=201)
async def create_enquiry(data: EnquiryCreate, db: AsyncSession = Depends(get_db)):
    enquiry = Enquiry(
        name=data.name,
        email=data.email,
        phone=data.phone,
        enquiry_type=data.enquiry_type,
        message=data.message,
    )
    db.add(enquiry)
    await db.commit()
    return {"message": "Message sent successfully", "id": enquiry.id}


@router.get("/")
async def admin_list_enquiries(
    enquiry_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    q = select(Enquiry)
    if enquiry_type and enquiry_type != "all":
        q = q.where(Enquiry.enquiry_type == enquiry_type)
    
    result = await db.execute(q.order_by(desc(Enquiry.created_at)).offset(skip).limit(limit))
    enquiries = result.scalars().all()
    
    total = await db.scalar(
        select(func.count()).select_from(Enquiry).where(
            Enquiry.enquiry_type == enquiry_type if enquiry_type and enquiry_type != "all" else True
        )
    ) or 0
    
    return {"items": [_serialize_enquiry(e) for e in enquiries], "total": total}


@router.delete("/{enquiry_id}")
async def admin_delete_enquiry(
    enquiry_id: str,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    enquiry = await db.get(Enquiry, enquiry_id)
    if not enquiry:
        raise HTTPException(404, "Message not found")
    
    await db.delete(enquiry)
    await db.commit()
    return {"message": "Message deleted successfully"}
