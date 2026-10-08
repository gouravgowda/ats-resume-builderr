"""
Scoring router — runs the full deterministic scoring engine.
Results are stored in the resumes/{id}/scores subcollection in Firestore.
"""
import uuid

from fastapi import APIRouter, Depends

from app.deps import get_current_user_id
from app.firebase import _to_thread, db, new_id, now_iso
from app.routers.resumes import load_full_resume
from app.schemas import ScoreOut, ScoreRequest
from app.services.parse_check import check_parse
from app.services.renderer import render_pdf
from app.services.scorer import compute_score
from app.services.tailor import extract_keywords

router = APIRouter(prefix="/resumes", tags=["score"])


@router.get("/{resume_id}/scores", response_model=list[ScoreOut])
async def list_scores(
    resume_id: uuid.UUID,
    user_id: str = Depends(get_current_user_id),
):
    await load_full_resume(resume_id, user_id)

    scores_ref = (
        db().collection("resumes").document(str(resume_id))
        .collection("scores")
    )
    docs = await _to_thread(scores_ref.get)
    items = [doc.to_dict() for doc in docs]
    items.sort(key=lambda x: x.get("computed_at", ""), reverse=True)
    return [ScoreOut(**item) for item in items]


@router.post("/{resume_id}/score", response_model=ScoreOut)
async def score_resume(
    resume_id: uuid.UUID,
    data: ScoreRequest,
    user_id: str = Depends(get_current_user_id),
):
    resume = await load_full_resume(resume_id, user_id)

    # Run parse check (generates PDF internally)
    pdf_bytes = await render_pdf(resume)
    parse_result = check_parse(pdf_bytes, resume)

    # Extract JD keywords if provided
    jd_id = None
    jd_keywords = None
    if data.jd_text:
        jd_keywords = extract_keywords(data.jd_text)
        jd_id = new_id()
        jd_doc = {
            "id": jd_id,
            "resume_id": str(resume_id),
            "raw_text": data.jd_text,
            "extracted_keywords": jd_keywords,
            "created_at": now_iso(),
        }
        jd_ref = (
            db().collection("resumes").document(str(resume_id))
            .collection("job_descriptions").document(jd_id)
        )
        await _to_thread(jd_ref.set, jd_doc)

    # Compute scores
    score_data = compute_score(resume, parse_result, jd_keywords)

    # Save score to subcollection
    score_id = new_id()
    score_doc = {
        "id": score_id,
        "resume_id": str(resume_id),
        "jd_id": jd_id,
        **score_data,
        "computed_at": now_iso(),
    }
    score_ref = (
        db().collection("resumes").document(str(resume_id))
        .collection("scores").document(score_id)
    )
    await _to_thread(score_ref.set, score_doc)

    return ScoreOut(**score_doc)
