"""
FastAPI application entrypoint.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.firebase import init_firebase
from app.routers import (
    auth,
    bullets,
    cover_letter,
    parse_check,
    render,
    resumes,
    score,
    tailor,
)

app = FastAPI(
    title="ATS Resume Builder API",
    description="Generates ATS-parseable PDF resumes and checks them against a job description.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(resumes.router)
app.include_router(bullets.router)
app.include_router(render.router)
app.include_router(parse_check.router)
app.include_router(score.router)
app.include_router(tailor.router)
app.include_router(cover_letter.router)


@app.on_event("startup")
async def startup():
    # Firebase Admin (ID tokens + Firestore). Data now lives in Firestore —
    # no SQL tables to create.
    init_firebase()


@app.get("/health")
async def health():
    return {"status": "ok", "version": "2.0.0"}
