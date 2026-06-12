from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Required — no defaults so startup fails loudly if not set
    MONGO_URI: str
    SECRET_KEY: str                           # generate: python -c "import secrets; print(secrets.token_hex(32))"

    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Third-party API keys (optional at startup, checked at use-time)
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    GOOGLE_PLACES_API_KEY: str = ""

    # Allowed frontend origins (comma-separated) — e.g. "http://localhost:5173,https://yourdomain.com"
    ALLOWED_ORIGINS: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
