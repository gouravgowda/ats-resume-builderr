"""
Resume CRUD router — Firestore data layer.
Handles: create, list, get, update, delete resumes.

The whole resume (contact, sections, entries, bullets) is stored as one
Firestore document so it can be loaded in a single read. Scores and job
descriptions live in subcollections: resumes/{id}/scores, resumes/{id}/job_descriptions.
"""
import copy
import json
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status

from app.config import settings
from app.deps import get_current_user_id
from app.firebase import _to_thread, db, new_id, now_iso
from app.schemas import (
    ContactInfoCreate,
    RenameTitleRequest,
    ResumeCreate,
    ResumeOut,
    ResumeSectionCreate,
    ResumeSummary,
    ResumeUpdate,
)

router = APIRouter(prefix="/resumes", tags=["resumes"])

FIRESTORE_BASE = "resumes"


# ── Load helpers ──────────────────────────────────────────────────────────────
async def load_full_resume(resume_id: uuid.UUID | str, user_id: str) -> ResumeOut:
    """Load a resume document from Firestore and verify ownership."""
    ref = db().collection(FIRESTORE_BASE).document(str(resume_id))
    snap = await _to_thread(ref.get)
    if not snap.exists:
        raise HTTPException(status_code=404, detail="Resume not found.")
    data = snap.to_dict() or {}
    if data.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Access denied.")
    return ResumeOut.model_validate(data)


# ── Schema → stored dict helpers ──────────────────────────────────────────────
def contact_to_dict(contact: ContactInfoCreate, resume_id: str) -> dict:
    return {"id": new_id(), "resume_id": resume_id, **contact.model_dump()}


def section_to_dict(sec: ResumeSectionCreate) -> dict:
    entries = []
    for entry in sec.entries:
        bullets = [
            {
                "id": new_id(),
                "raw_text": b.raw_text,
                "improved_text": None,
                "has_metric": False,
                "order_index": b.order_index,
                "needs_metric_prompt": False,
                "metric_question": None,
            }
            for b in entry.bullets
        ]
        entries.append(
            {
                "id": new_id(),
                "order_index": entry.order_index,
                "payload": entry.payload,
                "bullets": bullets,
            }
        )
    return {
        "id": new_id(),
        "type": sec.type.value,
        "order_index": sec.order_index,
        "entries": entries,
    }


def sections_to_dict(sections: list[ResumeSectionCreate]) -> list:
    return [section_to_dict(s) for s in sections]


# ── Endpoints ─────────────────────────────────────────────────────────────────
@router.post("", response_model=ResumeOut, status_code=status.HTTP_201_CREATED)
async def create_resume(
    data: ResumeCreate,
    user_id: str = Depends(get_current_user_id),
):
    resume_id = new_id()
    doc = {
        "id": resume_id,
        "user_id": user_id,
        "title": data.title,
        "created_at": now_iso(),
        "updated_at": now_iso(),
        "is_tailored_copy_of": None,
        "contact": contact_to_dict(data.contact, resume_id),
        "sections": sections_to_dict(data.sections),
    }
    ref = db().collection(FIRESTORE_BASE).document(resume_id)
    await _to_thread(ref.set, doc)
    return ResumeOut.model_validate(doc)


@router.post("/import", response_model=ResumeOut, status_code=status.HTTP_201_CREATED)
async def import_resume(
    file: UploadFile,
    user_id: str = Depends(get_current_user_id),
):
    """Upload a PDF resume, extract structured data via AI, and create a resume."""
    if not settings.GROQ_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Resume import is unavailable: GROQ_API_KEY is not configured.",
        )

    if file.content_type not in ("application/pdf",) and not (
        file.filename and file.filename.lower().endswith(".pdf")
    ):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    from app.services.importer import (
        build_resume_doc,
        extract_text_from_pdf,
        parse_resume_text,
    )

    pdf_bytes = await file.read()
    if not pdf_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    text = extract_text_from_pdf(pdf_bytes)
    if not text.strip():
        raise HTTPException(
            status_code=422, detail="Could not extract any text from the PDF."
        )

    try:
        parsed = await parse_resume_text(text)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=422,
            detail="AI returned invalid JSON. Please try again.",
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI parsing failed: {exc}")

    doc = build_resume_doc(parsed, user_id)
    ref = db().collection(FIRESTORE_BASE).document(doc["id"])
    await _to_thread(ref.set, doc)
    return ResumeOut.model_validate(doc)


