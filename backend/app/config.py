import os

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Kept for backwards compatibility; data now lives in Firestore
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./ats.db")
    # Firebase Admin — path to the service account JSON key file
    FIREBASE_SERVICE_ACCOUNT_FILE: str = os.getenv(
        "FIREBASE_SERVICE_ACCOUNT_FILE", "./firebase-service-account.json"
    )
    # Alternative for hosts without secret files (Render, Railway, etc.):
    # paste the whole service-account JSON as one env var; it takes precedence.
    FIREBASE_SERVICE_ACCOUNT_JSON: str = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:3001"]

    class Config:
        env_file = ".env"


settings = Settings()
