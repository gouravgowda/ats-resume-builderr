"""
Tailor router — creates a JD-tailored copy of a resume in Firestore.
"""
import uuid

from fastapi import APIRouter, Depends

from app.deps import get_current_user_id
from app.firebase import _to_thread, db, new_id, now_iso
from app.routers.resumes import load_full_resume
from app.schemas import TailorOut, TailorRequest
from app.services.tailor import compute_overlap, extract_keywords, generate_suggestions

router = APIRouter(prefix="/resumes", tags=["tailor"])


def clone_sections(sections: list) -> list:
    """Deep copy sections/entries/bullets with fresh IDs for the new document."""
    cloned = []
    for section in sections:
        entries = []
        for entry in section.get("entries", []):
            bullets = [
                {
                    **bullet,
                    "id": new_id(),
                }
                for bullet in entry.get("bullets", [])
            ]
            entries.append(
                {
                    "id": new_id(),
                    "order_index": entry.get("order_index", 0),
                    "payload": entry.get("payload", {}),
                    "bullets": bullets,
                }
            )
        cloned.append(
            {
                "id": new_id(),
                "type": section.get("type"),
                "order_index": section.get("order_index", 0),
                "entries": entries,
            }
        )
    return cloned


@router.post("/{resume_id}/tailor", response_model=TailorOut)
async def tailor_resume(
    resume_id: uuid.UUID,
    data: TailorRequest,
    user_id: str = Depends(get_current_user_id),
):
    original = await load_full_resume(resume_id, user_id)

    # Extract keywords from JD
    jd_keywords = extract_keywords(data.jd_text)

    # Compute overlap
    matched, missing = compute_overlap(original, jd_keywords)

    # Generate suggestions
    suggestions = generate_suggestions(missing, matched)

    # Build the tailored copy document
    original_doc = original.model_dump()
    new_resume_id = new_id()

    contact = original_doc.get("contact")
    if contact:
        contact = {**contact, "id": new_id(), "resume_id": new_resume_id}

    new_doc = {
        "id": new_resume_id,
        "user_id": user_id,
        "title": data.resume_title or f"{original.title} (Tailored)",
        "created_at": now_iso(),
        "updated_at": now_iso(),
        "is_tailored_copy_of": str(resume_id),
        "contact": contact,
        "sections": clone_sections(original_doc.get("sections", [])),
    }
    ref = db().collection("resumes").document(new_resume_id)
    await _to_thread(ref.set, new_doc)

    # Save JD on the new copy
    jd_doc = {
        "id": new_id(),
        "resume_id": new_resume_id,
        "raw_text": data.jd_text,
        "extracted_keywords": jd_keywords,
        "created_at": now_iso(),
    }
    jd_ref = ref.collection("job_descriptions").document(jd_doc["id"])
    await _to_thread(jd_ref.set, jd_doc)

    return TailorOut(
        tailored_resume_id=uuid.UUID(new_resume_id),
        keywords_matched=matched,
        keywords_missing=missing,
        suggestions=suggestions,
    )
