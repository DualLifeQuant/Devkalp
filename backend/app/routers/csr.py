from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from datetime import datetime

from app.database import get_db
from app.models import User, CSRInquiry
from app.core.security import get_current_admin

router = APIRouter(prefix="/csr", tags=["CSR"])


class CSRInquiryCreate(BaseModel):
    company_name: str
    contact_person: str
    email: EmailStr
    phone: Optional[str] = None
    proposed_budget: Optional[str] = None
    interest_areas: Optional[List[str]] = None
    message: str


def _serialize_inquiry(i: CSRInquiry) -> dict:
    return {
        "id": i.id,
        "company_name": i.company_name,
        "contact_person": i.contact_person,
        "email": i.email,
        "phone": i.phone,
        "proposed_budget": i.proposed_budget,
        "interest_areas": i.interest_areas,
        "message": i.message,
        "created_at": i.created_at.isoformat() if i.created_at else None,
    }


@router.post("/", status_code=201)
async def create_csr_inquiry(data: CSRInquiryCreate, db: AsyncSession = Depends(get_db)):
    inquiry = CSRInquiry(
        company_name=data.company_name,
        contact_person=data.contact_person,
        email=data.email,
        phone=data.phone,
        proposed_budget=data.proposed_budget,
        interest_areas=data.interest_areas,
        message=data.message,
    )
    db.add(inquiry)
    await db.commit()
    return {"message": "Inquiry submitted successfully", "id": inquiry.id}


@router.get("/")
async def list_csr_inquiries(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    q = select(CSRInquiry).order_by(desc(CSRInquiry.created_at))
    result = await db.execute(q)
    inquiries = result.scalars().all()
    return [_serialize_inquiry(i) for i in inquiries]
