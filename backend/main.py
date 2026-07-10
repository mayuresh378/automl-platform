import os
import json
import time
import uuid
from datetime import datetime, timezone
from typing import Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import pandas as pd

from database import get_db, init_db
from crud import (
    create_user, authenticate_user, get_user_by_id,
    list_experiments, create_experiment,
    list_models, get_model, create_model, update_model_status,
    list_deployments, create_deployment, delete_deployment,
    list_pipelines, create_pipeline, get_pipeline, update_pipeline,
    delete_pipeline, run_pipeline, list_pipeline_runs, get_pipeline_run,
    list_webhooks, create_webhook, delete_webhook,
    list_api_keys, create_api_key, delete_api_key,
    list_teams, create_team,
    list_audit_logs, log_audit,
    list_projects, create_project, get_project,
    list_marketplace_items, install_marketplace_item,
    _create_token,
)
from schemas import (
    PipelineCreate, PipelineUpdate, PipelineResponse, PipelineRunResponse,
    WebhookCreate, WebhookResponse,
)
from preprocess import auto_preprocess
from train import run_automl_training
from predict import make_prediction, load_model_metadata
from cleaning import profile_dataset, clean_dataset
from features import generate_features, suggest_features
from ai_assistant import answer_question, list_datasets as ai_list_datasets, load_experiments as ai_load_experiments
from auth import get_current_user, decode_token as auth_decode_token

security = HTTPBearer(auto_error=False)


async def get_current_user_db(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    if credentials is None:
        return {"id": "anonymous", "email": "guest@automl.local", "name": "Guest"}
    payload = auth_decode_token(credentials.credentials)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = get_user_by_id(db, payload.get("sub"))
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return {"id": user.id, "email": user.email, "name": user.name}

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(title="AutoML Platform API", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", "http://127.0.0.1:5173",
        "http://localhost:3000", "http://localhost",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "..", "dataset")
MODELS_DIR = os.path.join(BASE_DIR, "..", "models")
EXPERIMENTS_FILE = os.path.join(BASE_DIR, "experiments.json")
DEPLOYMENTS_FILE = os.path.join(BASE_DIR, "deployments.json")
ACTIVITY_FILE = os.path.join(BASE_DIR, "activity.json")

os.makedirs(DATASET_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)


# ── Legacy JSON helpers (keep for backward compat) ──────────────────

def load_json(path: str, default=None):
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)
    return default if default is not None else []


def save_json(path: str, data):
    with open(path, "w") as f:
        json.dump(data, f, indent=2)


# ── Root ────────────────────────────────────────────────────────────

@app.get("/")
def home():
    return {
        "status": "AutoML Backend is running!",
        "version": "2.0.0",
        "database": "PostgreSQL/SQLite via SQLAlchemy",
        "docs": "/docs",
    }


# ── Health ──────────────────────────────────────────────────────────

@app.get("/api/v1/health")
def health():
    dataset_count = len([f for f in os.listdir(DATASET_DIR) if f.endswith((".csv", ".xlsx", ".parquet", ".json"))])
    model_count = len([f for f in os.listdir(MODELS_DIR) if f.endswith(".pkl")])
    return {
        "status": "healthy",
        "version": "2.0.0",
        "timestamp": datetime.now().isoformat(),
        "datasets_count": dataset_count,
        "models_count": model_count,
    }


# ── Auth (DB-backed) ────────────────────────────────────────────────

@app.post("/api/v1/auth/register")
def auth_register(email: str = Form(...), password: str = Form(...), name: str = Form(...), db: Session = Depends(get_db)):
    try:
        return create_user(db, email, password, name)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/v1/auth/login")
