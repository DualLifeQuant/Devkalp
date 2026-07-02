from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_
from typing import Optional, List
from pydantic import BaseModel
from datetime import date, datetime
import re
import html as html_module

from app.database import get_db
from app.models import Job, JobApplication, User, JobStatus, ApplicationStatus, GeneralApplication
from app.core.security import get_current_user, get_current_admin
from app.core.email import send_email
from app.core.notifications import notify_interview_scheduled
from app.utils.storage import upload_resume, upload_document

router = APIRouter(prefix="/jobs", tags=["Jobs"])

def _clean_html(raw: Optional[str]) -> Optional[str]:
    """ERPNext rich-text fields આવે છે HTML સાથે (Quill editor).
    Tags કાઢી, paragraph breaks ને newline માં convert કરીને plain text બનાવે છે."""
    if not raw:
        return raw
    text = raw
    text = re.sub(r'</p\s*>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'<br\s*/?>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'<[^>]+>', '', text)
    text = html_module.unescape(text)
    text = re.sub(r'\n\s*\n+', '\n', text)
    return text.strip()


def _clean_skills(raw: Optional[str]) -> Optional[str]:
    """Skills field માંથી HTML કાઢીને comma-separated plain text બનાવે છે."""
    if not raw:
        return raw
    cleaned = _clean_html(raw)
    return cleaned.replace('\n', ',') if cleaned else cleaned


class JobCreate(BaseModel):
    title: str
    department: Optional[str] = None
    location: str
    job_type: str
    experience_min: int = 0
    experience_max: Optional[int] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    description: str
    requirements: str
    responsibilities: str
    skills_required: Optional[List[str]] = None
    positions: int = 1
    application_deadline: Optional[date] = None


class ApplicationCreate(BaseModel):
    cover_letter: Optional[str] = None
    expected_salary: Optional[int] = None
    notice_period_days: Optional[int] = None


class GeneralApplicationCreate(BaseModel):
    name: str
    email: str
    phone: str
    desired_job_title: str
    department: Optional[str] = None
    experience_years: int = 0
    expected_salary: Optional[int] = None
    skills: Optional[str] = None
    resume_url: Optional[str] = None
    notes: Optional[str] = None


class ScheduleInterview(BaseModel):
    application_id: str
    interview_date: datetime
    interview_mode: str
    interview_link: Optional[str] = None
    interview_location: Optional[str] = None
    interviewer_name: Optional[str] = None

class ERPNextJobWebhook(BaseModel):
    name: str
    job_title: Optional[str] = None
    designation: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    custom_positions: Optional[int] = None
    description: Optional[str] = None
    custom_requirements: Optional[str] = None
    custom_responsibilities_: Optional[str] = None
    custom_required_skills: Optional[str] = None
    custom_min_experience_year: Optional[float] = None
    custom_max_experience_year: Optional[float] = None
    custom_min_salary: Optional[float] = None
    custom_max_salary: Optional[float] = None
    custom_application_deadline: Optional[str] = None
    status: Optional[str] = None

# ── Public ─────────────────────────────────────────────────────

@router.get("/")
async def list_jobs(skip: int = 0, limit: int = 20,
                    job_type: Optional[str] = None, location: Optional[str] = None,
                    db: AsyncSession = Depends(get_db)):
    q = select(Job).where(Job.status == JobStatus.OPEN)
    if job_type:
        q = q.where(Job.job_type == job_type)
    if location:
        q = q.where(Job.location.ilike(f"%{location}%"))
    result = await db.execute(q.order_by(desc(Job.created_at)).offset(skip).limit(limit))
    jobs = result.scalars().all()
    total = await db.scalar(select(func.count()).select_from(Job).where(Job.status == JobStatus.OPEN)) or 0
    return {"items": [_serialize_job(j) for j in jobs], "total": total}


@router.get("/my/applications")
async def my_applications(current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(JobApplication).where(JobApplication.candidate_id == current_user.id)
        .order_by(desc(JobApplication.applied_at))
    )
    apps = result.scalars().all()
    items = []
    for a in apps:
        job = await db.get(Job, a.job_id)
        items.append({**_serialize_application(a), "job": _serialize_job(job) if job else None})
    return items


