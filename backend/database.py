import os
import time
import re
from dotenv import load_dotenv
from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker, DeclarativeBase

load_dotenv()

_raw_url = os.getenv("DATABASE_URL", "")
if _raw_url and not re.match(r"^(postgresql|sqlite)://", _raw_url.strip()):
    _raw_url = ""

DATABASE_URL = _raw_url or f"sqlite:///{os.path.join(os.path.dirname(os.path.abspath(__file__)), 'automl.db')}"

engine = create_engine(DATABASE_URL, echo=False, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

shared_metadata = MetaData(
    naming_convention={
        "ix": "ix_%(column_0_label)s",
        "uq": "uq_%(table_name)s_%(column_0_name)s",
        "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    }
)


class Base(DeclarativeBase):
    metadata = shared_metadata


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from models import (User, Team, TeamMember, ApiKey, Experiment, ModelRegistry,
                        Deployment, Pipeline, PipelineRun, Webhook, AuditLog,
                        Project, MarketplaceItem, Dataset, Notification,
                        UserSession, PredictionLog, ActivityLog)
    for attempt in range(30):
        try:
            Base.metadata.create_all(bind=engine)
            return
        except Exception:
            if attempt == 29:
                raise
            time.sleep(1)
