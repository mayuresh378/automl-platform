import uuid
import hashlib
import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from jose import jwt

from models import (User, Team, TeamMember, ApiKey, Experiment, ModelRegistry,
                    Deployment, Pipeline, PipelineRun, Webhook, AuditLog)


SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
ALGORITHM = "HS256"


def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def _create_token(user_id: str) -> str:
    return jwt.encode({"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=30)}, SECRET_KEY, algorithm=ALGORITHM)


def _now():
    return datetime.now(timezone.utc)


def _uid():
    return str(uuid.uuid4())


def log_audit(db: Session, actor: str, action: str, target: str = None,
              resource_type: str = None, resource_id: str = None,
              details: dict = None, status: str = "success", ip_address: str = None):
    record = AuditLog(
        id=_uid(), actor=actor, action=action, target=target,
        resource_type=resource_type, resource_id=resource_id,
        details=details, status=status, ip_address=ip_address,
        created_at=_now()
    )
    db.add(record)
    db.commit()


# ─── Users ──────────────────────────────────────────────────────────

def create_user(db: Session, email: str, password: str, name: str) -> dict:
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise ValueError("Email already registered")
    user = User(id=_uid(), email=email, name=name, password_hash=_hash_password(password), created_at=_now())
    db.add(user)
    db.commit()
    db.refresh(user)
    token = _create_token(user.id)
    log_audit(db, name, "user.registered", f"User {email}", "user", user.id)
    return {"token": token, "user": {"id": user.id, "email": user.email, "name": user.name}}


def authenticate_user(db: Session, email: str, password: str) -> dict:
    user = db.query(User).filter(User.email == email).first()
    if not user or user.password_hash != _hash_password(password):
        raise ValueError("Invalid email or password")
    if not user.is_active:
        raise ValueError("Account is disabled")
    token = _create_token(user.id)
    log_audit(db, user.name, "user.login", f"User {email}", "user", user.id)
    return {"token": token, "user": {"id": user.id, "email": user.email, "name": user.name}}


def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


# ─── Experiments ──────────────────────────────────────────────────────

def list_experiments(db: Session, limit: int = 100) -> list:
    return db.query(Experiment).order_by(desc(Experiment.created_at)).limit(limit).all()


def create_experiment(db: Session, data: dict) -> Experiment:
    exp = Experiment(id=_uid(), created_at=_now(), **data)
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp


# ─── Model Registry ─────────────────────────────────────────────────

def list_models(db: Session, limit: int = 100) -> list:
    return db.query(ModelRegistry).order_by(desc(ModelRegistry.created_at)).limit(limit).all()


def get_model(db: Session, model_id: str) -> Optional[ModelRegistry]:
    return db.query(ModelRegistry).filter(ModelRegistry.id == model_id).first()


def create_model(db: Session, data: dict) -> ModelRegistry:
    model = ModelRegistry(id=_uid(), created_at=_now(), **data)
    db.add(model)
    db.commit()
    db.refresh(model)
    return model


def update_model_status(db: Session, model_id: str, status: str) -> Optional[ModelRegistry]:
    model = get_model(db, model_id)
    if model:
        model.status = status
        model.updated_at = _now()
        db.commit()
        db.refresh(model)
    return model


# ─── Deployments ──────────────────────────────────────────────────────

def list_deployments(db: Session, limit: int = 100) -> list:
    return db.query(Deployment).order_by(desc(Deployment.created_at)).limit(limit).all()


def create_deployment(db: Session, data: dict) -> Deployment:
    dep = Deployment(id=_uid(), created_at=_now(), **data)
    db.add(dep)
    db.commit()
    db.refresh(dep)
    return dep


def delete_deployment(db: Session, dep_id: str) -> bool:
    dep = db.query(Deployment).filter(Deployment.id == dep_id).first()
    if dep:
        db.delete(dep)
        db.commit()
        return True
    return False


# ─── Pipelines ────────────────────────────────────────────────────────

def list_pipelines(db: Session, limit: int = 100) -> list:
    return db.query(Pipeline).order_by(desc(Pipeline.created_at)).limit(limit).all()


def create_pipeline(db: Session, user_id: str, name: str, steps: list,
                    description: str = None, schedule: str = None) -> Pipeline:
    pipe = Pipeline(id=_uid(), user_id=user_id, name=name, steps=steps,
                    description=description, schedule=schedule, created_at=_now())
    db.add(pipe)
    db.commit()
    db.refresh(pipe)
    log_audit(db, user_id or "system", "pipeline.created", name, "pipeline", pipe.id)
    return pipe


def get_pipeline(db: Session, pipeline_id: str) -> Optional[Pipeline]:
    return db.query(Pipeline).filter(Pipeline.id == pipeline_id).first()


def run_pipeline(db: Session, pipeline_id: str) -> PipelineRun:
    pipeline = get_pipeline(db, pipeline_id)
    if not pipeline:
        raise ValueError("Pipeline not found")
    run = PipelineRun(id=_uid(), pipeline_id=pipeline_id, status="running",
                      started_at=_now(), created_at=_now())
    db.add(run)
    pipeline.status = "running"
    db.commit()
    db.refresh(run)
    return run


# ─── Webhooks ─────────────────────────────────────────────────────────

def list_webhooks(db: Session, limit: int = 100) -> list:
    return db.query(Webhook).order_by(desc(Webhook.created_at)).limit(limit).all()


def create_webhook(db: Session, data: dict) -> Webhook:
    wh = Webhook(id=_uid(), created_at=_now(), **data)
    db.add(wh)
    db.commit()
    db.refresh(wh)
    return wh


def delete_webhook(db: Session, wh_id: str) -> bool:
    wh = db.query(Webhook).filter(Webhook.id == wh_id).first()
    if wh:
        db.delete(wh)
        db.commit()
        return True
    return False


# ─── API Keys ─────────────────────────────────────────────────────────

def list_api_keys(db: Session, user_id: str) -> list:
    return db.query(ApiKey).filter(ApiKey.user_id == user_id).order_by(desc(ApiKey.created_at)).all()


def create_api_key(db: Session, user_id: str, name: str) -> dict:
    raw_key = f"amk_{uuid.uuid4().hex}"
    key_prefix = raw_key[:12]
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    api_key = ApiKey(
        id=_uid(), user_id=user_id, name=name,
        key_prefix=key_prefix, key_hash=key_hash, created_at=_now()
    )
    db.add(api_key)
    db.commit()
    db.refresh(api_key)
    return {"id": api_key.id, "name": name, "key": raw_key, "key_prefix": key_prefix}


def delete_api_key(db: Session, key_id: str) -> bool:
    ak = db.query(ApiKey).filter(ApiKey.id == key_id).first()
    if ak:
        db.delete(ak)
        db.commit()
        return True
    return False


# ─── Teams ────────────────────────────────────────────────────────────

def list_teams(db: Session) -> list:
    return db.query(Team).all()


def create_team(db: Session, name: str, owner_id: str) -> Team:
    team = Team(id=_uid(), name=name, slug=name.lower().replace(" ", "-"), created_at=_now())
    db.add(team)
    db.commit()
    db.refresh(team)
    member = TeamMember(id=_uid(), user_id=owner_id, team_id=team.id, role="admin")
    db.add(member)
    db.commit()
    return team


# ─── Audit Log ────────────────────────────────────────────────────────

def list_audit_logs(db: Session, limit: int = 100) -> list:
    return db.query(AuditLog).order_by(desc(AuditLog.created_at)).limit(limit).all()
