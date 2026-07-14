"""
Devkalp Foundation — Database Models
Works with SQLite (local dev) and PostgreSQL (production).
UUIDs stored as String(36) — compatible with both databases.
"""
import uuid
import enum
from datetime import datetime
from sqlalchemy import (
    Column, String, Boolean, DateTime, Text, Integer, Float,
    ForeignKey, Enum, JSON, Date, Index
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


def gen_uuid() -> str:
    return str(uuid.uuid4())


# ── Enums ──────────────────────────────────────────────────────

class UserRole(str, enum.Enum):
    ADMIN      = "admin"
    COUNSELOR  = "counselor"
    MATRIMONY  = "matrimony"
    DONOR      = "donor"
    CANDIDATE  = "candidate"
    VOLUNTEER  = "volunteer"

class ProfileStatus(str, enum.Enum):
    PENDING   = "pending"
    APPROVED  = "approved"
    REJECTED  = "rejected"
    SUSPENDED = "suspended"

class MarriageStatus(str, enum.Enum):
    NEVER_MARRIED    = "never_married"
    DIVORCED         = "divorced"
    WIDOWED          = "widowed"
    AWAITING_DIVORCE = "awaiting_divorce"

class MatchStatus(str, enum.Enum):
    SUGGESTED         = "suggested"
    INTERESTED        = "interested"
    DECLINED          = "declined"
    MEETING_SCHEDULED = "meeting_scheduled"
    ACCEPTED          = "accepted"
    CLOSED            = "closed"

class DonationStatus(str, enum.Enum):
    PENDING   = "pending"
    COMPLETED = "completed"
    FAILED    = "failed"
    REFUNDED  = "refunded"

class CampaignStatus(str, enum.Enum):
    DRAFT     = "draft"
    ACTIVE    = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class JobStatus(str, enum.Enum):
    OPEN   = "open"
    CLOSED = "closed"
    PAUSED = "paused"

class ApplicationStatus(str, enum.Enum):
    APPLIED              = "applied"
    SHORTLISTED          = "shortlisted"
    INTERVIEW_SCHEDULED  = "interview_scheduled"
    INTERVIEWED          = "interviewed"
    SELECTED             = "selected"
    REJECTED             = "rejected"
    WITHDRAWN            = "withdrawn"

class VolunteerStatus(str, enum.Enum):
    PENDING  = "pending"
    ACTIVE   = "active"
    INACTIVE = "inactive"


# ── User ───────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id              = Column(String(36), primary_key=True, default=gen_uuid)
    email           = Column(String(255), unique=True, nullable=False, index=True)
    phone           = Column(String(20),  unique=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    full_name       = Column(String(255), nullable=False)
    role            = Column(String(20),  nullable=False, default=UserRole.DONOR.value)
    is_active       = Column(Boolean, default=True)
    is_verified     = Column(Boolean, default=False)
    profile_picture = Column(String(500), nullable=True)
    created_at      = Column(DateTime, server_default=func.now())
    updated_at      = Column(DateTime, onupdate=func.now())
    last_login      = Column(DateTime, nullable=True)

    matrimony_profile = relationship("MatrimonyProfile", back_populates="user", uselist=False, foreign_keys="MatrimonyProfile.user_id")
    donations         = relationship("Donation", back_populates="donor", foreign_keys="Donation.donor_id")
    job_applications  = relationship("JobApplication", back_populates="candidate", foreign_keys="JobApplication.candidate_id")
    volunteer_profile = relationship("VolunteerProfile", back_populates="user", uselist=False, foreign_keys="VolunteerProfile.user_id")
    activity_logs     = relationship("ActivityLog", back_populates="user", foreign_keys="ActivityLog.user_id")


# ── Matrimony ──────────────────────────────────────────────────

class MatrimonyProfile(Base):
    __tablename__ = "matrimony_profiles"

    id             = Column(String(36), primary_key=True, default=gen_uuid)
    user_id        = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    status         = Column(String(20), default=ProfileStatus.PENDING.value)

    date_of_birth  = Column(Date, nullable=False)
    gender         = Column(String(10), nullable=False)
    height_cm      = Column(Integer, nullable=True)
    weight_kg      = Column(Integer, nullable=True)
    complexion     = Column(String(50), nullable=True)
    blood_group    = Column(String(10), nullable=True)
    disability     = Column(String(255), nullable=True)

    religion       = Column(String(100), nullable=False)
    caste          = Column(String(100), nullable=True)
    sub_caste      = Column(String(100), nullable=True)
    gotra          = Column(String(100), nullable=True)
    manglik        = Column(String(20),  nullable=True)

    city           = Column(String(100), nullable=False)
    state          = Column(String(100), nullable=False)
    country        = Column(String(100), default="India")

    education      = Column(String(255), nullable=False)
    occupation     = Column(String(255), nullable=False)
    employer       = Column(String(255), nullable=True)
    annual_income  = Column(String(100), nullable=True)

    family_type    = Column(String(50),  nullable=True)
    family_status  = Column(String(50),  nullable=True)
    father_occupation = Column(String(255), nullable=True)
    mother_occupation = Column(String(255), nullable=True)
    siblings       = Column(String(100), nullable=True)

    marriage_status = Column(String(30), default=MarriageStatus.NEVER_MARRIED.value)
    children        = Column(Integer, default=0)

    bio            = Column(Text, nullable=True)
    hobbies        = Column(JSON, nullable=True)
    values         = Column(Text, nullable=True)
    expectations   = Column(Text, nullable=True)

    id_proof_url   = Column(String(500), nullable=True)
    id_proof_type  = Column(String(50),  nullable=True)
    biodata_url    = Column(String(500), nullable=True)
    photos         = Column(JSON, nullable=True)

    admin_notes       = Column(Text, nullable=True)
    approved_by       = Column(String(36), ForeignKey("users.id"), nullable=True)
    approved_at       = Column(DateTime, nullable=True)
    rejection_reason  = Column(Text, nullable=True)

    created_at     = Column(DateTime, server_default=func.now())
    updated_at     = Column(DateTime, onupdate=func.now())

    user                 = relationship("User", back_populates="matrimony_profile", foreign_keys=[user_id])
    matches_as_profile1  = relationship("MatrimonyMatch", foreign_keys="MatrimonyMatch.profile1_id", back_populates="profile1")
    matches_as_profile2  = relationship("MatrimonyMatch", foreign_keys="MatrimonyMatch.profile2_id", back_populates="profile2")


class MatrimonyMatch(Base):
    __tablename__ = "matrimony_matches"

    id                = Column(String(36), primary_key=True, default=gen_uuid)
    profile1_id       = Column(String(36), ForeignKey("matrimony_profiles.id"), nullable=False)
    profile2_id       = Column(String(36), ForeignKey("matrimony_profiles.id"), nullable=False)
    status            = Column(String(30), default=MatchStatus.SUGGESTED.value)
    suggested_by      = Column(String(36), ForeignKey("users.id"), nullable=False)
    profile1_response = Column(String(20), nullable=True)
    profile2_response = Column(String(20), nullable=True)
    admin_notes       = Column(Text, nullable=True)
    meeting_date      = Column(DateTime, nullable=True)
    meeting_notes     = Column(Text, nullable=True)
    created_at        = Column(DateTime, server_default=func.now())
    updated_at        = Column(DateTime, onupdate=func.now())

    profile1 = relationship("MatrimonyProfile", foreign_keys=[profile1_id], back_populates="matches_as_profile1")
    profile2 = relationship("MatrimonyProfile", foreign_keys=[profile2_id], back_populates="matches_as_profile2")


# ── Donations ──────────────────────────────────────────────────

class DonationCampaign(Base):
    __tablename__ = "donation_campaigns"

    id                = Column(String(36), primary_key=True, default=gen_uuid)
    title             = Column(String(255), nullable=False)
    slug              = Column(String(255), unique=True, nullable=False)
    description       = Column(Text, nullable=False)
    short_description = Column(String(500), nullable=True)
    cover_image       = Column(String(500), nullable=True)
    target_amount     = Column(Float, nullable=True)
    collected_amount  = Column(Float, default=0.0)
    used_amount       = Column(Float, default=0.0)
    status            = Column(String(20), default=CampaignStatus.ACTIVE.value)
    start_date        = Column(Date, nullable=True)
    end_date          = Column(Date, nullable=True)
    impact_report     = Column(Text, nullable=True)
    media_urls        = Column(JSON, nullable=True)
    created_by        = Column(String(36), ForeignKey("users.id"), nullable=False)
    created_at        = Column(DateTime, server_default=func.now())
    updated_at        = Column(DateTime, onupdate=func.now())

    donations = relationship("Donation", back_populates="campaign")


class Donation(Base):
    __tablename__ = "donations"

    id                   = Column(String(36), primary_key=True, default=gen_uuid)
    donor_id             = Column(String(36), ForeignKey("users.id"), nullable=True)
    campaign_id          = Column(String(36), ForeignKey("donation_campaigns.id"), nullable=True)
    amount               = Column(Float, nullable=False)
    currency             = Column(String(10), default="INR")
    status               = Column(String(20), default=DonationStatus.PENDING.value)
    razorpay_order_id    = Column(String(255), nullable=True, unique=True)
    razorpay_payment_id  = Column(String(255), nullable=True, unique=True)
    razorpay_signature   = Column(String(500), nullable=True)
    donor_name           = Column(String(255), nullable=True)
    donor_email          = Column(String(255), nullable=True)
    donor_phone          = Column(String(20),  nullable=True)
    donor_pan            = Column(String(20),  nullable=True)
    is_anonymous         = Column(Boolean, default=False)
    message              = Column(Text, nullable=True)
    receipt_url          = Column(String(500), nullable=True)
    receipt_number       = Column(String(100), unique=True, nullable=True)
    created_at           = Column(DateTime, server_default=func.now())
    updated_at           = Column(DateTime, onupdate=func.now())

    donor    = relationship("User", back_populates="donations", foreign_keys=[donor_id])
    campaign = relationship("DonationCampaign", back_populates="donations")


# ── Campaigns (Events/Programs) ────────────────────────────────

class Campaign(Base):
    __tablename__ = "campaigns"

    id                  = Column(String(36), primary_key=True, default=gen_uuid)
    title               = Column(String(255), nullable=False)
    slug                = Column(String(255), unique=True, nullable=False)
    category            = Column(String(100), nullable=False)
    description         = Column(Text, nullable=False)
    short_description   = Column(String(500), nullable=True)
    cover_image         = Column(String(500), nullable=True)
    venue               = Column(String(255), nullable=True)
    city                = Column(String(100), nullable=True)
    event_date          = Column(DateTime, nullable=True)
    status              = Column(String(20), default=CampaignStatus.ACTIVE.value)
    max_registrations   = Column(Integer, nullable=True)
    registration_count  = Column(Integer, default=0)
    is_registration_open = Column(Boolean, default=True)
    media_gallery       = Column(JSON, nullable=True)
    report_url          = Column(String(500), nullable=True)
    impact_stats        = Column(JSON, nullable=True)
    notes               = Column(Text, nullable=True)
    created_by          = Column(String(36), ForeignKey("users.id"), nullable=False)
    created_at          = Column(DateTime, server_default=func.now())
    updated_at          = Column(DateTime, onupdate=func.now())

    registrations = relationship("CampaignRegistration", back_populates="campaign")


class CampaignRegistration(Base):
    __tablename__ = "campaign_registrations"

    id                = Column(String(36), primary_key=True, default=gen_uuid)
    campaign_id       = Column(String(36), ForeignKey("campaigns.id"), nullable=False)
    name              = Column(String(255), nullable=False)
    email             = Column(String(255), nullable=False)
    phone             = Column(String(20),  nullable=False)
    organization      = Column(String(255), nullable=True)
    participant_count = Column(Integer, default=1)
    notes             = Column(Text, nullable=True)
    attended          = Column(Boolean, nullable=True)
    created_at        = Column(DateTime, server_default=func.now())

    campaign = relationship("Campaign", back_populates="registrations")


# ── Jobs ───────────────────────────────────────────────────────

class Job(Base):
    __tablename__ = "jobs"

    id                   = Column(String(36), primary_key=True, default=gen_uuid)
    erpnext_job_id       = Column(String(255), unique=True, nullable=True, index=True)
    title                = Column(String(255), nullable=False)
    department           = Column(String(100), nullable=True)
    location             = Column(String(255), nullable=False)
    job_type             = Column(String(50),  nullable=False)
    experience_min       = Column(Integer, default=0)
    experience_max       = Column(Integer, nullable=True)
    salary_min           = Column(Integer, nullable=True)
    salary_max           = Column(Integer, nullable=True)
    description          = Column(Text, nullable=False)
    requirements         = Column(Text, nullable=False)
    responsibilities     = Column(Text, nullable=False)
    skills_required      = Column(JSON, nullable=True)
    status               = Column(String(20), default=JobStatus.OPEN.value)
    application_deadline = Column(Date, nullable=True)
    positions            = Column(Integer, default=1)
    created_by           = Column(String(36), ForeignKey("users.id"), nullable=False)
    created_at           = Column(DateTime, server_default=func.now())
    updated_at           = Column(DateTime, onupdate=func.now())

    applications = relationship("JobApplication", back_populates="job", cascade="all, delete-orphan")


class JobApplication(Base):
    __tablename__ = "job_applications"

    id                  = Column(String(36), primary_key=True, default=gen_uuid)
    job_id              = Column(String(36), ForeignKey("jobs.id"), nullable=False)
    candidate_id        = Column(String(36), ForeignKey("users.id"), nullable=False)
    status              = Column(String(30), default=ApplicationStatus.APPLIED.value)
    cover_letter        = Column(Text, nullable=True)
    resume_url          = Column(String(500), nullable=True)
    expected_salary     = Column(Integer, nullable=True)
    notice_period_days  = Column(Integer, nullable=True)
    admin_notes         = Column(Text, nullable=True)
    rejection_reason    = Column(Text, nullable=True)
    interview_date      = Column(DateTime, nullable=True)
    interview_mode      = Column(String(50),  nullable=True)
    interview_link      = Column(String(500), nullable=True)
    interview_location  = Column(String(255), nullable=True)
    interviewer_name    = Column(String(255), nullable=True)
    interview_notes     = Column(Text, nullable=True)
    interview_score     = Column(Integer, nullable=True)
    applied_at          = Column(DateTime, server_default=func.now())
    updated_at          = Column(DateTime, onupdate=func.now())

    job       = relationship("Job", back_populates="applications")
    candidate = relationship("User", back_populates="job_applications", foreign_keys=[candidate_id])

    __table_args__ = (
        Index("ix_job_application_unique", "job_id", "candidate_id", unique=True),
    )


# ── Volunteers ─────────────────────────────────────────────────

class VolunteerProfile(Base):
    __tablename__ = "volunteer_profiles"

    id                = Column(String(36), primary_key=True, default=gen_uuid)
    user_id           = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    status            = Column(String(20), default=VolunteerStatus.PENDING.value)
    occupation        = Column(String(255), nullable=True)
    city              = Column(String(100), nullable=True)
    availability      = Column(String(100), nullable=True)
    skills            = Column(JSON, nullable=True)
    interests         = Column(JSON, nullable=True)
    motivation        = Column(Text, nullable=True)
    hours_contributed = Column(Integer, default=0)
    tasks_completed   = Column(Integer, default=0)
    admin_notes       = Column(Text, nullable=True)
    created_at        = Column(DateTime, server_default=func.now())
    updated_at        = Column(DateTime, onupdate=func.now())

    user             = relationship("User", back_populates="volunteer_profile", foreign_keys=[user_id])
    task_assignments = relationship("VolunteerTask", back_populates="volunteer")


class VolunteerTask(Base):
    __tablename__ = "volunteer_tasks"

    id               = Column(String(36), primary_key=True, default=gen_uuid)
    volunteer_id     = Column(String(36), ForeignKey("volunteer_profiles.id"), nullable=False)
    title            = Column(String(255), nullable=False)
    description      = Column(Text, nullable=True)
    campaign_id      = Column(String(36), ForeignKey("campaigns.id"), nullable=True)
    assigned_by      = Column(String(36), ForeignKey("users.id"), nullable=False)
    due_date         = Column(Date, nullable=True)
    hours_estimated  = Column(Integer, nullable=True)
    hours_actual     = Column(Integer, nullable=True)
    is_completed     = Column(Boolean, default=False)
    completion_notes = Column(Text, nullable=True)
    created_at       = Column(DateTime, server_default=func.now())
    updated_at       = Column(DateTime, onupdate=func.now())

    volunteer = relationship("VolunteerProfile", back_populates="task_assignments")


# ── System / Admin ─────────────────────────────────────────────

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id          = Column(String(36), primary_key=True, default=gen_uuid)
    user_id     = Column(String(36), ForeignKey("users.id"), nullable=True)
    action      = Column(String(100), nullable=False)
    module      = Column(String(50),  nullable=False)
    resource_id = Column(String(255), nullable=True)
    details     = Column(JSON, nullable=True)
    ip_address  = Column(String(50),  nullable=True)
    user_agent  = Column(String(500), nullable=True)
    created_at  = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="activity_logs", foreign_keys=[user_id])


class Notification(Base):
    __tablename__ = "notifications"

    id         = Column(String(36), primary_key=True, default=gen_uuid)
    user_id    = Column(String(36), ForeignKey("users.id"), nullable=False)
    title      = Column(String(255), nullable=False)
    message    = Column(Text, nullable=False)
    type       = Column(String(50), nullable=False)
    is_read    = Column(Boolean, default=False)
    link       = Column(String(500), nullable=True)
    created_at = Column(DateTime, server_default=func.now())


# ── Counselor System ───────────────────────────────────────────

class CounselorProfile(Base):
    __tablename__ = "counselor_profiles"

    id                 = Column(String(36), primary_key=True, default=gen_uuid)
    user_id            = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    specialization     = Column(String(255), nullable=True)
    qualifications     = Column(Text, nullable=True)
    years_experience   = Column(Integer, default=0)
    languages          = Column(JSON, nullable=True)
    availability_notes = Column(Text, nullable=True)
    is_active          = Column(Boolean, default=True)
    bio                = Column(Text, nullable=True)
    created_at         = Column(DateTime, server_default=func.now())
    updated_at         = Column(DateTime, onupdate=func.now())

    user     = relationship("User", foreign_keys=[user_id])
    sessions = relationship("CounselingSession", back_populates="counselor_profile")


class CounselingSession(Base):
    __tablename__ = "counseling_sessions"

    id                   = Column(String(36), primary_key=True, default=gen_uuid)
    counselor_profile_id = Column(String(36), ForeignKey("counselor_profiles.id"), nullable=False)
    matrimony_profile_id = Column(String(36), ForeignKey("matrimony_profiles.id"), nullable=False)
    matrimony_profile2_id = Column(String(36), ForeignKey("matrimony_profiles.id"), nullable=True)
    session_date         = Column(DateTime, nullable=False)
    duration_minutes     = Column(Integer, default=60)
    mode                 = Column(String(30), default="video")
    status               = Column(String(30), default="scheduled")
    topics_covered       = Column(JSON, nullable=True)
    session_notes        = Column(Text, nullable=True)
    recommendations      = Column(Text, nullable=True)
    next_session_date    = Column(DateTime, nullable=True)
    family_present       = Column(Boolean, default=False)
    family_notes         = Column(Text, nullable=True)
    created_at           = Column(DateTime, server_default=func.now())
    updated_at           = Column(DateTime, onupdate=func.now())

    counselor_profile = relationship("CounselorProfile", back_populates="sessions")
    matrimony_profile = relationship("MatrimonyProfile", foreign_keys=[matrimony_profile_id])
    matrimony_profile2 = relationship("MatrimonyProfile", foreign_keys=[matrimony_profile2_id])


# ── Family Involvement ─────────────────────────────────────────

class FamilyMember(Base):
    __tablename__ = "family_members"

    id                   = Column(String(36), primary_key=True, default=gen_uuid)
    matrimony_profile_id = Column(String(36), ForeignKey("matrimony_profiles.id"), nullable=False)
    relation             = Column(String(50),  nullable=False)
    full_name            = Column(String(255), nullable=False)
    age                  = Column(Integer, nullable=True)
    occupation           = Column(String(255), nullable=True)
    phone                = Column(String(20),  nullable=True)
    email                = Column(String(255), nullable=True)
    city                 = Column(String(100), nullable=True)
    is_primary_contact   = Column(Boolean, default=False)
    consent_given        = Column(Boolean, default=False)
    notes                = Column(Text, nullable=True)
    created_at           = Column(DateTime, server_default=func.now())

    matrimony_profile = relationship("MatrimonyProfile", foreign_keys=[matrimony_profile_id])


class FamilyParticipation(Base):
    __tablename__ = "family_participation"

    id                   = Column(String(36), primary_key=True, default=gen_uuid)
    matrimony_profile_id = Column(String(36), ForeignKey("matrimony_profiles.id"), nullable=False)
    family_member_id     = Column(String(36), ForeignKey("family_members.id"), nullable=True)
    event_type           = Column(String(50),  nullable=False)
    event_id             = Column(String(255), nullable=True)
    attended             = Column(Boolean, default=False)
    role_played          = Column(String(100), nullable=True)
    notes                = Column(Text, nullable=True)
    created_at           = Column(DateTime, server_default=func.now())


# ── Emotional Readiness ────────────────────────────────────────

class EmotionalQuestion(Base):
    __tablename__ = "emotional_questions"

    id            = Column(String(36), primary_key=True, default=gen_uuid)
    category      = Column(String(100), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String(30), default="scale")
    options       = Column(JSON, nullable=True)
    scale_min     = Column(Integer, default=1)
    scale_max     = Column(Integer, default=10)
    scale_labels  = Column(JSON, nullable=True)
    is_active     = Column(Boolean, default=True)
    order_index   = Column(Integer, default=0)
    created_at    = Column(DateTime, server_default=func.now())


class EmotionalReadinessResponse(Base):
    __tablename__ = "emotional_readiness_responses"

    id                   = Column(String(36), primary_key=True, default=gen_uuid)
    matrimony_profile_id = Column(String(36), ForeignKey("matrimony_profiles.id"), nullable=False)
    submitted_at         = Column(DateTime, server_default=func.now())
    overall_score        = Column(Float, nullable=True)
    category_scores      = Column(JSON, nullable=True)
    is_complete          = Column(Boolean, default=False)
    counselor_notes      = Column(Text, nullable=True)
    reviewed_by          = Column(String(36), ForeignKey("users.id"), nullable=True)
    reviewed_at          = Column(DateTime, nullable=True)

    answers           = relationship("EmotionalAnswer", back_populates="response", cascade="all, delete-orphan")
    matrimony_profile = relationship("MatrimonyProfile", foreign_keys=[matrimony_profile_id])


class EmotionalAnswer(Base):
    __tablename__ = "emotional_answers"

    id              = Column(String(36), primary_key=True, default=gen_uuid)
    response_id     = Column(String(36), ForeignKey("emotional_readiness_responses.id"), nullable=False)
    question_id     = Column(String(36), ForeignKey("emotional_questions.id"), nullable=False)
    scale_value     = Column(Integer, nullable=True)
    text_value      = Column(Text, nullable=True)
    selected_option = Column(String(255), nullable=True)

    response = relationship("EmotionalReadinessResponse", back_populates="answers")
    question = relationship("EmotionalQuestion")


# ── Campaign Sessions & Attendance ─────────────────────────────

class CampaignSession(Base):
    __tablename__ = "campaign_sessions"

    id               = Column(String(36), primary_key=True, default=gen_uuid)
    campaign_id      = Column(String(36), ForeignKey("campaigns.id"), nullable=False)
    session_number   = Column(Integer, nullable=False, default=1)
    title            = Column(String(255), nullable=False)
    school_name      = Column(String(255), nullable=True)
    school_address   = Column(String(500), nullable=True)
    facilitator_name = Column(String(255), nullable=True)
    session_date     = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, default=90)
    topics_covered   = Column(JSON, nullable=True)
    expected_students = Column(Integer, nullable=True)
    girls_count      = Column(Integer, default=0)
    boys_count       = Column(Integer, default=0)
    teachers_count   = Column(Integer, default=0)
    total_attended   = Column(Integer, default=0)
    session_notes    = Column(Text, nullable=True)
    challenges       = Column(Text, nullable=True)
    outcomes         = Column(Text, nullable=True)
    media_urls       = Column(JSON, nullable=True)
    status           = Column(String(20), default="planned")
    created_by       = Column(String(36), ForeignKey("users.id"), nullable=False)
    created_at       = Column(DateTime, server_default=func.now())
    updated_at       = Column(DateTime, onupdate=func.now())

    campaign  = relationship("Campaign", foreign_keys=[campaign_id])
    attendees = relationship("CampaignAttendee", back_populates="session", cascade="all, delete-orphan")


