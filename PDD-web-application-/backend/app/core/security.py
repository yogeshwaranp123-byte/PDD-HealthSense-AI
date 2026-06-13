import bcrypt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from app.core.jwt_handler import decode_token, JWTDecodeError
from app.db.database import get_db
from bson import ObjectId

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

# ── Token blocklist (in-memory; survives for process lifetime) ───────────────
# For production, replace with a Redis set or a MongoDB collection.
_revoked_tokens: set[str] = set()


def revoke_token(jti: str) -> None:
    """Add a token's JTI to the blocklist."""
    _revoked_tokens.add(jti)


def is_token_revoked(jti: str) -> bool:
    return jti in _revoked_tokens


# ── Password helpers ──────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Return True only when plain matches the stored bcrypt hash.
    An empty or missing hash always returns False (CRIT-04 fix)."""
    if not hashed or not plain:
        return False
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


# ── Authentication dependency ─────────────────────────────────────────────────

async def get_current_user(
    request: Request,
    token: str = Depends(oauth2_scheme),
) -> str:
    """Validate the Bearer JWT and return the authenticated user_id.

    LOW-01 fix: Also accepts the token from the httpOnly 'access_token' cookie,
    so the web frontend never needs to touch tokens via JavaScript.
    Raises HTTP 401 on any invalid, expired, or revoked token.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Prefer Authorization header; fall back to httpOnly cookie (web clients)
    raw_token = token
    if not raw_token or raw_token == "":
        raw_token = request.cookies.get("access_token", "")
    if not raw_token:
        raise credentials_exception

    try:
        payload = decode_token(raw_token)
    except JWTDecodeError:
        raise credentials_exception

    # Verify token type
    if payload.get("type") != "access":
        raise credentials_exception

    # Check blocklist (logout support)
    jti = payload.get("jti")
    if jti and is_token_revoked(jti):
        raise credentials_exception

    user_id: str = payload.get("sub")
    if not user_id:
        raise credentials_exception

    return user_id