def auth_login(email: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    try:
        return authenticate_user(db, email, password)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@app.get("/api/v1/auth/me")
def auth_me(current_user: dict = Depends(get_current_user_db)):
    return {"user": current_user}


# ── Datasets ────────────────────────────────────────────────────────

@app.get("/api/v1/datasets")
def list_datasets():
    files = []
    for f in sorted(os.listdir(DATASET_DIR)):
        if not f.endswith((".csv", ".xlsx", ".parquet", ".json")):
            continue
        fpath = os.path.join(DATASET_DIR, f)
        size_kb = round(os.path.getsize(fpath) / 1024, 1)
        try:
            if f.endswith(".csv"):
                df = pd.read_csv(fpath, nrows=5)
            elif f.endswith(".xlsx"):
                df = pd.read_excel(fpath, nrows=5)
            elif f.endswith(".parquet"):
                df = pd.read_parquet(fpath)
            else:
                df = pd.read_json(fpath, nrows=5)
            row_count = 0
            if f.endswith(".csv"):
                with open(fpath, encoding="utf-8", errors="ignore") as fh:
                    row_count = sum(1 for _ in fh) - 1
            files.append({
                "name": f,
                "size_kb": size_kb,
                "rows": row_count,
                "columns": list(df.columns),
                "dtypes": {c: str(dt) for c, dt in df.dtypes.items()},
                "uploaded_at": datetime.fromtimestamp(os.path.getmtime(fpath)).isoformat(),
            })
        except Exception:
            files.append({"name": f, "size_kb": size_kb, "rows": 0, "columns": [], "uploaded_at": ""})
    return {"datasets": files}


@app.post("/api/v1/datasets")
async def upload_dataset(file: UploadFile = File(...), db: Session = Depends(get_db)):
    file_location = os.path.join(DATASET_DIR, file.filename)
    if os.path.exists(file_location):
        os.remove(file_location)
    content = await file.read()
    with open(file_location, "wb") as f:
        f.write(content)
    try:
        if file.filename.endswith(".csv"):
            df = pd.read_csv(file_location)
        elif file.filename.endswith(".xlsx"):
            df = pd.read_excel(file_location)
        elif file.filename.endswith(".parquet"):
            df = pd.read_parquet(file_location)
        else:
            df = pd.read_json(file_location)
    except Exception as e:
        os.remove(file_location)
        raise HTTPException(status_code=400, detail=f"Failed to parse: {str(e)}")
    log_audit(db, "User", "dataset.uploaded", file.filename, "dataset")
    return {"message": f"Uploaded {file.filename}", "filename": file.filename, "features": list(df.columns), "rows": len(df)}


@app.get("/api/v1/datasets/{name}/download")
def download_dataset(name: str):
    fpath = os.path.join(DATASET_DIR, name)
    if not os.path.exists(fpath):
        raise HTTPException(status_code=404, detail=f"Dataset '{name}' not found")
    return FileResponse(fpath, filename=name, media_type="text/csv")


@app.delete("/api/v1/datasets/{name}")
def delete_dataset(name: str, db: Session = Depends(get_db)):
    fpath = os.path.join(DATASET_DIR, name)
    if not os.path.exists(fpath):
        raise HTTPException(status_code=404, detail=f"Dataset '{name}' not found")
    os.remove(fpath)
    log_audit(db, "User", "dataset.deleted", name, "dataset")
    return {"message": f"Deleted '{name}'"}


@app.get("/api/v1/datasets/{name}/preview")
def preview_dataset(name: str, rows: int = Query(50, le=500), offset: int = Query(0, ge=0)):
    try:
        from cleaning import load_dataset as _ld
        df = _ld(name)
        total = len(df)
        page = df.iloc[offset:offset + rows]
        return {
            "name": name, "total_rows": total, "offset": offset,
            "rows_returned": len(page), "columns": list(df.columns),
            "data": page.fillna("").to_dict(orient="records"),
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get("/api/v1/datasets/{name}/profile")
def dataset_profile(name: str):
    try:
        return profile_dataset(name)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.post("/api/v1/datasets/{name}/clean")
def clean(name: str, operations: str = Form(...), db: Session = Depends(get_db)):
    try:
        ops = json.loads(operations)
        result = clean_dataset(name, ops)
        log_audit(db, "User", "dataset.cleaned", name, "dataset")
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/v1/datasets/{name}/features/generate")
def generate(name: str, operations: str = Form(...), db: Session = Depends(get_db)):
    try:
        ops = json.loads(operations)
        result = generate_features(name, ops)
        log_audit(db, "User", "features.generated", name, "dataset")
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/v1/datasets/{name}/features/suggest")
def suggest(name: str):
    try:
        return suggest_features(name)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


# ── Experiments (DB-backed) ─────────────────────────────────────────

@app.get("/api/v1/experiments")
def list_experiments_api(db: Session = Depends(get_db)):
    return {"experiments": [{
        "id": e.id, "name": e.name, "model": e.model,
        "task_type": e.task_type, "dataset": e.dataset, "target": e.target,
        "cv_score": e.cv_score, "metrics": e.metrics,
        "training_time": e.training_time, "total_time": e.total_time,
        "status": e.status, "runAt": e.run_at.isoformat() if e.run_at else None,
        "params": e.params, "feature_importance": e.feature_importance,
        "confusion_matrix": e.confusion_matrix,
    } for e in list_experiments(db)]}


# ── Training ────────────────────────────────────────────────────────

@app.post("/api/v1/training")
def train_model(
    file_name: str = Form(...),
    target_column: str = Form(...),
    task_type: str = Form(None),
    db: Session = Depends(get_db),
):
    try:
        start = time.time()
        preprocess_result = auto_preprocess(file_name, target_column, task_type)
        X = preprocess_result["X"]
        y = preprocess_result["y"]
        preprocessor = preprocess_result["preprocessor"]
        task = preprocess_result["task_type"]

        results = run_automl_training(X, y, task_type=task,
                                      model_name_prefix=file_name.split('.')[0],
                                      preprocessor=preprocessor)
        elapsed = round(time.time() - start, 2)

        exp_data = {
            "name": f"{file_name.split('.')[0]}-{results['best_model']}",
            "model": results["best_model"],
            "task_type": task,
            "cv_score": results["cv_score"],
            "metrics": results["metrics"],
            "dataset": file_name,
            "target": target_column,
            "training_time": results["training_time"],
            "total_time": elapsed,
            "status": "success",
            "run_at": datetime.now(timezone.utc),
        }
        create_experiment(db, exp_data)
        log_audit(db, "User", "training.completed", f"{file_name} -> {results['best_model']}", "experiment")

        return {
            "status": "Success",
            "message": "Training completed!",
            "data_summary": {"features_count": X.shape[1], "rows_count": X.shape[0], "task_type": task},
            "training_summary": results,
        }
    except Exception as e:
        detail = str(e)
        if "paging file" in detail.lower() or "memory" in detail.lower():
            detail = "System running low on memory. Try closing other applications or reducing dataset size."
        raise HTTPException(status_code=500, detail=detail)


# ── Models (DB-backed) ──────────────────────────────────────────────

@app.get("/api/v1/models")
def list_models_api(db: Session = Depends(get_db)):
    db_models = list_models(db)
    fs_models = []
    for f in os.listdir(MODELS_DIR):
        if f.endswith(".pkl"):
            fpath = os.path.join(MODELS_DIR, f)
            size_kb = round(os.path.getsize(fpath) / 1024, 1)
            meta = load_model_metadata(f)
            fs_models.append({
                "name": f, "size_kb": size_kb,
                "task_type": meta.get("task_type") if meta else None,
                "best_score": meta.get("cv_score") if meta else None,
                "created_at": datetime.fromtimestamp(os.path.getmtime(fpath)).isoformat(),
            })

    registered = [{
        "id": m.id, "name": m.name, "version": m.version,
        "model_type": m.model_type, "task_type": m.task_type,
        "framework": m.framework, "file_size_kb": m.file_size_kb,
        "cv_score": m.cv_score, "status": m.status,
        "tags": m.tags, "description": m.description,
        "created_at": m.created_at.isoformat() if m.created_at else None,
    } for m in db_models]

    return {"models": fs_models, "registered_models": registered}


@app.get("/api/v1/models/{name}")
def get_model_detail(name: str):
    meta = load_model_metadata(name)
    if not meta:
        fpath = os.path.join(MODELS_DIR, name)
        if not os.path.exists(fpath):
            raise HTTPException(status_code=404, detail=f"Model '{name}' not found")
        return {"name": name}
    return {"name": name, **meta}


@app.delete("/api/v1/models/{name}")
def delete_model(name: str, db: Session = Depends(get_db)):
    fpath = os.path.join(MODELS_DIR, name)
    meta_path = fpath.replace(".pkl", "_meta.json")
    removed = []
    if os.path.exists(fpath):
        os.remove(fpath)
        removed.append(name)
    if os.path.exists(meta_path):
        os.remove(meta_path)
        removed.append(meta_path)
    if not removed:
        raise HTTPException(status_code=404, detail=f"Model '{name}' not found")
    log_audit(db, "User", "model.deleted", name, "model")
    return {"message": f"Deleted model '{name}'"}


# ── Deployments (DB-backed) ─────────────────────────────────────────

@app.get("/api/v1/deployments")
def list_deployments_api(db: Session = Depends(get_db)):
    deps = list_deployments(db)
    return {"deployments": [{
        "id": d.id, "model_name": d.name, "endpoint_name": d.name,
        "endpoint_url": d.endpoint_url, "status": d.status,
        "environment": d.environment, "requests_count": d.requests_count,
        "avg_latency_ms": d.avg_latency_ms,
        "created_at": d.created_at.isoformat() if d.created_at else None,
    } for d in deps]}


@app.post("/api/v1/deployments")
def create_deployment_api(
    model_name: str = Form(...),
    endpoint_name: str = Form(...),
    db: Session = Depends(get_db),
):
    fpath = os.path.join(MODELS_DIR, model_name)
    if not os.path.exists(fpath):
        raise HTTPException(status_code=404, detail=f"Model '{model_name}' not found")
    dep = create_deployment(db, {
        "name": endpoint_name,
        "model_id": model_name,
        "endpoint_url": f"http://127.0.0.1:8000/api/v1/predictions?model={model_name}",
        "status": "active",
        "environment": "production",
    })
    log_audit(db, "User", "deployment.created", endpoint_name, "deployment")
    return {
        "id": dep.id, "model_name": model_name, "endpoint_name": endpoint_name,
        "endpoint_url": dep.endpoint_url, "status": dep.status,
        "created_at": dep.created_at.isoformat() if dep.created_at else None,
    }


@app.delete("/api/v1/deployments/{dep_id}")
def delete_deployment_api(dep_id: str, db: Session = Depends(get_db)):
    if not delete_deployment(db, dep_id):
        raise HTTPException(status_code=404, detail=f"Deployment '{dep_id}' not found")
    log_audit(db, "User", "deployment.deleted", dep_id, "deployment")
    return {"message": f"Removed deployment '{dep_id}'"}


# ── Predictions ─────────────────────────────────────────────────────

@app.post("/api/v1/predictions")
def predict(model_name: str = Form(...), payload: str = Form(...), db: Session = Depends(get_db)):
    try:
        input_data = json.loads(payload)
        result = make_prediction(model_name, input_data)
        log_audit(db, "User", "prediction.made", model_name, "prediction")
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── Pipelines (DB-backed) ───────────────────────────────────────────

@app.get("/api/v1/pipelines")
def list_pipelines_api(db: Session = Depends(get_db)):
    pipes = list_pipelines(db)
    return {"pipelines": [{
        "id": p.id, "name": p.name, "description": p.description,
        "steps": p.steps, "status": p.status, "schedule": p.schedule,
        "created_at": p.created_at.isoformat() if p.created_at else None,
        "updated_at": p.updated_at.isoformat() if p.updated_at else None,
    } for p in pipes]}


@app.post("/api/v1/pipelines")
def create_pipeline_api(data: PipelineCreate, db: Session = Depends(get_db)):
    pipe = create_pipeline(db, user_id="system", name=data.name,
                           steps=data.steps, description=data.description,
                           schedule=data.schedule)
    return {
        "id": pipe.id, "name": pipe.name, "description": pipe.description,
        "steps": pipe.steps, "status": pipe.status, "schedule": pipe.schedule,
        "created_at": pipe.created_at.isoformat() if pipe.created_at else None,
        "updated_at": pipe.updated_at.isoformat() if pipe.updated_at else None,
    }


@app.get("/api/v1/pipelines/{pipeline_id}")
def get_pipeline_api(pipeline_id: str, db: Session = Depends(get_db)):
    pipe = get_pipeline(db, pipeline_id)
    if not pipe:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    return {
        "id": pipe.id, "name": pipe.name, "description": pipe.description,
        "steps": pipe.steps, "status": pipe.status, "schedule": pipe.schedule,
        "created_at": pipe.created_at.isoformat() if pipe.created_at else None,
        "updated_at": pipe.updated_at.isoformat() if pipe.updated_at else None,
    }


@app.put("/api/v1/pipelines/{pipeline_id}")
def update_pipeline_api(pipeline_id: str, data: PipelineUpdate, db: Session = Depends(get_db)):
    pipe = update_pipeline(db, pipeline_id, name=data.name, description=data.description,
                           steps=data.steps, schedule=data.schedule)
    if not pipe:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    return {
        "id": pipe.id, "name": pipe.name, "description": pipe.description,
        "steps": pipe.steps, "status": pipe.status, "schedule": pipe.schedule,
        "created_at": pipe.created_at.isoformat() if pipe.created_at else None,
        "updated_at": pipe.updated_at.isoformat() if pipe.updated_at else None,
    }


@app.delete("/api/v1/pipelines/{pipeline_id}")
def delete_pipeline_api(pipeline_id: str, db: Session = Depends(get_db)):
    if not delete_pipeline(db, pipeline_id):
        raise HTTPException(status_code=404, detail="Pipeline not found")
    return {"status": "deleted"}


@app.post("/api/v1/pipelines/{pipeline_id}/run")
def run_pipeline_api(pipeline_id: str, db: Session = Depends(get_db)):
    try:
        run = run_pipeline(db, pipeline_id)
        return {
            "id": run.id, "pipeline_id": run.pipeline_id,
            "status": run.status, "current_step": run.current_step,
            "error": run.error,
            "started_at": run.started_at.isoformat() if run.started_at else None,
            "completed_at": run.completed_at.isoformat() if run.completed_at else None,
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get("/api/v1/pipelines/{pipeline_id}/runs")
def list_runs_api(pipeline_id: str, db: Session = Depends(get_db)):
    runs = list_pipeline_runs(db, pipeline_id)
    return {"runs": [{
        "id": r.id, "pipeline_id": r.pipeline_id,
        "status": r.status, "current_step": r.current_step,
        "results": r.results, "error": r.error,
        "started_at": r.started_at.isoformat() if r.started_at else None,
        "completed_at": r.completed_at.isoformat() if r.completed_at else None,
        "created_at": r.created_at.isoformat() if r.created_at else None,
    } for r in runs]}


@app.get("/api/v1/pipeline-runs/{run_id}")
def get_run_api(run_id: str, db: Session = Depends(get_db)):
    run = get_pipeline_run(db, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return {
        "id": run.id, "pipeline_id": run.pipeline_id,
        "status": run.status, "current_step": run.current_step,
        "results": run.results, "error": run.error,
        "started_at": run.started_at.isoformat() if run.started_at else None,
        "completed_at": run.completed_at.isoformat() if run.completed_at else None,
        "created_at": run.created_at.isoformat() if run.created_at else None,
    }


# ── Webhooks (DB-backed) ────────────────────────────────────────────

@app.get("/api/v1/webhooks")
def list_webhooks_api(db: Session = Depends(get_db)):
    whs = list_webhooks(db)
    return {"webhooks": [{
        "id": w.id, "name": w.name, "url": w.url,
        "events": w.events, "status": w.status,
        "created_at": w.created_at.isoformat() if w.created_at else None,
    } for w in whs]}


@app.post("/api/v1/webhooks")
def create_webhook_api(data: WebhookCreate, db: Session = Depends(get_db)):
    wh = create_webhook(db, data.model_dump())
    return {
        "id": wh.id, "name": wh.name, "url": wh.url,
        "events": wh.events, "status": wh.status,
        "created_at": wh.created_at.isoformat() if wh.created_at else None,
    }


@app.delete("/api/v1/webhooks/{webhook_id}")
def delete_webhook_api(webhook_id: str, db: Session = Depends(get_db)):
    if not delete_webhook(db, webhook_id):
        raise HTTPException(status_code=404, detail="Webhook not found")
    return {"message": f"Deleted webhook '{webhook_id}'"}


# ── Teams (DB-backed) ───────────────────────────────────────────────

@app.get("/api/v1/teams")
def list_teams_api(db: Session = Depends(get_db)):
    teams = list_teams(db)
    return {"teams": [{
        "id": t.id, "name": t.name, "slug": t.slug,
        "plan": t.plan, "member_count": len(t.members),
        "created_at": t.created_at.isoformat() if t.created_at else None,
    } for t in teams]}


@app.post("/api/v1/teams")
def create_team_api(name: str = Form(...), db: Session = Depends(get_db)):
    team = create_team(db, name, owner_id="system")
    return {"id": team.id, "name": team.name, "slug": team.slug, "plan": team.plan}


# ── API Keys (DB-backed) ────────────────────────────────────────────

@app.get("/api/v1/api-keys")
def list_api_keys_api(current_user: dict = Depends(get_current_user_db), db: Session = Depends(get_db)):
    if not current_user or not current_user.get("id"):
        raise HTTPException(status_code=401, detail="Authentication required")
    keys = list_api_keys(db, current_user["id"])
    return {"api_keys": [{"id": k.id, "name": k.name, "key_prefix": k.key_prefix,
                          "status": k.status, "created_at": k.created_at.isoformat() if k.created_at else None}
                         for k in keys]}


@app.post("/api/v1/api-keys")
def create_api_key_api(name: str = Form(...),
                       current_user: dict = Depends(get_current_user_db),
                       db: Session = Depends(get_db)):
    if not current_user or not current_user.get("id"):
        raise HTTPException(status_code=401, detail="Authentication required")
    result = create_api_key(db, current_user["id"], name)
    return result


@app.delete("/api/v1/api-keys/{key_id}")
def delete_api_key_api(key_id: str,
                       current_user: dict = Depends(get_current_user_db),
                       db: Session = Depends(get_db)):
    if not current_user or not current_user.get("id"):
        raise HTTPException(status_code=401, detail="Authentication required")
    if not delete_api_key(db, key_id):
        raise HTTPException(status_code=404, detail="API key not found")
    return {"message": "API key deleted"}


# ── Monitoring ──────────────────────────────────────────────────────

@app.get("/api/v1/monitoring/metrics")
def system_metrics():
    try:
        import psutil
        cpu = psutil.cpu_percent(interval=0.1)
        memory = psutil.virtual_memory()
        storage = psutil.disk_usage(os.path.abspath(os.sep))
        return {
            "cpu": {"label": "CPU", "value": cpu, "detail": f"{psutil.cpu_count()} logical cores"},
            "memory": {"label": "Memory", "value": memory.percent, "detail": f"{memory.used / 1e9:.1f} GB / {memory.total / 1e9:.1f} GB"},
            "storage": {"label": "Storage", "value": storage.percent, "detail": f"{storage.used / 1e9:.1f} GB / {storage.total / 1e9:.1f} GB"},
            "gpu": {"label": "GPU", "value": 0, "detail": "N/A"},
        }
    except Exception:
        return {"cpu": {"label": "CPU", "value": 0, "detail": "N/A"},
                "memory": {"label": "Memory", "value": 0, "detail": "N/A"},
                "storage": {"label": "Storage", "value": 0, "detail": "N/A"},
                "gpu": {"label": "GPU", "value": 0, "detail": "N/A"}}


@app.get("/api/v1/monitoring/stats")
def live_stats(db: Session = Depends(get_db)):
    exps = list_experiments(db)
    models = [f for f in os.listdir(MODELS_DIR) if f.endswith(".pkl")]
    today_prefix = datetime.now().strftime("%Y-%m-%d")
    return {
        "modelsTrained": len(exps),
        "activeDeployments": len(models),
        "inferenceRequestsToday": sum(1 for e in exps if e.run_at and e.run_at.strftime("%Y-%m-%d") == today_prefix),
        "avgLatencyMs": round(sum((e.training_time or 0) for e in exps) / max(len(exps), 1) * 1000, 1),
    }


# ── Projects ────────────────────────────────────────────────────────

@app.get("/api/v1/projects")
def list_projects_api(db: Session = Depends(get_db)):
    projects = list_projects(db)
    return {"projects": [{
        "id": p.id, "name": p.name, "description": p.description,
        "status": p.status, "model_ids": p.model_ids,
        "dataset_ids": p.dataset_ids, "tags": p.tags,
        "created_at": p.created_at.isoformat() if p.created_at else None,
    } for p in projects]}


@app.post("/api/v1/projects")
def create_project_api(name: str = Form(...), description: str = Form(None),
                       db: Session = Depends(get_db)):
    p = create_project(db, name=name, description=description)
    log_audit(db, "User", "project.created", name, "project", p.id)
    return {"id": p.id, "name": p.name, "description": p.description,
            "status": p.status, "created_at": p.created_at.isoformat() if p.created_at else None}


@app.get("/api/v1/projects/{project_id}")
def get_project_api(project_id: str, db: Session = Depends(get_db)):
    p = get_project(db, project_id)
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"id": p.id, "name": p.name, "description": p.description,
            "status": p.status, "model_ids": p.model_ids,
            "dataset_ids": p.dataset_ids, "tags": p.tags,
            "created_at": p.created_at.isoformat() if p.created_at else None}


# ── Marketplace ──────────────────────────────────────────────────────

@app.get("/api/v1/marketplace")
def list_marketplace_api(category: str = Query(None), db: Session = Depends(get_db)):
    items = list_marketplace_items(db, category)
    return {"items": [{
        "id": i.id, "name": i.name, "type": i.item_type,
        "description": i.description, "category": i.category,
        "author": i.author, "tags": i.tags,
        "downloads": i.downloads, "rating": i.rating,
        "featured": i.featured,
    } for i in items]}


@app.post("/api/v1/marketplace/{item_id}/install")
def install_marketplace_api(item_id: str, db: Session = Depends(get_db)):
    item = install_marketplace_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"id": item.id, "name": item.name, "downloads": item.downloads}


# ── Activity / Audit Log ────────────────────────────────────────────

@app.get("/api/v1/activity")
def activity(db: Session = Depends(get_db)):
    logs = list_audit_logs(db)
    return {"activities": [{
        "id": l.id, "actor": l.actor, "action": l.action,
        "target": l.target, "resource_type": l.resource_type,
        "status": l.status,
        "time": l.created_at.isoformat() if l.created_at else None,
    } for l in logs]}


# ── SQL Query ───────────────────────────────────────────────────────

@app.post("/api/v1/query")
def run_sql(query: str = Form(...), dataset: str = Form(None)):
    import duckdb
    try:
        con = duckdb.connect()
        if dataset:
            fpath = os.path.join(DATASET_DIR, dataset)
            if not os.path.exists(fpath):
                raise HTTPException(status_code=404, detail=f"Dataset '{dataset}' not found")
            con.execute(f"CREATE OR REPLACE VIEW data AS SELECT * FROM read_csv_auto('{fpath.replace(os.sep, '/')}', strict_mode=false, ignore_errors=true)")
        else:
            for f in os.listdir(DATASET_DIR):
                if f.endswith((".csv", ".parquet")):
                    fpath = os.path.join(DATASET_DIR, f)
                    tbl = f.rsplit(".", 1)[0].replace(" ", "_").replace("-", "_")
                    con.execute(f"CREATE OR REPLACE VIEW \"{tbl}\" AS SELECT * FROM read_csv_auto('{fpath.replace(os.sep, '/')}', strict_mode=false, ignore_errors=true)")

        result = con.execute(query)
        columns = [desc[0] for desc in result.description] if result.description else []
        rows = result.fetchall()
        data = [dict(zip(columns, row)) for row in rows]
        con.close()
        return {"columns": columns, "rows": len(data), "data": data, "query": query}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── AI Assistant ────────────────────────────────────────────────────

@app.post("/api/v1/ai/chat")
def ai_chat(question: str = Form(...)):
    try:
        return {"answer": answer_question(question)}
    except Exception as e:
        return {"answer": f"Error: {str(e)}. Please try again."}


@app.get("/api/v1/ai/suggestions")
def ai_suggestions():
    try:
        datasets = ai_list_datasets()
        experiments = ai_load_experiments()
        answers = []
        if not datasets:
            return {"suggestions": ["Upload a dataset to get started with AutoML"]}

        d = datasets[0]
        numeric_cols = [c for c, t in d.get("dtypes", {}).items() if "float" in t or "int" in t]
        text_cols = [c for c, t in d.get("dtypes", {}).items() if "object" in t or "str" in t]

        answers.append(f"Which model should I train on {d['name']}?")
        if numeric_cols:
            answers.append(f"How should I clean missing values in {d['name']}?")
        if text_cols:
            answers.append(f"Suggest features for {d['name']}")
        if experiments:
            answers.append(f"Explain the {experiments[0]['model']} results on {experiments[0]['dataset']}")
        if len(datasets) > 1:
            answers.append("Compare my experiments across datasets")

        return {"suggestions": answers[:4]}
    except Exception:
        return {"suggestions": ["Which model should I use?", "How should I clean my data?", "Suggest features for my dataset"]}
