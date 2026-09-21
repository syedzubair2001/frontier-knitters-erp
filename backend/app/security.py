"""Password hashing + JWT tokens + auth dependency."""
from datetime import datetime, timedelta, timezone
import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext
from . import config

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer = HTTPBearer(auto_error=False)


def hash_password(plain: str) -> str:
    return pwd_ctx.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return pwd_ctx.verify(plain, hashed)
    except Exception:
        return False


def verify_password_compat(plain: str, stored: str) -> bool:
    """Old ERP DBs may store plain-text passwords. Accept both; the caller
    upgrades plain ones to a bcrypt hash on successful login."""
    if not stored:
        return False
    if stored.startswith("$2"):
        return verify_password(plain, stored)
    return plain == stored  # legacy plain text


def looks_hashed(stored: str) -> bool:
    return bool(stored) and stored.startswith("$2")


def make_token(username: str, role: str) -> str:
    payload = {
        "sub": username,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=config.JWT_HOURS),
    }
    return jwt.encode(payload, config.JWT_SECRET, algorithm="HS256")


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, config.JWT_SECRET, algorithms=["HS256"])
    except Exception:
        raise HTTPException(status_code=401, detail="Session expired. Please login again.")


def get_current_user(cred: HTTPAuthorizationCredentials = Depends(bearer)) -> dict:
    if not cred:
        raise HTTPException(status_code=401, detail="Login required.")
    return decode_token(cred.credentials)


def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "Super Admin":
        raise HTTPException(status_code=403, detail="Only Super Admin can do this.")
    return user