@router.get("", response_model=list[ResumeSummary])
async def list_resumes(user_id: str = Depends(get_current_user_id)):
    snaps = await _to_thread(
        lambda: list(db().collection(FIRESTORE_BASE).where("user_id", "==", user_id).stream())
    )
    summaries: list[ResumeSummary] = []
    for snap in snaps:
        d = snap.to_dict() or {}
        summaries.append(
            ResumeSummary.model_validate(
                {
                    "id": snap.id,
                    "title": d.get("title", "Untitled"),
                    "created_at": d.get("created_at"),
                    "updated_at": d.get("updated_at"),
                    "is_tailored_copy_of": d.get("is_tailored_copy_of"),
                }
            )
        )
    # Sort client-side to avoid requiring a composite Firestore index
    summaries.sort(key=lambda s: s.updated_at or datetime.min, reverse=True)
    return summaries


@router.get("/{resume_id}", response_model=ResumeOut)
async def get_resume(
    resume_id: uuid.UUID,
    user_id: str = Depends(get_current_user_id),
):
    return await load_full_resume(resume_id, user_id)


@router.put("/{resume_id}/sections", response_model=ResumeOut)
async def update_sections(
    resume_id: uuid.UUID,
    data: ResumeUpdate,
    user_id: str = Depends(get_current_user_id),
):
    ref = db().collection(FIRESTORE_BASE).document(str(resume_id))
    snap = await _to_thread(ref.get)
    if not snap.exists:
        raise HTTPException(status_code=404, detail="Resume not found.")
    doc = snap.to_dict() or {}
    if doc.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Access denied.")

    if data.title:
        doc["title"] = data.title

    if data.contact:
        existing = doc.get("contact") or {}
        contact = {
            **existing,
            "id": existing.get("id", new_id()),
            "resume_id": str(resume_id),
            **data.contact.model_dump(exclude_unset=True),
        }
        doc["contact"] = contact

    if data.sections is not None:
        doc["sections"] = sections_to_dict(data.sections)

    doc["updated_at"] = now_iso()
    await _to_thread(ref.set, doc)
    return ResumeOut.model_validate(doc)


@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resume(
    resume_id: uuid.UUID,
    user_id: str = Depends(get_current_user_id),
):
    ref = db().collection(FIRESTORE_BASE).document(str(resume_id))
    snap = await _to_thread(ref.get)
    if not snap.exists:
        raise HTTPException(status_code=404, detail="Resume not found.")
    if (snap.to_dict() or {}).get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Access denied.")

    # Best-effort cleanup of subcollections (scores, job_descriptions)
    for sub in ("scores", "job_descriptions"):
        sub_snaps = await _to_thread(lambda s=sub: list(ref.collection(s).stream()))
        for sub_snap in sub_snaps:
            await _to_thread(sub_snap.reference.delete)

    await _to_thread(ref.delete)


@router.post("/{resume_id}/duplicate", response_model=ResumeOut, status_code=status.HTTP_201_CREATED)
async def duplicate_resume(
    resume_id: uuid.UUID,
    user_id: str = Depends(get_current_user_id),
):
    ref = db().collection(FIRESTORE_BASE).document(str(resume_id))
    snap = await _to_thread(ref.get)
    if not snap.exists:
        raise HTTPException(status_code=404, detail="Resume not found.")
    data = snap.to_dict() or {}
    if data.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Access denied.")

    from app.routers.tailor import clone_sections

    new_resume_id = new_id()
    original_contact = data.get("contact") or {}
    new_contact = {**copy.deepcopy(original_contact), "id": new_id(), "resume_id": new_resume_id}

    doc = {
        "id": new_resume_id,
        "user_id": user_id,
        "title": f"{data.get('title', 'Untitled')} (Copy)",
        "created_at": now_iso(),
        "updated_at": now_iso(),
        "is_tailored_copy_of": None,
        "contact": new_contact,
        "sections": clone_sections(data.get("sections", [])),
    }
    new_ref = db().collection(FIRESTORE_BASE).document(new_resume_id)
    await _to_thread(new_ref.set, doc)
    return ResumeOut.model_validate(doc)


@router.patch("/{resume_id}/title", response_model=ResumeSummary)
async def rename_resume(
    resume_id: uuid.UUID,
    body: RenameTitleRequest,
    user_id: str = Depends(get_current_user_id),
):
    ref = db().collection(FIRESTORE_BASE).document(str(resume_id))
    snap = await _to_thread(ref.get)
    if not snap.exists:
        raise HTTPException(status_code=404, detail="Resume not found.")
    data = snap.to_dict() or {}
    if data.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Access denied.")

    updated_at = now_iso()
    await _to_thread(ref.update, {"title": body.title, "updated_at": updated_at})
    return ResumeSummary.model_validate({
        "id": str(resume_id),
        "title": body.title,
        "created_at": data.get("created_at"),
        "updated_at": updated_at,
        "is_tailored_copy_of": data.get("is_tailored_copy_of"),
    })
