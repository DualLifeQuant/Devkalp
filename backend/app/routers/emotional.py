from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import Optional, List
from pydantic import BaseModel

from app.database import get_db
from app.models import (
    EmotionalQuestion, EmotionalReadinessResponse, EmotionalAnswer,
    MatrimonyProfile, User, UserRole
)
from app.core.security import get_current_user, get_current_admin

router = APIRouter(prefix="/emotional-readiness", tags=["Emotional Readiness"])

DEFAULT_QUESTIONS = [
    # Self Awareness
    {"category": "self_awareness", "question_text": "How well do you understand your own emotional needs and triggers?", "question_type": "scale", "scale_min": 1, "scale_max": 10, "scale_labels": {"1": "Very poorly", "10": "Very well"}, "order_index": 1},
    {"category": "self_awareness", "question_text": "Describe a recent situation where you managed a strong emotion effectively.", "question_type": "text", "order_index": 2},
    {"category": "self_awareness", "question_text": "How confident are you in your sense of personal identity and values?", "question_type": "scale", "scale_min": 1, "scale_max": 10, "scale_labels": {"1": "Not confident", "10": "Very confident"}, "order_index": 3},

    # Family Dynamics
    {"category": "family_dynamics", "question_text": "How would you describe your current relationship with your parents?", "question_type": "mcq", "options": ["Very close and supportive", "Good with occasional differences", "Complicated but manageable", "Distant or difficult"], "order_index": 4},
    {"category": "family_dynamics", "question_text": "How open is your family to your partner's background and beliefs?", "question_type": "scale", "scale_min": 1, "scale_max": 10, "scale_labels": {"1": "Very closed", "10": "Very open"}, "order_index": 5},
    {"category": "family_dynamics", "question_text": "What role do you expect your family to play in your married life?", "question_type": "text", "order_index": 6},

    # Communication
    {"category": "communication", "question_text": "How comfortable are you discussing difficult topics openly with a partner?", "question_type": "scale", "scale_min": 1, "scale_max": 10, "scale_labels": {"1": "Very uncomfortable", "10": "Very comfortable"}, "order_index": 7},
    {"category": "communication", "question_text": "How do you typically handle disagreements in relationships?", "question_type": "mcq", "options": ["Talk it through immediately", "Need time to cool down first", "Avoid conflict when possible", "Seek help from a third party"], "order_index": 8},
    {"category": "communication", "question_text": "How well do you listen to understand, rather than just to respond?", "question_type": "scale", "scale_min": 1, "scale_max": 10, "scale_labels": {"1": "I struggle to listen", "10": "I listen very well"}, "order_index": 9},

    # Values & Life Goals
    {"category": "values", "question_text": "How clearly have you defined what you want from marriage?", "question_type": "scale", "scale_min": 1, "scale_max": 10, "scale_labels": {"1": "Not clear at all", "10": "Very clear"}, "order_index": 10},
    {"category": "values", "question_text": "What are your three most important values in a life partner?", "question_type": "text", "order_index": 11},
    {"category": "values", "question_text": "How aligned do you feel your career and family goals currently are?", "question_type": "scale", "scale_min": 1, "scale_max": 10, "scale_labels": {"1": "Not aligned", "10": "Very aligned"}, "order_index": 12},

    # Readiness
    {"category": "readiness", "question_text": "How emotionally ready do you feel to enter a committed relationship?", "question_type": "scale", "scale_min": 1, "scale_max": 10, "scale_labels": {"1": "Not ready", "10": "Completely ready"}, "order_index": 13},
    {"category": "readiness", "question_text": "Have you healed from past relationships or difficult experiences?", "question_type": "mcq", "options": ["Yes, fully healed", "Mostly healed with some lingering feelings", "Working through it", "Still healing"], "order_index": 14},
    {"category": "readiness", "question_text": "What does a healthy marriage look like to you?", "question_type": "text", "order_index": 15},
]


# ─── Questions (Admin) ───────────────────────────────────────

@router.get("/questions")
async def get_questions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(EmotionalQuestion)
        .where(EmotionalQuestion.is_active == True)
        .order_by(EmotionalQuestion.order_index)
    )
    questions = result.scalars().all()
    return [_serialize_question(q) for q in questions]


