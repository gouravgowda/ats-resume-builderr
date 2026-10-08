"""
Pydantic schemas for all API request/response models.
"""
from __future__ import annotations

import enum
from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, EmailStr


# ─────────────────────── Enums ────────────────────────
class SectionTypeEnum(str, enum.Enum):
    education = "education"
    experience = "experience"
    project = "project"
    skill = "skill"
    achievement = "achievement"


# ─────────────────────── Auth ────────────────────────
class UserOut(BaseModel):
    id: str  # Firebase Auth UID
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True


# ─────────────────────── Contact ────────────────────────
class ContactInfoCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str | None = None
    city: str | None = None
    linkedin: str | None = None
    github: str | None = None
    portfolio: str | None = None


class ContactInfoOut(ContactInfoCreate):
    id: UUID
    resume_id: UUID

    class Config:
        from_attributes = True


# ─────────────────────── Bullet ────────────────────────
class BulletCreate(BaseModel):
    raw_text: str
    order_index: int = 0


class BulletImproveRequest(BaseModel):
    raw_text: str
    context: str | None = None  # role/company/project name for context


class BulletImproveResponse(BaseModel):
    improved_text: str | None
    has_metric: bool
    needs_metric_prompt: bool
    metric_question: str | None
    flags: list[str]  # passive voice, filler words, etc.


class BulletOut(BaseModel):
    id: UUID
    raw_text: str
    improved_text: str | None
    has_metric: bool
    order_index: int
    needs_metric_prompt: bool
    metric_question: str | None

    class Config:
        from_attributes = True


# ─────────────────────── Resume Entry ────────────────────────
class ResumeEntryCreate(BaseModel):
    order_index: int = 0
    payload: dict  # type-specific structured fields
    bullets: list[BulletCreate] = []


class ResumeEntryOut(BaseModel):
    id: UUID
    order_index: int
    payload: dict
    bullets: list[BulletOut] = []

    class Config:
        from_attributes = True


# ─────────────────────── Resume Section ────────────────────────
class ResumeSectionCreate(BaseModel):
    type: SectionTypeEnum
    order_index: int
    entries: list[ResumeEntryCreate] = []


class ResumeSectionOut(BaseModel):
    id: UUID
    type: SectionTypeEnum
    order_index: int
    entries: list[ResumeEntryOut] = []

    class Config:
        from_attributes = True


# ─────────────────────── Resume ────────────────────────
class ResumeCreate(BaseModel):
    title: str
    contact: ContactInfoCreate
    sections: list[ResumeSectionCreate] = []


class ResumeUpdate(BaseModel):
    title: str | None = None
    contact: ContactInfoCreate | None = None
    sections: list[ResumeSectionCreate] | None = None


class ResumeOut(BaseModel):
    id: UUID
    user_id: str  # Firebase Auth UID
    title: str
    created_at: datetime
    updated_at: datetime
    is_tailored_copy_of: UUID | None
    contact: ContactInfoOut | None
    sections: list[ResumeSectionOut] = []

    class Config:
        from_attributes = True


class RenameTitleRequest(BaseModel):
    title: str


class ResumeSummary(BaseModel):
    id: UUID
    title: str
    created_at: datetime
    updated_at: datetime
    is_tailored_copy_of: UUID | None

    class Config:
        from_attributes = True


# ─────────────────────── Job Description ────────────────────────
class JobDescriptionCreate(BaseModel):
    raw_text: str


class JobDescriptionOut(BaseModel):
    id: UUID
    resume_id: UUID
    raw_text: str
    extracted_keywords: Any | None
    created_at: datetime

    class Config:
        from_attributes = True


# ─────────────────────── Score ────────────────────────
class ScoreRequest(BaseModel):
    jd_text: str | None = None  # if None, keyword_score = 0


class ScoreBreakdownItem(BaseModel):
    score: float          # 0.0 – 1.0
    weight: float
    weighted: float
    explanation: str
    items: list[str] = []  # per-issue details


class ScoreOut(BaseModel):
    id: UUID
    resume_id: UUID
    jd_id: UUID | None
    parse_score: float
    keyword_score: float
    bullet_score: float
    completeness_score: float
    formatting_score: float
    total_score: float
    breakdown: Any | None
    computed_at: datetime
    disclaimer: str = (
        "This score is a proxy for ATS parseability and keyword alignment. "
        "It does not predict your ranking in any specific employer's ATS."
    )

    class Config:
        from_attributes = True


# ─────────────────────── Render ────────────────────────
class RenderRequest(BaseModel):
    format: str = "pdf"   # "pdf" | "docx"
    template: str = "clean"  # "clean" | "minimal"


# ─────────────────────── Tailor ────────────────────────
class TailorRequest(BaseModel):
    jd_text: str
    resume_title: str | None = None


class TailorOut(BaseModel):
    tailored_resume_id: UUID
    keywords_matched: list[str]
    keywords_missing: list[str]
    suggestions: list[str]


# ─────────────────────── Parse Check ────────────────────────
class ParseCheckResult(BaseModel):
    passed: bool
    sections_found: list[str]
    sections_missing: list[str]
    order_correct: bool
    issues: list[str]
    accuracy: float  # 0.0–1.0


# ─────────────────────── Cover Letter ────────────────────────
class CoverLetterRequest(BaseModel):
    jd_text: str
    company_name: str | None = None


class CoverLetterOut(BaseModel):
    id: str
    resume_id: str
    cover_letter: str
    jd_text: str
    company_name: str | None
    created_at: str
