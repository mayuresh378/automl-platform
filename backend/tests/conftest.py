import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, get_db
from main import app

TEST_DB_PATH = os.path.join(os.path.dirname(__file__), "_test.db")

if os.path.exists(TEST_DB_PATH):
    os.remove(TEST_DB_PATH)

engine = create_engine(f"sqlite:///{TEST_DB_PATH}", connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables once at module load
Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def tx_session():
    """Wrap each test in a transaction that gets rolled back."""
    conn = engine.connect()
    tx = conn.begin()
    session = TestingSessionLocal(bind=conn)
    orig_close = session.close
    session.close = lambda: None

    def _get_db_override():
        yield session

    app.dependency_overrides[get_db] = _get_db_override

    yield session

    session.close = orig_close
    session.close()
    tx.rollback()
    conn.close()
    app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def db(tx_session):
    return tx_session
