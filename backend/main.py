import os
import sys
import json
import time
import uuid
import re
from datetime import datetime, timezone
from typing import Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
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
    list_projects, create_project, get_project, update_project, list_projects_by_user,
    create_dataset_record, list_dataset_records, get_dataset_record, delete_dataset_record,
    global_search,
)
from schemas import (
    PipelineCreate, PipelineUpdate, PipelineResponse, PipelineRunResponse,
    WebhookCreate, WebhookResponse,
)
from preprocess import auto_preprocess
from train import run_automl_training
from predict import make_prediction, load_model_metadata
from cleaning import profile_dataset, clean_dataset, auto_clean
from analysis import analyze_dataset
from analytics import dashboard_analytics
from train import CLASSIFICATION_MODELS, REGRESSION_MODELS, run_engine_training, XGB_AVAILABLE, LGBM_AVAILABLE, CATB_AVAILABLE
from features import generate_features, suggest_features
from ai_assistant import answer_question, list_datasets as ai_list_datasets, load_experiments as ai_load_experiments
from auth import (
    register_user, login_user, refresh_token, get_current_user, get_optional_user,
    decode_token, create_access_token, sanitize_filename,
    update_user_profile, change_password, send_verification, verify_email,
    forgot_password, reset_password, google_login,
    list_sessions, revoke_session, logout, revoke_all_sessions,
)

security = HTTPBearer(auto_error=False)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "..", "dataset")
MODELS_DIR = os.path.join(BASE_DIR, "..", "models")
MAX_UPLOAD_MB = 500
ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls", ".parquet", ".json"}


def validate_path(name: str) -> str:
    clean = sanitize_filename(name)
    if clean != name:
        raise HTTPException(status_code=400, detail=f"Invalid filename: {name}")
    fpath = os.path.normpath(os.path.join(DATASET_DIR, clean))
    if not fpath.startswith(os.path.normpath(DATASET_DIR)):
        raise HTTPException(status_code=400, detail="Path traversal detected")
    return fpath


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"Starting... DATABASE_URL={'set' if os.getenv('DATABASE_URL') else 'not set'}, PORT={os.getenv('PORT', 'not set')}", flush=True)
    os.makedirs(DATASET_DIR, exist_ok=True)
    os.makedirs(MODELS_DIR, exist_ok=True)
    try:
        init_db()
        print("Database initialized", flush=True)
    except Exception as e:
        print(f"Database init failed: {e}", flush=True)
    yield

app = FastAPI(title="AutoML Platform API", version="3.0.0", lifespan=lifespan)

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://localhost")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in CORS_ORIGINS.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024


# ── Helpers ──────────────────────────────────────────────────────────

def _load_model_meta(name: str) -> dict:
    meta_path = os.path.join(MODELS_DIR, name.replace(".pkl", "_meta.json"))
    if os.path.exists(meta_path):
        with open(meta_path) as f:
            return json.load(f)
    return {}


def _get_dataset_df(name: str) -> pd.DataFrame:
    fpath = validate_path(name)
    if not os.path.exists(fpath):
        raise HTTPException(status_code=404, detail=f"Dataset '{name}' not found")
    if name.endswith(".csv"):
        return pd.read_csv(fpath)
    elif name.endswith((".xlsx", ".xls")):
        return pd.read_excel(fpath)
    elif name.endswith(".parquet"):
        return pd.read_parquet(fpath)
    else:
        return pd.read_json(fpath)


# ── Root ────────────────────────────────────────────────────────────

@app.get("/")
def home():
    return {
        "status": "AutoML Platform API",
        "version": "3.0.0",
        "docs": "/docs",
    }

@app.get("/api/v1/health")
def health():
    dataset_count = len([f for f in os.listdir(DATASET_DIR) if any(f.endswith(e) for e in ALLOWED_EXTENSIONS)])
    model_count = len([f for f in os.listdir(MODELS_DIR) if f.endswith(".pkl")])
    return {
        "status": "healthy",
        "version": "3.0.0",
        "timestamp": datetime.now().isoformat(),
        "datasets_count": dataset_count,
        "models_count": model_count,
    }


# ── Auth ────────────────────────────────────────────────────────────

@app.post("/api/v1/auth/register")
def auth_register(email: str = Form(...), password: str = Form(...), name: str = Form(...),
                  device_info: str = Form(None), db: Session = Depends(get_db)):
    return register_user(db, email, password, name, device_info=device_info)

@app.post("/api/v1/auth/login")
def auth_login(email: str = Form(...), password: str = Form(...),
               device_info: str = Form(None), db: Session = Depends(get_db)):
    return login_user(db, email, password, device_info=device_info)

@app.post("/api/v1/auth/refresh")
def auth_refresh(token: str = Form(...), db: Session = Depends(get_db)):
    return refresh_token(token, db)

@app.get("/api/v1/auth/me")
def auth_me(current_user: dict = Depends(get_current_user)):
    return {"user": current_user}

