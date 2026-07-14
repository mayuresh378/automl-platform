import os
import re
import hashlib
import secrets
from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from database import get_db
from models import User

SECRET_KEY = os.environ.get("JWT_SECRET") or os.environ.get("SECRET_KEY") or "please-set-jwt-secret-env-var"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours
REFRESH_TOKEN_EXPIRE_DAYS = 7

security = HTTPBearer(auto_error=False)

EMAIL_RE = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
PASSWORD_MIN = 6


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode(), hashed.encode())
    except Exception:
        return False


def validate_email(email: str) -> bool:
    return bool(EMAIL_RE.match(email))


def validate_password(password: str) -> tuple[bool, str]:
    if len(password) < PASSWORD_MIN:
        return False, f"Password must be at least {PASSWORD_MIN} characters"
    return True, ""


def sanitize_filename(name: str) -> str:
    return re.sub(r"[^\w\.\-]", "_", name)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None


def register_user(db: Session, email: str, password: str, name: str) -> dict:
    email = email.strip().lower()
    name = name.strip()

    if not validate_email(email):
        raise HTTPException(status_code=400, detail="Invalid email format")

    valid, msg = validate_password(password)
    if not valid:
        raise HTTPException(status_code=400, detail=msg)

    if not name:
        raise HTTPException(status_code=400, detail="Name is required")

    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        id=f"usr_{secrets.token_hex(12)}",
        email=email,
        name=name,
        password_hash=hash_password(password),
        role="member",
        is_active=True,
        created_at=datetime.now(timezone.utc),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id, "email": email})
    refresh_token = create_refresh_token({"sub": user.id})
    return {
        "token": token,
        "refresh_token": refresh_token,
        "user": {"id": user.id, "email": email, "name": name, "role": user.role},
    }


def login_user(db: Session, email: str, password: str) -> dict:
    email = email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    token = create_access_token({"sub": user.id, "email": email})
    refresh_token = create_refresh_token({"sub": user.id})
    return {
        "token": token,
        "refresh_token": refresh_token,
        "user": {"id": user.id, "email": email, "name": user.name, "role": user.role},
    }


def refresh_token(token: str, db: Session) -> dict:
    payload = decode_token(token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or disabled")
    new_token = create_access_token({"sub": user.id, "email": user.email})
    return {"token": new_token}


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> dict:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Authentication required")
    payload = decode_token(credentials.credentials)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if user is None or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or disabled")
    return {"id": user.id, "email": user.email, "name": user.name, "role": user.role}


def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> dict:
    if credentials is None:
        return {"id": "anonymous", "email": "guest@automl.local", "name": "Guest", "role": "guest"}
    try:
        return get_current_user(credentials, db)
    except HTTPException:
        return {"id": "anonymous", "email": "guest@automl.local", "name": "Guest", "role": "guest"}
