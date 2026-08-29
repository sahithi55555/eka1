import os
from pathlib import Path
from typing import List, Union

from pydantic_settings import BaseSettings, SettingsConfigDict

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
BACKEND_ENV_PATH = BACKEND_DIR / ".env"

if BACKEND_ENV_PATH.exists():
    load_dotenv(dotenv_path=BACKEND_ENV_PATH, override=True)
elif Path(".env").exists():
    load_dotenv(dotenv_path=".env", override=True)


class Settings(BaseSettings):
    PROJECT_NAME: str = "Enterprise Knowledge Assistant API"
    API_V1_STR: str = "/api/v1"
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5173"]

    # External dependencies
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "eka_db"
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    LLM_MODEL: str = "gemini-2.5-flash"
    LLM_BASE_URL: str = "https://generativelanguage.googleapis.com/v1beta/openai/"
    INITIAL_ADMIN_EMAIL: str = "admin@eka.com"
    INITIAL_ADMIN_PASSWORD: str = "admin123"

    # Auth
    SECRET_KEY: str = "placeholder_secret_key_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    UPLOAD_DIR: str = "storage/uploads"
    CHAT_HISTORY_LIMIT: int = 10

    model_config = SettingsConfigDict(
        env_file=(".env", str(BACKEND_ENV_PATH)),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()

