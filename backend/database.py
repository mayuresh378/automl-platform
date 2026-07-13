import os
import time
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{os.path.join(os.path.dirname(os.path.abspath(__file__)), 'automl.db')}"
)

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


def init_db():
    from models import (User, Team, TeamMember, ApiKey, Experiment, ModelRegistry,
                        Deployment, Pipeline, PipelineRun, Webhook, AuditLog,
                        Project, MarketplaceItem)
    for attempt in range(30):
        try:
            Base.metadata.create_all(bind=engine)
            return
        except Exception:
            if attempt == 29:
                raise
            time.sleep(1)
