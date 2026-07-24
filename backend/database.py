import os
import time
import re
from dotenv import load_dotenv
from sqlalchemy import create_engine, MetaData, exc, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase

load_dotenv()

_raw_url = os.getenv("DATABASE_URL", "")
if _raw_url and not re.match(r"^(postgresql|sqlite)://", _raw_url.strip()):
    _raw_url = ""

DATABASE_URL = _raw_url or f"sqlite:///{os.path.join(os.path.dirname(os.path.abspath(__file__)), 'automl.db')}"

engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_size=10 if "postgresql" in DATABASE_URL else 5,
    max_overflow=20 if "postgresql" in DATABASE_URL else 10,
    pool_recycle=3600 if "postgresql" in DATABASE_URL else -1,
)
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


def _migrate_datasets_table():
    is_pg = "postgresql" in DATABASE_URL
    try:
        with engine.connect() as conn:
            if is_pg:
                result = conn.execute(text(
                    "SELECT column_name FROM information_schema.columns WHERE table_name='datasets'"
                ))
            else:
                result = conn.execute(text("PRAGMA table_info(datasets)"))
            if is_pg:
                existing = {row[0] for row in result}
            else:
                existing = {row[1] for row in result}

            migrations = [
                ("tags", "JSON" if is_pg else "TEXT", "'[]'"),
                ("version", "INTEGER" if is_pg else "INTEGER", "1"),
                ("source", "VARCHAR" if is_pg else "TEXT", "'upload'"),
                ("source_url", "VARCHAR" if is_pg else "TEXT", "NULL"),
            ]
            for col, col_type, default in migrations:
                if col not in existing:
                    conn.execute(text(f"ALTER TABLE datasets ADD COLUMN {col} {col_type} DEFAULT {default}"))
                    conn.commit()
    except Exception:
        pass


def init_db():
    from models import (User, Team, TeamMember, ApiKey, Experiment, ModelRegistry,
                        Deployment, DeploymentHistory, Pipeline, PipelineRun, Webhook, AuditLog,
                        Project, MarketplaceItem, Dataset, DatasetShare, Notification,
                        UserSession, PredictionLog, ActivityLog)
    for attempt in range(30):
        try:
            Base.metadata.create_all(bind=engine)
            _migrate_datasets_table()
            return
        except (exc.OperationalError, TimeoutError, ConnectionError, OSError):
            if attempt == 29:
                raise
            time.sleep(1)
