import os
import json
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
USERS_FILE = os.path.join(BASE_DIR, "users.json")
SECRET_KEY = os.environ.get("JWT_SECRET", "automl-dev-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

security = HTTPBearer(auto_error=False)


def _load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE) as f:
            return json.load(f)
    return []


def _save_users(users):
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=2)


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    h = hashlib.sha256((salt + password).encode()).hexdigest()
    return f"{salt}:{h}"


def verify_password(plain: str, hashed: str) -> bool:
    salt, h = hashed.split(":")
    return hashlib.sha256((salt + plain).encode()).hexdigest() == h


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None


def register_user(email: str, password: str, name: str) -> dict:
    users = _load_users()
    if any(u["email"] == email for u in users):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = {
        "id": f"usr_{datetime.now().strftime('%Y%m%d%H%M%S')}_{secrets.token_hex(4)}",
        "email": email,
        "password": hash_password(password),
        "name": name,
        "created_at": datetime.now().isoformat(),
    }
    users.append(user)
    _save_users(users)
    token = create_access_token({"sub": user["id"], "email": email})
    return {"token": token, "user": {"id": user["id"], "email": email, "name": name}}


def login_user(email: str, password: str) -> dict:
    users = _load_users()
    user = next((u for u in users if u["email"] == email), None)
    if not user or not verify_password(password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": user["id"], "email": email})
    return {"token": token, "user": {"id": user["id"], "email": email, "name": user["name"]}}


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials is None:
        return {"id": "anonymous", "email": "guest@automl.local", "name": "Guest"}
    payload = decode_token(credentials.credentials)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    users = _load_users()
    user = next((u for u in users if u["id"] == payload.get("sub")), None)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return {"id": user["id"], "email": user["email"], "name": user["name"]}