class CampaignAttendee(Base):
    __tablename__ = "campaign_attendees"

    id                    = Column(String(36), primary_key=True, default=gen_uuid)
    session_id            = Column(String(36), ForeignKey("campaign_sessions.id"), nullable=False)
    name                  = Column(String(255), nullable=False)
    age                   = Column(Integer, nullable=True)
    gender                = Column(String(10),  nullable=True)
    class_grade           = Column(String(20),  nullable=True)
    school_name           = Column(String(255), nullable=True)
    phone                 = Column(String(20),  nullable=True)
    pre_assessment_score  = Column(Integer, nullable=True)
    post_assessment_score = Column(Integer, nullable=True)
    feedback              = Column(Text, nullable=True)
    created_at            = Column(DateTime, server_default=func.now())

    session = relationship("CampaignSession", back_populates="attendees")


# ── General Resume Applications ───────────────────────────────────

class GeneralApplication(Base):
    __tablename__ = "general_applications"

    id                  = Column(String(36), primary_key=True, default=gen_uuid)
    name                = Column(String(255), nullable=False)
    email               = Column(String(255), nullable=False)
    phone               = Column(String(20),  nullable=False)
    desired_job_title   = Column(String(255), nullable=False)
    department          = Column(String(100), nullable=True)
    experience_years    = Column(Integer, default=0)
    expected_salary     = Column(Integer, nullable=True)
    skills              = Column(Text, nullable=True)
    resume_url          = Column(String(500), nullable=True)
    notes               = Column(Text, nullable=True)
    applied_at          = Column(DateTime, server_default=func.now())