@router.get("/admin/applications")
async def admin_list_applications(job_id: Optional[str] = None, status: Optional[str] = None,
                                   skip: int = 0, limit: int = 50,
                                   admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    q = select(JobApplication).order_by(desc(JobApplication.applied_at))
    if job_id:
        q = q.where(JobApplication.job_id == job_id)
    if status:
        q = q.where(JobApplication.status == status)
    result = await db.execute(q.offset(skip).limit(limit))
    apps = result.scalars().all()
    items = []
    for a in apps:
        candidate = await db.get(User, a.candidate_id)
        job = await db.get(Job, a.job_id)
        items.append({
            **_serialize_application(a),
            "candidate_name": candidate.full_name if candidate else "Unknown",
            "candidate_email": candidate.email if candidate else None,
            "candidate_phone": candidate.phone if candidate else None,
            "job_title": job.title if job else "Unknown",
        })
    total = await db.scalar(select(func.count()).select_from(JobApplication)) or 0
    return {"items": items, "total": total}


@router.get("/admin/list")
async def admin_list_jobs(skip: int = 0, limit: int = 50,
                           admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).order_by(desc(Job.created_at)).offset(skip).limit(limit))
    jobs = result.scalars().all()
    total = await db.scalar(select(func.count()).select_from(Job)) or 0
    return {"items": [_serialize_job(j, full=True) for j in jobs], "total": total}


