import os
import sys

# ── Environment variables MUST be set before any app module imports ──
os.environ.setdefault("JWT_SECRET", "test-jwt-secret-key-for-ci")
os.environ.setdefault("CSRF_SECRET", "")
os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ.setdefault("RATE_LIMIT_MAX", "100000")
os.environ.setdefault("RATE_LIMIT_WINDOW_SEC", "3600")

# ── Path setup ──────────────────────────────────────────────────────
_backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from database import Base, get_db
from main import app

_TEST_ENGINE = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
_TestSession = sessionmaker(autocommit=False, autoflush=False, bind=_TEST_ENGINE)


@pytest.fixture(autouse=True)
def _setup_db():
    Base.metadata.create_all(bind=_TEST_ENGINE)
    yield
    Base.metadata.drop_all(bind=_TEST_ENGINE)


@pytest.fixture
def db():
    session = _TestSession()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db):
    def _override():
        yield db

    app.dependency_overrides[get_db] = _override
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def dataset_dir(tmp_path, monkeypatch):
    monkeypatch.setattr("main.DATASET_DIR", str(tmp_path))
    monkeypatch.setattr("cleaning.DATASET_DIR", str(tmp_path))
    return tmp_path
