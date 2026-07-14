import os
import time
import re
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker, DeclarativeBase

_raw_url = os.getenv("DATABASE_URL", "")
# Validate: must start with postgresql:// or sqlite:///
if _raw_url and not re.match(r"^(postgresql|sqlite)://", _raw_url.strip()):
    _raw_url = ""

DATABASE_URL = _raw_url or f"sqlite:///{os.path.join(os.path.dirname(os.path.abspath(__file__)), 'automl.db')}"

engine = create_engine(DATABASE_URL, echo=False, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _migrate_schema():
    """Add new columns that don't exist yet (safe for SQLite)."""
    inspector = inspect(engine)
    migrations = [
        ("experiments", "project_id", "VARCHAR"),
        ("model_registry", "project_id", "VARCHAR"),
        ("deployments", "project_id", "VARCHAR"),
        ("projects", "notes", "TEXT"),
    ]
    for table, col, col_type in migrations:
        if table in inspector.get_table_names():
            cols = [c["name"] for c in inspector.get_columns(table)]
            if col not in cols:
                with engine.connect() as conn:
                    conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}"))
                    conn.commit()


def init_db():
    from models import (User, Team, TeamMember, ApiKey, Experiment, ModelRegistry,
                        Deployment, Pipeline, PipelineRun, Webhook, AuditLog,
                        Project, MarketplaceItem, Dataset)
    for attempt in range(30):
        try:
            Base.metadata.create_all(bind=engine)
            _migrate_schema()
            return
        except Exception:
            if attempt == 29:
                raise
            time.sleep(1)
