"""
Dependency injection helpers.
Verifies Firebase ID tokens sent by the frontend as Bearer tokens.
"""
import asyncio

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.firebase import verify_id_token

bearer = HTTPBearer(auto_error=False)  # missing header → our own 401 below


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
) -> str:
    """Return the Firebase UID for the request, or 401."""
    if credentials is None:
        raise HTTPException(status_code=401, detail="Not authenticated.")
    try:
        # firebase-admin verification is synchronous; keep the event loop free
        uid = await asyncio.to_thread(verify_id_token, credentials.credentials)
        if not uid:
            raise ValueError("No uid in token.")
        return uid
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")
