"""
Bullet improvement router — calls the LLM (Groq) via the bullets service,
and saves improved text back to the Firestore resume document.
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException

from app.deps import get_current_user_id
from app.firebase import _to_thread, db, now_iso
from app.routers.resumes import load_full_resume
from app.schemas import BulletImproveRequest, BulletImproveResponse
from app.services.bullets import improve_bullet

router = APIRouter(prefix="/resumes", tags=["bullets"])


@router.post("/{resume_id}/bullets/improve", response_model=BulletImproveResponse)
async def improve_bullet_endpoint(
    resume_id: uuid.UUID,
    data: BulletImproveRequest,
    user_id: str = Depends(get_current_user_id),
):
    """
    Send a raw bullet text; receive an improved version.
    If no metric is in the original, returns needs_metric_prompt=True
    with a specific question to ask the student.
    Never invents numbers.
    """
    # Verify the resume belongs to the caller before doing work
    await load_full_resume(resume_id, user_id)
    return await improve_bullet(data.raw_text, data.context)


@router.put("/{resume_id}/bullets/{bullet_id}", response_model=dict)
async def update_bullet(
    resume_id: uuid.UUID,
    bullet_id: uuid.UUID,
    improved_text: str,
    user_id: str = Depends(get_current_user_id),
):
    """Save improved bullet text back to the resume document in Firestore."""
    ref = db().collection("resumes").document(str(resume_id))
    snap = await _to_thread(ref.get)
    if not snap.exists:
        raise HTTPException(status_code=404, detail="Resume not found.")
    doc = snap.to_dict() or {}
    if doc.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Access denied.")

    found = False
    for section in doc.get("sections", []):
        for entry in section.get("entries", []):
            for bullet in entry.get("bullets", []):
                if bullet.get("id") == str(bullet_id):
                    bullet["improved_text"] = improved_text
                    found = True

    if not found:
        raise HTTPException(status_code=404, detail="Bullet not found.")

    doc["updated_at"] = now_iso()
    await _to_thread(ref.set, doc)
    return {"status": "saved"}
