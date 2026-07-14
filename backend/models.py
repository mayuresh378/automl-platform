import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import (Column, String, Text, Integer, Float, Boolean, DateTime, Enum,
                        ForeignKey, JSON, UniqueConstraint)
from sqlalchemy.orm import relationship
from database import Base


def _uuid():
    return str(uuid.uuid4())


def _now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="member")
    is_active = Column(Boolean, default=True)
    avatar_url = Column(String, nullable=True)
    preferences = Column(JSON, default=dict)
    mfa_enabled = Column(Boolean, default=False)
    created_at = Column(DateTime, default=_now)
    updated_at = Column(DateTime, default=_now, onupdate=_now)

    teams = relationship("TeamMember", back_populates="user")
    api_keys = relationship("ApiKey", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")
    pipelines = relationship("Pipeline", back_populates="created_by_user")


class Team(Base):
    __tablename__ = "teams"

    id = Column(String, primary_key=True, default=_uuid)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=True)
    plan = Column(String, default="free")
    created_at = Column(DateTime, default=_now)
    updated_at = Column(DateTime, default=_now, onupdate=_now)

    members = relationship("TeamMember", back_populates="team")


class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    team_id = Column(String, ForeignKey("teams.id"), nullable=False)
    role = Column(String, default="member")
    joined_at = Column(DateTime, default=_now)

    user = relationship("User", back_populates="teams")
    team = relationship("Team", back_populates="members")

    __table_args__ = (UniqueConstraint("user_id", "team_id"),)


class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    key_prefix = Column(String(8), nullable=False)
    key_hash = Column(String, nullable=False)
    status = Column(String, default="active")
    last_used_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=_now)

    user = relationship("User", back_populates="api_keys")


class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=True)
    name = Column(String, nullable=False)
    model = Column(String, nullable=False)
    task_type = Column(String, nullable=True)
    dataset = Column(String, nullable=True)
    target = Column(String, nullable=True)
    cv_score = Column(Float, nullable=True)
    metrics = Column(JSON, nullable=True)
    training_time = Column(Float, nullable=True)
    total_time = Column(Float, nullable=True)
    status = Column(String, default="success")
    params = Column(JSON, nullable=True)
    feature_importance = Column(JSON, nullable=True)
    confusion_matrix = Column(JSON, nullable=True)
    run_at = Column(DateTime, default=_now)
    created_at = Column(DateTime, default=_now)


class ModelRegistry(Base):
    __tablename__ = "model_registry"

    id = Column(String, primary_key=True, default=_uuid)
    experiment_id = Column(String, ForeignKey("experiments.id"), nullable=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=True)
    name = Column(String, nullable=False)
    version = Column(Integer, default=1)
    model_type = Column(String, nullable=True)
    task_type = Column(String, nullable=True)
    framework = Column(String, default="sklearn")
    file_path = Column(String, nullable=True)
    file_size_kb = Column(Float, nullable=True)
    cv_score = Column(Float, nullable=True)
    metrics = Column(JSON, nullable=True)
    params = Column(JSON, nullable=True)
    status = Column(String, default="staging")
    tags = Column(JSON, default=list)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=_now)
    updated_at = Column(DateTime, default=_now, onupdate=_now)


class Deployment(Base):
    __tablename__ = "deployments"

    id = Column(String, primary_key=True, default=_uuid)
    model_id = Column(String, ForeignKey("model_registry.id"), nullable=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=True)
    name = Column(String, nullable=False)
    endpoint_url = Column(String, nullable=True)
    status = Column(String, default="active")
    environment = Column(String, default="production")
    requests_count = Column(Integer, default=0)
    avg_latency_ms = Column(Float, nullable=True)
    config = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=_now)
    updated_at = Column(DateTime, default=_now, onupdate=_now)


class Pipeline(Base):
    __tablename__ = "pipelines"

    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    steps = Column(JSON, default=list)
    status = Column(String, default="draft")
    schedule = Column(String, nullable=True)
    created_at = Column(DateTime, default=_now)
    updated_at = Column(DateTime, default=_now, onupdate=_now)

    created_by_user = relationship("User", back_populates="pipelines")
    runs = relationship("PipelineRun", back_populates="pipeline")


class PipelineRun(Base):
    __tablename__ = "pipeline_runs"

    id = Column(String, primary_key=True, default=_uuid)
    pipeline_id = Column(String, ForeignKey("pipelines.id"), nullable=False)
    status = Column(String, default="pending")
    current_step = Column(String, nullable=True)
    results = Column(JSON, nullable=True)
    error = Column(Text, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=_now)

    pipeline = relationship("Pipeline", back_populates="runs")


class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="development")
    notes = Column(Text, nullable=True)
    model_ids = Column(JSON, default=list)
    dataset_ids = Column(JSON, default=list)
    tags = Column(JSON, default=list)
    created_at = Column(DateTime, default=_now)
    updated_at = Column(DateTime, default=_now, onupdate=_now)


class MarketplaceItem(Base):
    __tablename__ = "marketplace_items"

    id = Column(String, primary_key=True, default=_uuid)
    name = Column(String, nullable=False)
    item_type = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=True)
    author = Column(String, nullable=True)
    tags = Column(JSON, default=list)
    downloads = Column(Integer, default=0)
    rating = Column(Float, default=0.0)
    featured = Column(Boolean, default=False)
    config = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=_now)


class Webhook(Base):
    __tablename__ = "webhooks"

    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    name = Column(String, nullable=False)
    url = Column(String, nullable=False)
    events = Column(JSON, default=list)
    secret = Column(String, nullable=True)
    status = Column(String, default="active")
    last_triggered_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=_now)


class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String, primary_key=True, default=_uuid)
    project_id = Column(String, ForeignKey("projects.id"), nullable=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=True)
    file_path = Column(String, nullable=True)
    file_size_kb = Column(Float, nullable=True)
    rows = Column(Integer, nullable=True)
    columns = Column(JSON, nullable=True)
    status = Column(String, default="uploaded")
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=_now)
    updated_at = Column(DateTime, default=_now, onupdate=_now)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    actor = Column(String, nullable=True)
    action = Column(String, nullable=False)
    target = Column(String, nullable=True)
    resource_type = Column(String, nullable=True)
    resource_id = Column(String, nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String, nullable=True)
    status = Column(String, default="success")
    created_at = Column(DateTime, default=_now)

    user = relationship("User", back_populates="audit_logs")
