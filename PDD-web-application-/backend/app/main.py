import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.db.database import connect_db, close_db, get_db
from app.core.config import get_settings
from app.core.security import hash_password
from datetime import datetime
from app.routers import auth, user, predict, chat, hospitals, report

logger = logging.getLogger("healthsense")
settings = get_settings()

# ── Rate limiter (global) ──────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="HealthSense AI",
    description="Multiple Disease Prediction API with SHAP Explainability",
    version="1.0.0",
    # Disable /docs and /redoc in production to reduce information disclosure
    # docs_url=None,
    # redoc_url=None,
)

# Attach rate limiter state and handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS (CRIT-05 fix) ────────────────────────────────────────────────────────
# Reads allowed origins from env var ALLOWED_ORIGINS (comma-separated).
# Defaults to localhost only. Set explicitly in Render env vars for production.
allowed_origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,    # Explicit allowlist — NOT "*"
    allow_credentials=True,           # Required for httpOnly cookies (LOW-01 fix)
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# ── Security headers middleware (MED-05) ──────────────────────────────────────
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    # HSTS (only meaningful over HTTPS)
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# ── Request body size limit middleware (HIGH-04) ──────────────────────────────
MAX_REQUEST_BODY_BYTES = 15 * 1024 * 1024  # 15 MB hard cap

@app.middleware("http")
async def limit_request_body_size(request: Request, call_next):
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > MAX_REQUEST_BODY_BYTES:
        return JSONResponse(
            {"detail": "Request body too large. Maximum size is 15 MB."},
            status_code=413,
        )
    return await call_next(request)


@app.on_event("startup")
async def startup():
    try:
        await connect_db()
        db = get_db()
        demo_user = await db.users.find_one({"email": "tester@healthsense.ai"})
        if not demo_user:
            # CRIT-04 fix: seed demo user with a real bcrypt-hashed password
            demo_password = "Demo@HealthSense2026!"
            await db.users.insert_one({
                "name": "Demo Tester",
                "email": "tester@healthsense.ai",
                "hashed_password": hash_password(demo_password),
                "age": 32,
                "gender": "Male",
                "weight": 76.5,
                "height": 178,
                "blood_type": "O+",
                "existing_conditions": [],
                "allergies": [],
                "created_at": datetime.utcnow(),
            })
            logger.info("[OK] Seeded demo user: tester@healthsense.ai")
    except Exception as e:
        logger.warning(f"[WARNING] Database connection failed on startup: {e}")
        logger.warning("Application will continue running with limited functionality.")


@app.on_event("shutdown")
async def shutdown():
    await close_db()


app.include_router(auth.router)
app.include_router(user.router)
app.include_router(predict.router)
app.include_router(chat.router)
app.include_router(hospitals.router)
app.include_router(report.router)


@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "service": "HealthSense AI API"}
