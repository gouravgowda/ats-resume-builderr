"""
Cover letter router — generate and list AI cover letters.
Results are stored in the resumes/{id}/cover_letters subcollection in Firestore.
"""
import uuid

from fastapi import APIRouter, Depends

from app.deps import get_current_user_id
from app.firebase import _to_thread, db, new_id, now_iso
from app.routers.resumes import load_full_resume
from app.schemas import CoverLetterOut, CoverLetterRequest
from app.services.cover_letter import generate_cover_letter

router = APIRouter(prefix="/resumes", tags=["cover-letter"])


@router.post("/{resume_id}/cover-letter", response_model=CoverLetterOut)
async def create_cover_letter(
    resume_id: uuid.UUID,
    data: CoverLetterRequest,
    user_id: str = Depends(get_current_user_id),
):
    resume = await load_full_resume(resume_id, user_id)

    cover_letter_text = await generate_cover_letter(
        resume, data.jd_text, data.company_name
    )

    cl_id = new_id()
    cl_doc = {
        "id": cl_id,
        "resume_id": str(resume_id),
        "cover_letter": cover_letter_text,
        "jd_text": data.jd_text,
        "company_name": data.company_name,
        "created_at": now_iso(),
    }
    cl_ref = (
        db().collection("resumes").document(str(resume_id))
        .collection("cover_letters").document(cl_id)
    )
    await _to_thread(cl_ref.set, cl_doc)

    return CoverLetterOut.model_validate(cl_doc)


@router.get("/{resume_id}/cover-letters", response_model=list[CoverLetterOut])
async def list_cover_letters(
    resume_id: uuid.UUID,
    user_id: str = Depends(get_current_user_id),
):
    await load_full_resume(resume_id, user_id)

    cl_ref = (
        db().collection("resumes").document(str(resume_id))
        .collection("cover_letters")
    )
    docs = await _to_thread(cl_ref.get)
    items = [doc.to_dict() for doc in docs]
    items.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return [CoverLetterOut.model_validate(item) for item in items]