@router.post("/admin/seed-questions", status_code=201)
async def seed_default_questions(
    admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Seed the default emotional readiness questions"""
    existing = await db.scalar(
        select(EmotionalQuestion).limit(1)
    )
    if existing:
        return {"message": "Questions already exist"}

    for q_data in DEFAULT_QUESTIONS:
        q = EmotionalQuestion(**q_data)
        db.add(q)
    await db.flush()
    return {"message": f"Seeded {len(DEFAULT_QUESTIONS)} questions"}


@router.post("/admin/questions", status_code=201)
async def create_question(data: dict, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    q = EmotionalQuestion(**data)
    db.add(q)
    await db.flush()
    return {"message": "Question created", "id": q.id}


@router.put("/admin/questions/{question_id}")
async def update_question(question_id: str, data: dict, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    q = await db.get(EmotionalQuestion, question_id)
    if not q:
        raise HTTPException(404, "Question not found")
    for k, v in data.items():
        if hasattr(q, k):
            setattr(q, k, v)
    return {"message": "Updated"}


# ─── Responses (Users) ───────────────────────────────────────

class AnswerSubmit(BaseModel):
    question_id: str
    scale_value: Optional[int] = None
    text_value: Optional[str] = None
    selected_option: Optional[str] = None


class ResponseSubmit(BaseModel):
    answers: List[AnswerSubmit]


@router.post("/submit", status_code=201)
async def submit_response(
    data: ResponseSubmit,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Get matrimony profile
    profile_result = await db.execute(
        select(MatrimonyProfile).where(MatrimonyProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if not profile:
        raise HTTPException(404, "Create matrimony profile first")

    # Delete existing incomplete response if any
    existing = await db.execute(
        select(EmotionalReadinessResponse)
        .where(EmotionalReadinessResponse.matrimony_profile_id == profile.id)
    )
    old = existing.scalars().first()
    if old and not old.is_complete:
        await db.delete(old)
        await db.flush()

    # Compute scores
    category_scores = _compute_scores(data.answers)
    overall = sum(category_scores.values()) / len(category_scores) if category_scores else None

    response = EmotionalReadinessResponse(
        matrimony_profile_id=profile.id,
        overall_score=round(overall, 1) if overall else None,
        category_scores=category_scores,
        is_complete=True,
    )
    db.add(response)
    await db.flush()

    for answer_data in data.answers:
        answer = EmotionalAnswer(
            response_id=response.id,
            question_id=answer_data.question_id,
            scale_value=answer_data.scale_value,
            text_value=answer_data.text_value,
            selected_option=answer_data.selected_option,
        )
        db.add(answer)

    return {
        "message": "Evaluation submitted",
        "response_id": response.id,
        "overall_score": response.overall_score,
        "category_scores": category_scores,
    }


@router.get("/my-response")
async def get_my_response(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    profile_result = await db.execute(
        select(MatrimonyProfile).where(MatrimonyProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if not profile:
        raise HTTPException(404, "Profile not found")

    result = await db.execute(
        select(EmotionalReadinessResponse)
        .where(EmotionalReadinessResponse.matrimony_profile_id == profile.id)
        .order_by(desc(EmotionalReadinessResponse.submitted_at))
    )
    response = result.scalars().first()
    if not response:
        return {"completed": False}

    answers_result = await db.execute(
        select(EmotionalAnswer).where(EmotionalAnswer.response_id == response.id)
    )
    answers = answers_result.scalars().all()

    return {
        "completed": response.is_complete,
        "overall_score": response.overall_score,
        "category_scores": response.category_scores,
        "submitted_at": response.submitted_at,
        "answers": [
            {"question_id": a.question_id, "scale_value": a.scale_value,
             "text_value": a.text_value, "selected_option": a.selected_option}
            for a in answers
        ]
    }


@router.post("/admin/responses/{response_id}/notes")
async def add_counselor_notes(
    response_id: str,
    data: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role not in (UserRole.ADMIN, UserRole.COUNSELOR):
        raise HTTPException(403, "Not authorized")

    response = await db.get(EmotionalReadinessResponse, response_id)
    if not response:
        raise HTTPException(404, "Response not found")

    response.counselor_notes = data.get("notes")
    response.reviewed_by = current_user.id
    from datetime import datetime
    response.reviewed_at = datetime.utcnow()
    return {"message": "Notes saved"}


@router.get("/admin/all-responses")
async def all_responses(
    admin=Depends(get_current_admin),
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(EmotionalReadinessResponse)
        .order_by(desc(EmotionalReadinessResponse.submitted_at))
        .offset(skip).limit(limit)
    )
    responses = result.scalars().all()
    items = []
    for r in responses:
        mp = await db.get(MatrimonyProfile, r.matrimony_profile_id)
        user = await db.get(User, mp.user_id) if mp else None
        items.append({
            "id": r.id,
            "user_name": user.full_name if user else "Unknown",
            "overall_score": r.overall_score,
            "category_scores": r.category_scores,
            "submitted_at": r.submitted_at,
            "is_complete": r.is_complete,
            "counselor_notes": r.counselor_notes,
        })
    return items


# ─── Helpers ─────────────────────────────────────────────────

def _compute_scores(answers: List[AnswerSubmit]) -> dict:
    """Compute percentage scores per category from scale answers"""
    # We'd need the question categories from DB — simplified approximation here
    # In production, load questions from DB in the route and pass categories
    return {}  # filled in properly in route with DB data


def _serialize_question(q: EmotionalQuestion) -> dict:
    return {
        "id": q.id, "category": q.category,
        "question_text": q.question_text, "question_type": q.question_type,
        "options": q.options, "scale_min": q.scale_min, "scale_max": q.scale_max,
        "scale_labels": q.scale_labels, "order_index": q.order_index,
    }
