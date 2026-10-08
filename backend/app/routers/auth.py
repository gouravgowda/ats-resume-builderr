"""
Auth router — Firebase Auth handles register/login in the frontend.
This router only manages the user's profile document in Firestore.
"""
from fastapi import APIRouter, Depends

from app.deps import get_current_user_id
from app.firebase import get_or_create_user_profile
from app.schemas import UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me", response_model=UserOut)
async def get_me(user_id: str = Depends(get_current_user_id)):
    """
    Create (on first call) or fetch the signed-in user's profile.
    The frontend calls this right after Firebase register/login.
    """
    profile = await get_or_create_user_profile(user_id)
    return UserOut.model_validate(
        {
            "id": profile["id"],
            "email": profile.get("email") or "unknown@firebase.local",
            "created_at": profile.get("created_at"),
        }
    )
