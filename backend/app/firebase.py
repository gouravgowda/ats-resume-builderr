"""
Firebase Admin integration — ID token verification + Firestore data access.
Replaces the old SQLAlchemy/PostgreSQL data layer.

Firestore layout:
  users/{firebase_uid}                    { id, email, created_at, is_active }
  resumes/{uuid}                          resume document with embedded
                                          contact / sections / entries / bullets
  resumes/{uuid}/scores/{uuid}            scoring runs
  resumes/{uuid}/job_descriptions/{uuid}  pasted job descriptions

All document IDs are UUID strings (except user docs, keyed by Firebase UID).
Datetimes are stored as ISO-8601 strings so loads can go straight into the
Pydantic schemas without Firestore Timestamp conversion.
"""
import json
import os
import uuid
from datetime import datetime

import firebase_admin
from firebase_admin import auth as fb_auth
from firebase_admin import credentials, firestore

from app.config import settings

# ── Initialization ────────────────────────────────────────────────────────────
_initialized = False


def init_firebase() -> None:
    """Initialize the Firebase Admin SDK (idempotent)."""
    global _initialized
    if _initialized:
        return

    sa_json = settings.FIREBASE_SERVICE_ACCOUNT_JSON.strip()
    if sa_json:
        # Hosted environments (Render/Railway/Fly): whole JSON pasted as env var
        cred = credentials.Certificate(json.loads(sa_json))
        firebase_admin.initialize_app(cred)
        project = json.loads(sa_json).get("project_id")
        if project and not os.getenv("FIREBASE_PROJECT_ID"):
            os.environ["FIREBASE_PROJECT_ID"] = project
    elif (sa_file := settings.FIREBASE_SERVICE_ACCOUNT_FILE) and os.path.exists(sa_file):
        cred = credentials.Certificate(sa_file)
        firebase_admin.initialize_app(cred)
    elif os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
        # Standard Google ADC path (used in Docker/CI)
        firebase_admin.initialize_app()
    else:
        # Last resort: still start so /health works; auth calls will fail
        # with a clear error until a service account is configured.
        firebase_admin.initialize_app(options={"projectId": os.getenv("FIREBASE_PROJECT_ID")})
    _initialized = True


def verify_id_token(id_token: str) -> str:
    """
    Verify a Firebase ID token and return the user's UID.
    Raises ValueError when the token is invalid or expired.
    """
    decoded = fb_auth.verify_id_token(id_token)
    uid = decoded.get("uid")
    if not uid:
        raise ValueError("Token has no uid.")
    return uid


def get_user_email(uid: str) -> str | None:
    """Look up the account email in Firebase Auth (best effort)."""
    try:
        return fb_auth.get_user(uid).email
    except Exception:
        return None


# ── Firestore access ──────────────────────────────────────────────────────────
def db():
    """Firestore client (synchronous google-cloud-firestore client)."""
    return firestore.client()


def now_iso() -> str:
    return datetime.utcnow().isoformat()


def new_id() -> str:
    return str(uuid.uuid4())


# ── User profiles ─────────────────────────────────────────────────────────────
async def get_or_create_user_profile(uid: str) -> dict:
    """
    Create users/{uid} on first visit, then return it.
    Called by GET /auth/me from the frontend after register/login.
    """
    ref = db().collection("users").document(uid)
    snap = await _to_thread(ref.get)
    if snap.exists:
        return snap.to_dict()

    profile = {
        "id": uid,
        "email": await _to_thread(get_user_email, uid),
        "created_at": now_iso(),
        "is_active": True,
    }
    await _to_thread(ref.set, profile)
    return profile


# ── Async bridge ──────────────────────────────────────────────────────────────
async def _to_thread(fn, *args, **kwargs):
    """
    Run the synchronous Firestore/Admin calls in a worker thread so the
    FastAPI event loop is never blocked.
    """
    import asyncio
    return await asyncio.to_thread(fn, *args, **kwargs)