@router.get("/{job_id}")
async def get_job(job_id: str, db: AsyncSession = Depends(get_db)):
    job = await db.get(Job, job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    return _serialize_job(job, full=True)


# ── Candidate ──────────────────────────────────────────────────

@router.post("/{job_id}/apply", status_code=201)
async def apply_for_job(job_id: str, data: ApplicationCreate,
                         current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    job = await db.get(Job, job_id)
    if not job or job.status != JobStatus.OPEN:
        raise HTTPException(404, "Job not found or closed")
    if job.application_deadline and job.application_deadline < date.today():
        raise HTTPException(400, "Application deadline has passed")
    existing = await db.execute(
        select(JobApplication).where(and_(JobApplication.job_id == job_id,
                                          JobApplication.candidate_id == current_user.id))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(400, "Already applied for this job")
    app = JobApplication(
        job_id=job_id, candidate_id=current_user.id,
        cover_letter=data.cover_letter,
        expected_salary=data.expected_salary,
        notice_period_days=data.notice_period_days,
    )
    db.add(app)
    await db.flush()
    return {"message": "Application submitted", "application_id": app.id}


@router.post("/{job_id}/upload-resume")
async def upload_candidate_resume(job_id: str, file: UploadFile = File(...),
                                   current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(JobApplication).where(and_(JobApplication.job_id == job_id,
                                          JobApplication.candidate_id == current_user.id))
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(404, "Application not found. Apply first.")
    url = await upload_resume(file, current_user.id)
    app.resume_url = url
    return {"resume_url": url}


# ── Admin ──────────────────────────────────────────────────────

@router.post("/admin/create", status_code=201)
async def create_job(data: JobCreate, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    job = Job(**data.dict(), created_by=admin.id)
    db.add(job)
    await db.flush()
    return {"message": "Job posted", "job_id": job.id}


@router.put("/admin/{job_id}")
async def update_job(job_id: str, data: dict,
                      admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    job = await db.get(Job, job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    allowed = {"title", "department", "location", "job_type", "description", "requirements",
               "responsibilities", "status", "positions", "skills_required", "salary_min", "salary_max",
               "erpnext_job_id"}
    for k, v in data.items():
        if k in allowed:
            if k == "application_deadline" and isinstance(v, str) and v:
                v = date.fromisoformat(v)
            setattr(job, k, v)
    return {"message": "Updated"}


@router.delete("/admin/{job_id}")
async def delete_job(job_id: str,
                      admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    job = await db.get(Job, job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    await db.delete(job)
    return {"message": "Job deleted"}


@router.post("/admin/shortlist/{application_id}")
async def shortlist_candidate(application_id: str, data: dict,
                               admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    app = await db.get(JobApplication, application_id)
    if not app:
        raise HTTPException(404, "Application not found")
    action = data.get("action", "shortlist")
    if action == "shortlist":
        app.status = ApplicationStatus.SHORTLISTED
        candidate = await db.get(User, app.candidate_id)
        job = await db.get(Job, app.job_id)
        if candidate and job:
            await send_email(candidate.email, "welcome", {
                "name": candidate.full_name, "email": candidate.email, "role": "Candidate",
                "message": f"Congratulations! You have been shortlisted for '{job.title}'.",
                "dashboard_url": "/dashboard/jobs",
            })
    elif action == "reject":
        app.status = ApplicationStatus.REJECTED
        app.rejection_reason = data.get("reason", "")
    elif action == "select":
        app.status = ApplicationStatus.SELECTED
    if "notes" in data:
        app.admin_notes = data["notes"]
    return {"message": f"Application {action}ed", "status": app.status}


@router.post("/admin/schedule-interview")
async def schedule_interview(data: ScheduleInterview,
                              admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    app = await db.get(JobApplication, data.application_id)
    if not app:
        raise HTTPException(404, "Application not found")
    app.status = ApplicationStatus.INTERVIEW_SCHEDULED
    app.interview_date = data.interview_date
    app.interview_mode = data.interview_mode
    app.interview_link = data.interview_link
    app.interview_location = data.interview_location or data.interview_link
    app.interviewer_name = data.interviewer_name

    candidate = await db.get(User, app.candidate_id)
    job = await db.get(Job, app.job_id)
    if candidate and job:
        date_str = data.interview_date.strftime("%d %B %Y at %I:%M %p")
        location = data.interview_link or data.interview_location or "To be communicated"
        await send_email(candidate.email, "interview_scheduled", {
            "candidate_name": candidate.full_name, "job_title": job.title,
            "interview_date": date_str, "interview_mode": data.interview_mode,
            "interview_location": location, "interviewer_name": data.interviewer_name or "HR Team",
        })
        if candidate.phone:
            await notify_interview_scheduled(
                candidate.full_name, candidate.phone, job.title,
                date_str, data.interview_mode, location,
            )
    return {"message": "Interview scheduled and candidate notified"}


def _serialize_job(j: Job, full: bool = True) -> dict:
    d = {
        "id": j.id, "title": j.title, "department": j.department,
        "location": j.location, "job_type": j.job_type,
        "experience_min": j.experience_min, "experience_max": j.experience_max,
        "salary_min": j.salary_min, "salary_max": j.salary_max,
        "status": j.status, "positions": j.positions,
        "application_deadline": j.application_deadline,
        "skills_required": j.skills_required, "created_at": j.created_at,
    }
    if full:
        d.update({"description": j.description, "requirements": j.requirements,
                  "responsibilities": j.responsibilities})
    return d


def _serialize_application(a: JobApplication) -> dict:
    return {
        "id": a.id, "job_id": a.job_id, "status": a.status,
        "cover_letter": a.cover_letter, "resume_url": a.resume_url,
        "expected_salary": a.expected_salary, "notice_period_days": a.notice_period_days,
        "admin_notes": a.admin_notes, "interview_date": a.interview_date,
        "interview_mode": a.interview_mode, "interview_link": a.interview_link,
        "interview_score": a.interview_score, "applied_at": a.applied_at,
    }


def _serialize_general_app(a: GeneralApplication) -> dict:
    return {
        "id": a.id,
        "name": a.name,
        "email": a.email,
        "phone": a.phone,
        "desired_job_title": a.desired_job_title,
        "department": a.department,
        "experience_years": a.experience_years,
        "expected_salary": a.expected_salary,
        "skills": a.skills,
        "resume_url": a.resume_url,
        "notes": a.notes,
        "applied_at": a.applied_at.isoformat() if a.applied_at else None,
    }


@router.post("/upload-general-resume")
async def upload_general_candidate_resume(file: UploadFile = File(...)):
    import uuid
    unique_id = uuid.uuid4().hex
    url = await upload_document(file, "general_resumes", f"resume_gen_{unique_id}")
    return {"resume_url": url}


@router.post("/general-apply", status_code=201)
async def general_apply(data: GeneralApplicationCreate, db: AsyncSession = Depends(get_db)):
    app = GeneralApplication(
        name=data.name,
        email=data.email,
        phone=data.phone,
        desired_job_title=data.desired_job_title,
        department=data.department,
        experience_years=data.experience_years,
        expected_salary=data.expected_salary,
        skills=data.skills,
        resume_url=data.resume_url,
        notes=data.notes,
    )
    db.add(app)
    await db.flush()
    return {"message": "Application submitted successfully", "application_id": app.id}


@router.get("/admin/general-applications")
async def list_general_applications(admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    q = select(GeneralApplication).order_by(desc(GeneralApplication.applied_at))
    result = await db.execute(q)
    apps = result.scalars().all()
    return {"items": [_serialize_general_app(a) for a in apps]}

@router.post("/webhook/erpnext", status_code=200)
async def erpnext_job_webhook(data: ERPNextJobWebhook, db: AsyncSession = Depends(get_db)):
    from datetime import datetime as dt

    result = await db.execute(select(Job).where(Job.erpnext_job_id == data.name))
    existing = result.scalar_one_or_none()

    job_status = JobStatus.OPEN.value if data.status == "Open" else JobStatus.CLOSED.value

    cleaned_description = _clean_html(data.description)
    cleaned_requirements = _clean_html(data.custom_requirements)
    cleaned_responsibilities = _clean_html(data.custom_responsibilities_)
    cleaned_skills_raw = _clean_skills(data.custom_required_skills)

    skills_list = None
    if cleaned_skills_raw:
        skills_list = [s.strip() for s in cleaned_skills_raw.split(",") if s.strip()]

    deadline_parsed = None
    if data.custom_application_deadline:
        try:
            deadline_parsed = dt.strptime(data.custom_application_deadline, "%Y-%m-%d").date()
        except ValueError:
            deadline_parsed = None

    if existing:
        if data.job_title: existing.title = data.job_title
        if data.designation: existing.department = data.designation
        if data.location: existing.location = data.location
        if data.employment_type: existing.job_type = data.employment_type
        if data.custom_positions: existing.positions = data.custom_positions
        if cleaned_description: existing.description = cleaned_description
        if cleaned_requirements: existing.requirements = cleaned_requirements
        if cleaned_responsibilities: existing.responsibilities = cleaned_responsibilities
        if data.custom_min_experience_year is not None: existing.experience_min = int(data.custom_min_experience_year)
        if data.custom_max_experience_year is not None: existing.experience_max = int(data.custom_max_experience_year)
        if data.custom_min_salary is not None: existing.salary_min = int(data.custom_min_salary)
        if data.custom_max_salary is not None: existing.salary_max = int(data.custom_max_salary)
        if skills_list: existing.skills_required = skills_list
        if deadline_parsed: existing.application_deadline = deadline_parsed
        existing.status = job_status
        return {"message": "Job updated from ERPNext", "job_id": existing.id}
    else:
        admin_result = await db.execute(select(User).where(User.role == "admin").limit(1))
        admin_user = admin_result.scalar_one_or_none()
        if not admin_user:
            raise HTTPException(500, "No admin user found to assign job creation")

        job = Job(
            erpnext_job_id=data.name,
            title=data.job_title or "Untitled",
            department=data.designation,
            location=data.location or "Not specified",
            job_type=data.employment_type or "full-time",
            positions=data.custom_positions or 1,
            description=cleaned_description or "",
            requirements=cleaned_requirements or "",
            responsibilities=cleaned_responsibilities or "",
            experience_min=int(data.custom_min_experience_year) if data.custom_min_experience_year is not None else 0,
            experience_max=int(data.custom_max_experience_year) if data.custom_max_experience_year is not None else None,
            salary_min=int(data.custom_min_salary) if data.custom_min_salary is not None else None,
            salary_max=int(data.custom_max_salary) if data.custom_max_salary is not None else None,
            skills_required=skills_list,
            application_deadline=deadline_parsed,
            status=job_status,
            created_by=admin_user.id,
        )
        db.add(job)
        await db.flush()
        return {"message": "Job created from ERPNext", "job_id": job.id}