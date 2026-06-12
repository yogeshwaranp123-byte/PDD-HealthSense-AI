from fastapi import APIRouter, HTTPException, Request, Response, status, Depends
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.models.schemas import UserRegister, UserLogin, TokenRefresh, TokenResponse
from app.core.security import hash_password, verify_password, get_current_user, revoke_token
from app.core.jwt_handler import create_access_token, create_refresh_token, decode_token, JWTDecodeError
from app.core.config import get_settings
from app.db.database import get_db
from datetime import datetime
import uuid

router = APIRouter(prefix="/auth", tags=["Authentication"])
limiter = Limiter(key_func=get_remote_address)
settings = get_settings()

# Determine whether to use Secure flag (True in production over HTTPS, False for localhost)
_COOKIE_SECURE = not settings.ALLOWED_ORIGINS.startswith("http://localhost")


def _set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    """LOW-01 fix: Set tokens as httpOnly cookies so JavaScript cannot access them.
    - httponly=True  → inaccessible to document.cookie / XSS
    - secure=True    → HTTPS only (set False only for local dev via env)
    - samesite='strict' → CSRF protection
    """
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=_COOKIE_SECURE,
        samesite="strict",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=_COOKIE_SECURE,
        samesite="strict",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        path="/auth/refresh",   # Scoped: only sent to the refresh endpoint
    )


def _clear_auth_cookies(response: Response) -> None:
    """Clear both auth cookies on logout."""
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/auth/refresh")


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def register(request: Request, response: Response, payload: UserRegister):
    db = get_db()
    existing = await db.users.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_doc = {
        "name": payload.name,
        "email": payload.email,
        "hashed_password": hash_password(payload.password),
        "age": None,
        "gender": None,
        "weight": None,
        "height": None,
        "blood_type": None,
        "existing_conditions": [],
        "allergies": [],
        "created_at": datetime.utcnow(),
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    jti_access = str(uuid.uuid4())
    jti_refresh = str(uuid.uuid4())
    access_token = create_access_token({"sub": user_id, "jti": jti_access})
    refresh_token_val = create_refresh_token({"sub": user_id, "jti": jti_refresh})

    # LOW-01 fix: set httpOnly cookies
    _set_auth_cookies(response, access_token, refresh_token_val)

    # Also return tokens in body for backward compatibility with mobile clients
    return TokenResponse(access_token=access_token, refresh_token=refresh_token_val)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
async def login(request: Request, response: Response, payload: UserLogin):
    db = get_db()
    user = await db.users.find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user.get("hashed_password", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user_id = str(user["_id"])
    jti_access = str(uuid.uuid4())
    jti_refresh = str(uuid.uuid4())
    access_token = create_access_token({"sub": user_id, "jti": jti_access})
    refresh_token_val = create_refresh_token({"sub": user_id, "jti": jti_refresh})

    # LOW-01 fix: set httpOnly cookies
    _set_auth_cookies(response, access_token, refresh_token_val)

    return TokenResponse(access_token=access_token, refresh_token=refresh_token_val)


@router.post("/refresh", response_model=TokenResponse)
@limiter.limit("10/minute")
async def refresh_token(request: Request, response: Response, payload: TokenRefresh):
    """Issue new tokens. Accepts refresh token from cookie (web) or request body (mobile)."""
    # Prefer httpOnly cookie; fall back to request body (for mobile clients)
    cookie_refresh = request.cookies.get("refresh_token")
    token_str = cookie_refresh or payload.refresh_token

    if not token_str:
        raise HTTPException(status_code=401, detail="No refresh token provided")

    try:
        token_data = decode_token(token_str)
    except JWTDecodeError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    if token_data.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user_id = token_data.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    jti_access = str(uuid.uuid4())
    jti_refresh = str(uuid.uuid4())
    access_token = create_access_token({"sub": user_id, "jti": jti_access})
    refresh_token_val = create_refresh_token({"sub": user_id, "jti": jti_refresh})

    # LOW-01 fix: refresh cookies too
    _set_auth_cookies(response, access_token, refresh_token_val)

    return TokenResponse(access_token=access_token, refresh_token=refresh_token_val)


@router.post("/logout", status_code=204)
async def logout(
    request: Request,
    response: Response,
    user_id: str = Depends(get_current_user),
):
    """Revoke the access token server-side and clear auth cookies."""
    # Revoke via Authorization header (Bearer) or cookie
    token = None
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[len("Bearer "):]
    elif request.cookies.get("access_token"):
        token = request.cookies.get("access_token")

    if token:
        try:
            payload = decode_token(token)
            jti = payload.get("jti")
            if jti:
                revoke_token(jti)
        except JWTDecodeError:
            pass  # Already invalid — no-op

    # LOW-01 fix: clear cookies on logout
    _clear_auth_cookies(response)
    return None


@router.get("/me")
async def get_me(
    request: Request,
    user_id: str = Depends(get_current_user),
):
    """Returns the authenticated user_id. Used by frontend to check cookie-based auth state."""
    return {"user_id": user_id, "authenticated": True}