# ── Contact Enquiries / Messages ──────────────────────────────────

class Enquiry(Base):
    __tablename__ = "enquiries"

    id           = Column(String(36), primary_key=True, default=gen_uuid)
    name         = Column(String(255), nullable=False)
    email        = Column(String(255), nullable=False)
    phone        = Column(String(20),  nullable=True)
    enquiry_type = Column(String(50),  nullable=False, default="general")
    message      = Column(Text,         nullable=False)
    created_at   = Column(DateTime, server_default=func.now())


# ── Awards ─────────────────────────────────────────────────────

class Award(Base):
    __tablename__ = "awards"

    id          = Column(String(36), primary_key=True, default=gen_uuid)
    title       = Column(String(255), nullable=False)
    issuer      = Column(String(255), nullable=True)
    date_given  = Column(String(100), nullable=True)
    description = Column(Text,        nullable=True)
    image_url   = Column(String(500), nullable=True)
    link        = Column(String(500), nullable=True)
    is_active   = Column(Boolean, default=True)
    created_at  = Column(DateTime, server_default=func.now())


# ── Gallery ────────────────────────────────────────────────────

class GalleryItem(Base):
    __tablename__ = "gallery_items"

    id          = Column(String(36), primary_key=True, default=gen_uuid)
    title       = Column(String(255), nullable=True, default="")
    description = Column(Text,        nullable=True)
    image_url   = Column(String(500), nullable=False)
    category    = Column(String(100), nullable=True)
    is_active   = Column(Boolean, default=True)
    created_at  = Column(DateTime, server_default=func.now())
    updated_at  = Column(DateTime, onupdate=func.now())