@app.put("/api/v1/auth/profile")
def auth_update_profile(name: str = Form(None), preferences: str = Form(None),
                        current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    prefs = json.loads(preferences) if preferences else None
    return update_user_profile(db, current_user["id"], name=name, preferences=prefs)

@app.post("/api/v1/auth/change-password")
def auth_change_password(current_password: str = Form(...), new_password: str = Form(...),
                         current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    return change_password(db, current_user["id"], current_password, new_password)

@app.post("/api/v1/auth/send-verification")
def auth_send_verification(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    return send_verification(db, current_user["id"])

@app.post("/api/v1/auth/verify-email")
def auth_verify_email(token: str = Form(...), db: Session = Depends(get_db)):
    return verify_email(db, token)

@app.post("/api/v1/auth/forgot-password")
def auth_forgot_password(email: str = Form(...), db: Session = Depends(get_db)):
    return forgot_password(db, email)

@app.post("/api/v1/auth/reset-password")
def auth_reset_password(token: str = Form(...), new_password: str = Form(...), db: Session = Depends(get_db)):
    return reset_password(db, token, new_password)

@app.post("/api/v1/auth/google")
def auth_google(id_token: str = Form(...), device_info: str = Form(None), db: Session = Depends(get_db)):
    return google_login(db, id_token, device_info=device_info)

@app.get("/api/v1/auth/sessions")
def auth_list_sessions(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    return {"sessions": list_sessions(db, current_user["id"])}

@app.delete("/api/v1/auth/sessions/{session_id}")
def auth_revoke_session(session_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    return revoke_session(db, current_user["id"], session_id)

@app.post("/api/v1/auth/logout")
def auth_logout(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    return logout(db, credentials)

@app.post("/api/v1/auth/logout-all")
def auth_logout_all(current_user: dict = Depends(get_current_user),
                    credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    return revoke_all_sessions(db, current_user["id"], exclude_token=credentials.credentials)


# ── Search ──────────────────────────────────────────────────────────

@app.get("/api/v1/search")
def search(q: str = Query("", min_length=1), db: Session = Depends(get_db)):
    results = global_search(db, q, DATASET_DIR)
    return results


# ── Datasets ─────────────────────────────────────────────────────────

@app.get("/api/v1/datasets")
def list_datasets(db: Session = Depends(get_db)):
    db_records = {r.filename: r for r in list_dataset_records(db)}
    files = []
    for f in sorted(os.listdir(DATASET_DIR)):
        if not any(f.endswith(e) for e in ALLOWED_EXTENSIONS):
            continue
        fpath = os.path.join(DATASET_DIR, f)
        size_kb = round(os.path.getsize(fpath) / 1024, 1)
        try:
            df = _get_dataset_df(f) if os.path.exists(fpath) else pd.DataFrame()
            row_count = 0
            if f.endswith(".csv"):
                with open(fpath, encoding="utf-8", errors="ignore") as fh:
                    row_count = max(0, sum(1 for _ in fh) - 1)
            elif f.endswith(".parquet"):
                row_count = len(df)
            record = db_records.get(f)
            files.append({
                "name": f, "size_kb": size_kb,
                "rows": row_count or len(df),
                "columns": list(df.columns) if not df.empty else [],
                "dtypes": {c: str(dt) for c, dt in df.dtypes.items()} if not df.empty else {},
                "uploaded_at": record.created_at.isoformat() if record else datetime.fromtimestamp(os.path.getmtime(fpath)).isoformat(),
                "project_id": record.project_id if record else None,
                "status": record.status if record else "ready",
            })
        except Exception:
            files.append({"name": f, "size_kb": size_kb, "rows": 0, "columns": [], "uploaded_at": "", "status": "error"})
    return {"datasets": files}

@app.post("/api/v1/datasets")
async def upload_dataset(
    file: UploadFile = File(...),
    project_id: str = Form(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_optional_user),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type {ext}")
    content = await file.read()
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail=f"File exceeds {MAX_UPLOAD_MB}MB limit")
    filename = sanitize_filename(file.filename)
    file_location = os.path.join(DATASET_DIR, filename)
    with open(file_location, "wb") as f:
        f.write(content)
    try:
        df = _get_dataset_df(filename)
    except Exception as e:
        os.remove(file_location)
        raise HTTPException(status_code=400, detail=f"Failed to parse: {str(e)}")
    record = create_dataset_record(db, filename, size_kb=round(len(content) / 1024, 1), rows=len(df), columns=list(df.columns), project_id=project_id)
    log_audit(db, current_user.get("name", "User"), "dataset.uploaded", filename, "dataset", record.id)
    return {
        "message": f"Uploaded {filename}",
        "filename": filename,
        "features": list(df.columns),
        "rows": len(df),
        "id": record.id,
    }

@app.get("/api/v1/datasets/{name}/download")
def download_dataset(name: str):
    fpath = validate_path(name)
    if not os.path.exists(fpath):
        raise HTTPException(status_code=404, detail=f"Dataset '{name}' not found")
    ext = os.path.splitext(name)[1].lower()
    media_map = {".csv": "text/csv", ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", ".parquet": "application/octet-stream", ".json": "application/json"}
    return FileResponse(fpath, filename=name, media_type=media_map.get(ext, "application/octet-stream"))

@app.delete("/api/v1/datasets/{name}")
def delete_dataset(name: str, db: Session = Depends(get_db), current_user: dict = Depends(get_optional_user)):
    fpath = validate_path(name)
    if not os.path.exists(fpath):
        raise HTTPException(status_code=404, detail=f"Dataset '{name}' not found")
    os.remove(fpath)
    delete_dataset_record(db, name)
    log_audit(db, current_user.get("name", "User"), "dataset.deleted", name, "dataset")
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
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/api/v1/datasets/{name}/profile")
def dataset_profile(name: str):
    return profile_dataset(name)

@app.get("/api/v1/datasets/{name}/analyze")
def dataset_analyze(name: str, target: str = None):
    try:
        return analyze_dataset(name, target)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/datasets/{name}/clean")
def clean(name: str, operations: str = Form(...), db: Session = Depends(get_db), current_user: dict = Depends(get_optional_user)):
    try:
        ops = json.loads(operations)
        result = clean_dataset(name, ops)
        log_audit(db, current_user.get("name", "User"), "dataset.cleaned", name, "dataset")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/datasets/{name}/auto-clean")
def auto_clean_endpoint(name: str, db: Session = Depends(get_db), current_user: dict = Depends(get_optional_user)):
    try:
        result = auto_clean(name)
        log_audit(db, current_user.get("name", "User"), "dataset.auto_cleaned", name, "dataset")
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/datasets/{name}/features/generate")
def generate(name: str, operations: str = Form(...), db: Session = Depends(get_db), current_user: dict = Depends(get_optional_user)):
    try:
        ops = json.loads(operations)
        result = generate_features(name, ops)
        log_audit(db, current_user.get("name", "User"), "features.generated", name, "dataset")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/v1/datasets/{name}/features/suggest")
def suggest(name: str):
    return suggest_features(name)


# ── Experiments ──────────────────────────────────────────────────────

@app.get("/api/v1/experiments")
def list_experiments_api(db: Session = Depends(get_db), current_user: dict = Depends(get_optional_user)):
    return {"experiments": [{
        "id": e.id, "name": e.name, "model": e.model,
        "task_type": e.task_type, "dataset": e.dataset, "target": e.target,
        "cv_score": e.cv_score, "metrics": e.metrics,
        "training_time": e.training_time, "total_time": e.total_time,
        "status": e.status, "runAt": e.run_at.isoformat() if e.run_at else None,
        "params": e.params, "feature_importance": e.feature_importance,
        "confusion_matrix": e.confusion_matrix,
        "user_id": e.user_id, "project_id": getattr(e, "project_id", None),
    } for e in list_experiments(db)]}


# ── Training ─────────────────────────────────────────────────────────

@app.post("/api/v1/training")
def train_model(
    file_name: str = Form(...),
    target_column: str = Form(...),
    task_type: str = Form(None),
    project_id: str = Form(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_optional_user),
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
        best_model_name = f"{file_name.split('.')[0]}_{results['best_model']}"

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
            "user_id": current_user.get("id"),
            "project_id": project_id,
            "feature_importance": results.get("feature_importance"),
            "params": results.get("best_params"),
        }
        exp = create_experiment(db, exp_data)

        # Register in model_registry
        model_path = os.path.join(MODELS_DIR, f"{best_model_name}.pkl")
        model_size = round(os.path.getsize(model_path) / 1024, 1) if os.path.exists(model_path) else None
        create_model(db, {
            "experiment_id": exp.id,
            "user_id": current_user.get("id"),
            "project_id": project_id,
            "name": best_model_name,
            "model_type": results["best_model"],
            "task_type": task,
            "file_path": model_path,
            "file_size_kb": model_size,
            "cv_score": results["cv_score"],
            "metrics": results["metrics"],
            "params": results.get("best_params"),
            "status": "staging",
        })

        log_audit(db, current_user.get("name", "User"), "training.completed",
                  f"{file_name} -> {results['best_model']}", "experiment", exp.id)
        return {
            "status": "Success",
            "message": "Training completed!",
            "data_summary": {"features_count": X.shape[1], "rows_count": X.shape[0], "task_type": task},
            "training_summary": results,
        }
    except HTTPException:
        raise
    except Exception as e:
        detail = str(e)
        if "paging file" in detail.lower() or "memory" in detail.lower():
            detail = "System running low on memory. Try closing other applications or reducing dataset size."
        raise HTTPException(status_code=500, detail=detail)


# ── Models ───────────────────────────────────────────────────────────

@app.get("/api/v1/models")
def list_models_api(db: Session = Depends(get_db), current_user: dict = Depends(get_optional_user)):
    db_models = list_models(db)
    fs_models = []
    for f in os.listdir(MODELS_DIR):
        if f.endswith(".pkl"):
            fpath = os.path.join(MODELS_DIR, f)
            size_kb = round(os.path.getsize(fpath) / 1024, 1)
            meta = _load_model_meta(f)
            fs_models.append({
                "name": f, "size_kb": size_kb,
                "task_type": meta.get("task_type"),
                "best_score": meta.get("cv_score"),
                "metrics": meta.get("metrics"),
                "created_at": datetime.fromtimestamp(os.path.getmtime(fpath)).isoformat(),
            })
    registered = [{
        "id": m.id, "name": m.name, "version": m.version,
        "model_type": m.model_type, "task_type": m.task_type,
        "framework": m.framework, "file_size_kb": m.file_size_kb,
        "cv_score": m.cv_score, "status": m.status,
        "tags": m.tags, "description": m.description,
        "experiment_id": m.experiment_id,
        "created_at": m.created_at.isoformat() if m.created_at else None,
    } for m in db_models]
    return {"models": fs_models, "registered_models": registered}

@app.get("/api/v1/models/{name}")
def get_model_detail(name: str):
    fpath = os.path.join(MODELS_DIR, name)
    if not os.path.exists(fpath):
        raise HTTPException(status_code=404, detail=f"Model '{name}' not found")
    meta = _load_model_meta(name)
    return {"name": name, **meta} if meta else {"name": name}

@app.delete("/api/v1/models/{name}")
def delete_model(name: str, db: Session = Depends(get_db), current_user: dict = Depends(get_optional_user)):
    fpath = os.path.join(MODELS_DIR, name)
    meta_path = fpath.replace(".pkl", "_meta.json")
    removed = []
    for p in [fpath, meta_path]:
        if os.path.exists(p):
            os.remove(p)
            removed.append(p)
    if not removed:
        raise HTTPException(status_code=404, detail=f"Model '{name}' not found")
    log_audit(db, current_user.get("name", "User"), "model.deleted", name, "model")
    return {"message": f"Deleted model '{name}'"}


# ── Hyperparameter Tuning ───────────────────────────────────────────

FORMAT_PARAMS = {
    "LogisticRegression": {"C": {"type": "float", "range": [0.001, 10], "log": True}},
    "RandomForest": {"n_estimators": {"type": "int", "range": [10, 500]}, "max_depth": {"type": "int", "range": [1, 50]}},
    "GradientBoosting": {"n_estimators": {"type": "int", "range": [10, 500]}, "learning_rate": {"type": "float", "range": [0.001, 1], "log": True}, "max_depth": {"type": "int", "range": [1, 10]}},
    "SVC": {"C": {"type": "float", "range": [0.01, 100], "log": True}, "kernel": {"type": "choice", "values": ["rbf", "linear", "poly", "sigmoid"]}, "gamma": {"type": "choice", "values": ["scale", "auto"]}},
    "KNN": {"n_neighbors": {"type": "int", "range": [1, 50]}, "weights": {"type": "choice", "values": ["uniform", "distance"]}},
    "Ridge": {"alpha": {"type": "float", "range": [0.001, 100], "log": True}},
    "Lasso": {"alpha": {"type": "float", "range": [0.0001, 10], "log": True}},
    "SVR": {"C": {"type": "float", "range": [0.01, 100], "log": True}, "kernel": {"type": "choice", "values": ["rbf", "linear", "poly", "sigmoid"]}, "gamma": {"type": "choice", "values": ["scale", "auto"]}},
}

@app.get("/api/v1/tuning/params")
def get_tuning_params():
    return {
        "classification": {
            name: {"params": spec["params"], "formats": FORMAT_PARAMS.get(name, {})}
            for name, spec in CLASSIFICATION_MODELS.items()
        },
        "regression": {
            name: {"params": spec["params"], "formats": FORMAT_PARAMS.get(name, {})}
            for name, spec in REGRESSION_MODELS.items()
        },
    }

@app.post("/api/v1/tuning")
def run_tuning_endpoint(
    file_name: str = Form(...),
    target_column: str = Form(...),
    models: str = Form(...),
    params: str = Form("{}"),
    search_method: str = Form("random"),
    cv_folds: int = Form(5),
    task_type: str = Form(None),
    project_id: str = Form(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_optional_user),
):
    try:
        import json
        model_list = json.loads(models)
        param_overrides = json.loads(params)
        preprocess_result = auto_preprocess(file_name, target_column, task_type)
        X = preprocess_result["X"]
        y = preprocess_result["y"]
        task = preprocess_result["task_type"]
        tuning = run_tuning(X, y, task, model_list, param_overrides, search_method, cv_folds)
        exp_data_list = []
        for r in tuning["results"]:
            if "error" in r:
                continue
            exp_data = {
                "name": f"{file_name.split('.')[0]}-{r['name']}-tuned",
                "model": r["name"],
                "task_type": task,
                "cv_score": r["cv_score"],
                "metrics": r["metrics"],
                "dataset": file_name,
                "target": target_column,
                "training_time": r["training_time"],
                "total_time": r["training_time"],
                "status": "success",
                "run_at": datetime.now(timezone.utc),
                "user_id": current_user.get("id"),
                "project_id": project_id,
                "params": r["best_params"],
            }
            exp = create_experiment(db, exp_data)
            exp_data_list.append({"id": exp.id, "name": exp.name, "model": r["name"], "cv_score": r["cv_score"], "metrics": r["metrics"]})
        log_audit(db, current_user.get("name", "User"), "tuning.completed", f"Tuned {len(exp_data_list)} models", "tuning")
        return {"results": tuning["results"], "experiments": exp_data_list, "task_type": task}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── AutoML Engine ────────────────────────────────────────────────────

@app.get("/api/v1/engine/models")
def get_engine_models():
    clf_names = list(CLASSIFICATION_MODELS.keys())
    reg_names = list(REGRESSION_MODELS.keys())
    return {
        "classification": clf_names,
        "regression": reg_names,
        "all": list(dict.fromkeys(clf_names + reg_names)),
        "optional": {
            "XGBoost": XGB_AVAILABLE,
            "LightGBM": LGBM_AVAILABLE,
            "CatBoost": CATB_AVAILABLE,
        },
    }

@app.post("/api/v1/engine/train")
def run_engine(
    file_name: str = Form(...),
    target_column: str = Form(...),
    models: str = Form(...),
    task_type: str = Form(None),
    project_id: str = Form(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_optional_user),
):
    try:
        import json
        model_list = json.loads(models)
        start = time.time()
        preprocess_result = auto_preprocess(file_name, target_column, task_type)
        X = preprocess_result["X"]
        y = preprocess_result["y"]
        preprocessor = preprocess_result["preprocessor"]
        task = preprocess_result["task_type"]
        engine_result = run_engine_training(X, y, task, model_list,
                                            model_name_prefix=file_name.split('.')[0],
                                            preprocessor=preprocessor)
        elapsed = round(time.time() - start, 2)
        exp_list = []
        for r in engine_result["results"]:
            if "error" in r:
                continue
            exp_data = {
                "name": f"{file_name.split('.')[0]}-{r['name']}",
                "model": r["name"],
                "task_type": task,
                "cv_score": r["cv_score"],
                "metrics": r["metrics"],
                "dataset": file_name,
                "target": target_column,
                "training_time": r["training_time"],
                "total_time": elapsed,
                "status": "success",
                "run_at": datetime.now(timezone.utc),
                "user_id": current_user.get("id"),
                "project_id": project_id,
                "params": r.get("best_params"),
                "feature_importance": r.get("feature_importance"),
            }
            exp = create_experiment(db, exp_data)
            model_path = os.path.join(MODELS_DIR, f"{file_name.split('.')[0]}_{r['name']}.pkl")
            model_size = round(os.path.getsize(model_path) / 1024, 1) if os.path.exists(model_path) else None
            create_model(db, {
                "experiment_id": exp.id,
                "user_id": current_user.get("id"),
                "project_id": project_id,
                "name": f"{file_name.split('.')[0]}_{r['name']}",
                "model_type": r["name"],
                "task_type": task,
                "file_path": model_path,
                "file_size_kb": model_size,
                "cv_score": r["cv_score"],
                "metrics": r["metrics"],
                "params": r.get("best_params"),
                "status": "staging",
            })
            exp_list.append({"id": exp.id, "name": exp.name, "model": r["name"], "cv_score": r["cv_score"], "metrics": r["metrics"]})
        log_audit(db, current_user.get("name", "User"), "engine.completed",
                  f"{file_name} trained {len(exp_list)} models", "engine")
        return {
            "results": engine_result["results"],
            "experiments": exp_list,
            "best_model": engine_result["best_model"],
            "task_type": task,
            "elapsed": elapsed,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── Deployments ──────────────────────────────────────────────────────

@app.get("/api/v1/deployments")
def list_deployments_api(db: Session = Depends(get_db), current_user: dict = Depends(get_optional_user)):
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
    project_id: str = Form(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_optional_user),
):
    fpath = os.path.join(MODELS_DIR, model_name)
    if not os.path.exists(fpath):
        raise HTTPException(status_code=404, detail=f"Model '{model_name}' not found")
    dep = create_deployment(db, {
        "name": endpoint_name,
        "model_id": model_name,
        "user_id": current_user.get("id"),
        "project_id": project_id,
        "endpoint_url": f"/api/v1/predictions?model={model_name}",
        "status": "active",
        "environment": "production",
    })
    log_audit(db, current_user.get("name", "User"), "deployment.created", endpoint_name, "deployment", dep.id)
    return {
        "id": dep.id, "model_name": model_name, "endpoint_name": endpoint_name,
        "endpoint_url": dep.endpoint_url, "status": dep.status,
        "created_at": dep.created_at.isoformat() if dep.created_at else None,
    }

@app.delete("/api/v1/deployments/{dep_id}")
def delete_deployment_api(dep_id: str, db: Session = Depends(get_db), current_user: dict = Depends(get_optional_user)):
    if not delete_deployment(db, dep_id):
        raise HTTPException(status_code=404, detail=f"Deployment '{dep_id}' not found")
    log_audit(db, current_user.get("name", "User"), "deployment.deleted", dep_id, "deployment")
    return {"message": f"Removed deployment '{dep_id}'"}


# ── Predictions ──────────────────────────────────────────────────────

@app.post("/api/v1/predictions")
def predict(model_name: str = Form(...), payload: str = Form(...), db: Session = Depends(get_db), current_user: dict = Depends(get_optional_user)):
    try:
        input_data = json.loads(payload)
        result = make_prediction(model_name, input_data)
        log_audit(db, current_user.get("name", "User"), "prediction.made", model_name, "prediction")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/batch-predictions")
def batch_predict(
    model_name: str = Form(...),
    file_name: str = Form(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_optional_user),
):
    try:
        df = _get_dataset_df(file_name)
        results = []
        for _, row in df.iterrows():
            result = make_prediction(model_name, row.to_dict())
            results.append(result)
        log_audit(db, current_user.get("name", "User"), "batch_prediction.made", model_name, "prediction")
        return {"predictions": results, "count": len(results)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── Pipelines ────────────────────────────────────────────────────────

@app.get("/api/v1/pipelines")
def list_pipelines_api(db: Session = Depends(get_db), current_user: dict = Depends(get_optional_user)):
    pipes = list_pipelines(db)
    return {"pipelines": [{
        "id": p.id, "name": p.name, "description": p.description,
        "steps": p.steps, "status": p.status, "schedule": p.schedule,
        "created_at": p.created_at.isoformat() if p.created_at else None,
        "updated_at": p.updated_at.isoformat() if p.updated_at else None,
    } for p in pipes]}

@app.post("/api/v1/pipelines")
def create_pipeline_api(data: PipelineCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_optional_user)):
    pipe = create_pipeline(db, user_id=current_user.get("id") or "system",
                           name=data.name, steps=data.steps,
                           description=data.description, schedule=data.schedule)
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


# ── Webhooks ─────────────────────────────────────────────────────────

@app.get("/api/v1/webhooks")
def list_webhooks_api(db: Session = Depends(get_db), current_user: dict = Depends(get_optional_user)):
    whs = list_webhooks(db)
    return {"webhooks": [{
        "id": w.id, "name": w.name, "url": w.url,
        "events": w.events, "status": w.status,
        "created_at": w.created_at.isoformat() if w.created_at else None,
    } for w in whs]}

@app.post("/api/v1/webhooks")
def create_webhook_api(data: WebhookCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_optional_user)):
    wh = create_webhook(db, {**data.model_dump(), "user_id": current_user.get("id")})
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


# ── Teams ────────────────────────────────────────────────────────────

@app.get("/api/v1/teams")
def list_teams_api(db: Session = Depends(get_db), current_user: dict = Depends(get_optional_user)):
    teams = list_teams(db)
    return {"teams": [{
        "id": t.id, "name": t.name, "slug": t.slug,
        "plan": t.plan, "member_count": len(t.members),
        "created_at": t.created_at.isoformat() if t.created_at else None,
    } for t in teams]}

@app.post("/api/v1/teams")
def create_team_api(name: str = Form(...), db: Session = Depends(get_db), current_user: dict = Depends(get_optional_user)):
    team = create_team(db, name, owner_id=current_user.get("id") or "system")
    return {"id": team.id, "name": team.name, "slug": team.slug, "plan": team.plan}


# ── API Keys ─────────────────────────────────────────────────────────

@app.get("/api/v1/api-keys")
def list_api_keys_api(current_user: dict = Depends(get_optional_user), db: Session = Depends(get_db)):
    if current_user.get("id") == "anonymous":
        raise HTTPException(status_code=401, detail="Authentication required")
    keys = list_api_keys(db, current_user["id"])
    return {"api_keys": [{"id": k.id, "name": k.name, "key_prefix": k.key_prefix,
                          "status": k.status, "created_at": k.created_at.isoformat() if k.created_at else None}
                         for k in keys]}

@app.post("/api/v1/api-keys")
def create_api_key_api(name: str = Form(...), current_user: dict = Depends(get_optional_user), db: Session = Depends(get_db)):
    if current_user.get("id") == "anonymous":
        raise HTTPException(status_code=401, detail="Authentication required")
    result = create_api_key(db, current_user["id"], name)
    return result

@app.delete("/api/v1/api-keys/{key_id}")
def delete_api_key_api(key_id: str, current_user: dict = Depends(get_optional_user), db: Session = Depends(get_db)):
    if current_user.get("id") == "anonymous":
        raise HTTPException(status_code=401, detail="Authentication required")
    if not delete_api_key(db, key_id):
        raise HTTPException(status_code=404, detail="API key not found")
    return {"message": "API key deleted"}


# ── Monitoring ───────────────────────────────────────────────────────

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


# ── Projects ─────────────────────────────────────────────────────────

@app.get("/api/v1/projects")
def list_projects_api(db: Session = Depends(get_db), current_user: dict = Depends(get_optional_user)):
    projects = list_projects(db)
    datasets = list_dataset_records(db)
    exps = list_experiments(db)
    models = list_models(db)
    deploys = list_deployments(db)
    ds_by_project = {}
    for d in datasets:
        pid = d.project_id or "none"
        ds_by_project.setdefault(pid, []).append(d)
    exp_by_project = {}
    for e in exps:
        pid = getattr(e, "project_id", None) or "none"
        exp_by_project.setdefault(pid, []).append(e)
    model_by_project = {}
    for m in models:
        pid = getattr(m, "project_id", None) or "none"
        model_by_project.setdefault(pid, []).append(m)
    deploy_by_project = {}
    for d in deploys:
        pid = getattr(d, "project_id", None) or "none"
        deploy_by_project.setdefault(pid, []).append(d)
    return {"projects": [{
        "id": p.id, "name": p.name, "description": p.description,
        "status": p.status, "notes": p.notes, "model_ids": p.model_ids,
        "dataset_ids": p.dataset_ids, "tags": p.tags,
        "dataset_count": len(ds_by_project.get(p.id, [])),
        "experiment_count": len(exp_by_project.get(p.id, [])),
        "model_count": len(model_by_project.get(p.id, [])),
        "deployment_count": len(deploy_by_project.get(p.id, [])),
        "created_at": p.created_at.isoformat() if p.created_at else None,
    } for p in projects]}

@app.post("/api/v1/projects")
def create_project_api(name: str = Form(...), description: str = Form(None),
                       db: Session = Depends(get_db), current_user: dict = Depends(get_optional_user)):
    p = create_project(db, name=name, description=description, user_id=current_user.get("id"))
    log_audit(db, current_user.get("name", "User"), "project.created", name, "project", p.id)
    return {"id": p.id, "name": p.name, "description": p.description,
            "status": p.status, "created_at": p.created_at.isoformat() if p.created_at else None}

@app.get("/api/v1/projects/{project_id}")
def get_project_api(project_id: str, db: Session = Depends(get_db)):
    p = get_project(db, project_id)
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    datasets = list_dataset_records(db, project_id=project_id)
    exps = list_experiments(db, project_id=project_id)
    models = list_models(db, project_id=project_id)
    deploys = list_deployments(db, project_id=project_id)
    return {
        "id": p.id, "name": p.name, "description": p.description,
        "status": p.status, "notes": p.notes, "model_ids": p.model_ids,
        "dataset_ids": p.dataset_ids, "tags": p.tags,
        "datasets": [{"name": d.filename, "rows": d.rows, "columns": d.columns, "size_kb": d.file_size_kb} for d in datasets],
        "experiments": [{"id": e.id, "name": e.name, "model": e.model, "dataset": e.dataset, "cv_score": e.cv_score, "status": e.status, "created_at": e.created_at.isoformat() if e.created_at else None} for e in exps],
        "models": [{"id": m.id, "name": m.name, "model_type": m.model_type, "cv_score": m.cv_score, "status": m.status, "created_at": m.created_at.isoformat() if m.created_at else None} for m in models],
        "deployments": [{"id": d.id, "name": d.name, "status": d.status, "environment": d.environment, "endpoint_url": d.endpoint_url, "created_at": d.created_at.isoformat() if d.created_at else None} for d in deploys],
        "dataset_count": len(datasets), "experiment_count": len(exps),
        "model_count": len(models), "deployment_count": len(deploys),
        "created_at": p.created_at.isoformat() if p.created_at else None,
        "updated_at": p.updated_at.isoformat() if p.updated_at else None,
    }

@app.put("/api/v1/projects/{project_id}")
def update_project_api(project_id: str, name: str = Form(None), description: str = Form(None),
                       status: str = Form(None), notes: str = Form(None),
                       db: Session = Depends(get_db)):
    p = update_project(db, project_id, name=name, description=description, status=status, notes=notes)
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"id": p.id, "name": p.name, "description": p.description, "status": p.status,
            "notes": p.notes,
            "updated_at": p.updated_at.isoformat() if p.updated_at else None}


@app.put("/api/v1/projects/{project_id}/notes")
def update_project_notes_api(project_id: str, notes: str = Form(""),
                             db: Session = Depends(get_db)):
    p = update_project(db, project_id, notes=notes)
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"notes": p.notes, "updated_at": p.updated_at.isoformat() if p.updated_at else None}


@app.get("/api/v1/projects/mine")
def list_my_projects_api(db: Session = Depends(get_db), current_user: dict = Depends(get_optional_user)):
    uid = current_user.get("id")
    if not uid:
        return {"projects": []}
    projects = list_projects_by_user(db, uid)
    return {"projects": [{
        "id": p.id, "name": p.name, "description": p.description,
        "status": p.status,
        "created_at": p.created_at.isoformat() if p.created_at else None,
    } for p in projects]}


@app.get("/api/v1/projects/templates")
def list_project_templates():
    return {"templates": [
        {"name": "Customer Churn", "description": "Predict which customers are likely to churn using classification models.", "status": "development", "tags": ["classification", "churn", "customer-analytics"]},
        {"name": "Loan Prediction", "description": "Classify loan applications as approved or rejected based on applicant features.", "status": "development", "tags": ["classification", "finance", "risk"]},
        {"name": "Heart Disease", "description": "Detect heart disease risk using patient health indicators and vital signs.", "status": "development", "tags": ["classification", "healthcare", "medical"]},
        {"name": "House Price Prediction", "description": "Predict real estate prices from property features, location data, and market trends.", "status": "development", "tags": ["regression", "real-estate", "pricing"]},
        {"name": "Employee Attrition", "description": "Identify employees at risk of leaving using HR data and engagement metrics.", "status": "development", "tags": ["classification", "hr", "analytics"]},
    ]}


@app.delete("/api/v1/projects/{project_id}")
def delete_project_api(project_id: str, db: Session = Depends(get_db)):
    p = get_project(db, project_id)
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(p)
    db.commit()
    return {"status": "deleted"}


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


# ── Activity ─────────────────────────────────────────────────────────

@app.get("/api/v1/activity")
def activity(db: Session = Depends(get_db)):
    logs = list_audit_logs(db)
    return {"activities": [{
        "id": l.id, "actor": l.actor, "action": l.action,
        "target": l.target, "resource_type": l.resource_type,
        "status": l.status,
        "time": l.created_at.isoformat() if l.created_at else None,
    } for l in logs]}


@app.get("/api/v1/analytics")
def analytics(db: Session = Depends(get_db), days: int = 30):
    return dashboard_analytics(db, days)


@app.get("/api/v1/admin/stats")
def admin_stats(db: Session = Depends(get_db)):
    from crud import list_projects
    from models import User
    users = db.query(User).count()
    projects = len(list_projects(db))
    experiments = len(list_experiments(db))
    models = len(list_models(db))
    datasets = len(list_dataset_records(db))
    return {
        "users": users, "projects": projects,
        "experiments": experiments, "models": models,
        "datasets": datasets,
    }


@app.get("/api/v1/admin/users")
def admin_users(db: Session = Depends(get_db)):
    from models import User
    users = db.query(User).order_by(User.created_at.desc()).limit(100).all()
    return {"users": [{"id": u.id, "email": u.email, "name": u.name, "role": u.role, "is_active": u.is_active, "created_at": u.created_at.isoformat() if u.created_at else None} for u in users]}


# ── SQL Query ────────────────────────────────────────────────────────

@app.post("/api/v1/query")
def run_sql(query: str = Form(...), dataset: str = Form(None), current_user: dict = Depends(get_optional_user)):
    import duckdb
    sql_lower = query.strip().lower()
    disallowed = ["insert", "update", "delete", "drop", "alter", "create", "grant", "attach", "detach"]
    if any(sql_lower.startswith(kw) for kw in disallowed):
        raise HTTPException(status_code=400, detail="Only SELECT queries are allowed")
    try:
        con = duckdb.connect()
        if dataset:
            fpath = validate_path(dataset)
            if not os.path.exists(fpath):
                raise HTTPException(status_code=404, detail=f"Dataset '{dataset}' not found")
            safe_path = fpath.replace(os.sep, "/")
            con.execute(f"CREATE OR REPLACE VIEW data AS SELECT * FROM read_csv_auto('{safe_path}', strict_mode=false, ignore_errors=true)")
        else:
            for f in os.listdir(DATASET_DIR):
                if f.endswith((".csv", ".parquet")):
                    fpath = os.path.join(DATASET_DIR, f)
                    tbl = re.sub(r"[^a-zA-Z0-9_]", "_", f.rsplit(".", 1)[0])
                    safe_path = fpath.replace(os.sep, "/")
                    con.execute(f"CREATE OR REPLACE VIEW \"{tbl}\" AS SELECT * FROM read_csv_auto('{safe_path}', strict_mode=false, ignore_errors=true)")
        result = con.execute(query)
        columns = [desc[0] for desc in result.description] if result.description else []
        rows = result.fetchall()
        data = [dict(zip(columns, row)) for row in rows]
        con.close()
        return {"columns": columns, "rows": len(data), "data": data, "query": query}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── AI Assistant ─────────────────────────────────────────────────────

@app.post("/api/v1/ai/chat")
def ai_chat(question: str = Form(...), current_user: dict = Depends(get_optional_user)):
    try:
        return {"answer": answer_question(question)}
    except Exception as e:
        return {"answer": f"Error: {str(e)}. Please try again."}

@app.get("/api/v1/ai/suggestions")
def ai_suggestions():
    try:
        datasets = ai_list_datasets()
        experiments = ai_load_experiments()
        if not datasets:
            return {"suggestions": ["Upload a dataset to get started with AutoML"]}
        d = datasets[0]
        numeric_cols = [c for c, t in d.get("dtypes", {}).items() if "float" in t or "int" in t]
        text_cols = [c for c, t in d.get("dtypes", {}).items() if "object" in t or "str" in t]
        answers = [f"Which model should I train on {d['name']}?"]
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