# ── Gallery Categories ──────────────────────────────────────────

class GalleryCategory(Base):
    __tablename__ = "gallery_categories"

    id          = Column(String(36), primary_key=True, default=gen_uuid)
    value       = Column(String(100), unique=True, nullable=False)   # slug, e.g. "health"
    label       = Column(String(255), nullable=False)                # display name, e.g. "Health Campaigns"
    order_index = Column(Integer, default=0)
    created_at  = Column(DateTime, server_default=func.now())
    updated_at  = Column(DateTime, onupdate=func.now())


# ── Partners ───────────────────────────────────────────────────

class Partner(Base):
    __tablename__ = "partners"

    id          = Column(String(36), primary_key=True, default=gen_uuid)
    name        = Column(String(255), nullable=False)
    logo_url    = Column(String(500), nullable=False)
    website_url = Column(String(500), nullable=True)
    is_active   = Column(Boolean, default=True)
    created_at  = Column(DateTime, server_default=func.now())
    updated_at  = Column(DateTime, onupdate=func.now())


# ── Press Mentions ─────────────────────────────────────────────

class PressMention(Base):
    __tablename__ = "press_mentions"

    id             = Column(String(36), primary_key=True, default=gen_uuid)
    title          = Column(String(255), nullable=False)
    publisher_name = Column(String(255), nullable=False)
    logo_url       = Column(String(500), nullable=True)
    article_url    = Column(String(500), nullable=True)
    publish_date   = Column(String(100), nullable=True)
    summary        = Column(Text,        nullable=True)
    is_active      = Column(Boolean, default=True)
    created_at     = Column(DateTime, server_default=func.now())


# ── Instagram Posts ────────────────────────────────────────────

class InstagramPost(Base):
    __tablename__ = "instagram_posts"

    id             = Column(String(36), primary_key=True, default=gen_uuid)
    post_url       = Column(String(500), nullable=False)
    image_url      = Column(String(500), nullable=False)
    caption        = Column(Text,        nullable=True)
    likes_count    = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    is_active      = Column(Boolean, default=True)
    created_at     = Column(DateTime, server_default=func.now())
    updated_at     = Column(DateTime, onupdate=func.now())


# ── CSR Inquiries ──────────────────────────────────────────────

class CSRInquiry(Base):
    __tablename__ = "csr_inquiries"

    id              = Column(String(36), primary_key=True, default=gen_uuid)
    company_name    = Column(String(255), nullable=False)
    contact_person  = Column(String(255), nullable=False)
    email           = Column(String(255), nullable=False)
    phone           = Column(String(20),  nullable=True)
    proposed_budget = Column(String(100), nullable=True)
    interest_areas  = Column(JSON,        nullable=True)
    message         = Column(Text,        nullable=False)
    created_at      = Column(DateTime, server_default=func.now())

