from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
import pandas as pd
import os
import json
import time
from datetime import datetime
from preprocess import auto_preprocess
from train import run_automl_training
from predict import make_prediction, load_model_metadata
from cleaning import profile_dataset, clean_dataset
from features import generate_features, suggest_features
from ai_assistant import answer_question, list_datasets as ai_list_datasets, load_experiments as ai_load_experiments
from auth import register_user, login_user, get_current_user

security = HTTPBearer(auto_error=False)

app = FastAPI(title="AutoML Platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "..", "dataset")
MODELS_DIR = os.path.join(BASE_DIR, "..", "models")
EXPERIMENTS_FILE = os.path.join(BASE_DIR, "experiments.json")
DEPLOYMENTS_FILE = os.path.join(BASE_DIR, "deployments.json")

os.makedirs(DATASET_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)


def load_experiments():
    if os.path.exists(EXPERIMENTS_FILE):
        with open(EXPERIMENTS_FILE) as f:
            return json.load(f)
    return []


def save_experiment(exp: dict):
    exps = load_experiments()
    exps.insert(0, exp)
    with open(EXPERIMENTS_FILE, "w") as f:
        json.dump(exps, f, indent=2)


def log_activity(actor: str, action: str, target: str):
    activities = []
    activity_file = os.path.join(BASE_DIR, "activity.json")
    if os.path.exists(activity_file):
        with open(activity_file) as f:
            activities = json.load(f)
    activities.insert(0, {
        "id": f"act_{datetime.now().strftime('%Y%m%d%H%M%S%f')}",
        "actor": actor,
        "action": action,
        "target": target,
        "time": datetime.now().isoformat(),
    })
    with open(activity_file, "w") as f:
        json.dump(activities, f, indent=2)


@app.get("/")
def home():
    return {"status": "AutoML Backend is running smoothly!"}


@app.post("/api/v1/auth/register")
def auth_register(email: str = Form(...), password: str = Form(...), name: str = Form(...)):
    return register_user(email, password, name)


@app.post("/api/v1/auth/login")
def auth_login(email: str = Form(...), password: str = Form(...)):
    return login_user(email, password)


@app.get("/api/v1/auth/me")
def auth_me(current_user: dict = Depends(get_current_user)):
    return {"user": current_user}


@app.get("/api/v1/health")
def health():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "datasets_count": len([f for f in os.listdir(DATASET_DIR) if f.endswith((".csv", ".xlsx", ".parquet", ".json"))]),
        "models_count": len([f for f in os.listdir(MODELS_DIR) if f.endswith(".pkl")]),
    }


@app.get("/api/v1/datasets")
def list_datasets():
    files = []
    for f in os.listdir(DATASET_DIR):
        if f.endswith((".csv", ".xlsx", ".parquet", ".json")):
            fpath = os.path.join(DATASET_DIR, f)
            size_kb = round(os.path.getsize(fpath) / 1024, 1)
            try:
                if f.endswith(".csv"):
                    df = pd.read_csv(fpath)
                elif f.endswith(".xlsx"):
                    df = pd.read_excel(fpath)
                elif f.endswith(".parquet"):
                    df = pd.read_parquet(fpath)
                else:
                    df = pd.read_json(fpath)
                files.append({
                    "name": f,
                    "size_kb": size_kb,
                    "rows": len(df),
                    "columns": list(df.columns),
                    "dtypes": {c: str(dt) for c, dt in df.dtypes.items()},
                    "uploaded_at": datetime.fromtimestamp(os.path.getmtime(fpath)).isoformat(),
                })
            except Exception:
                files.append({
                    "name": f,
                    "size_kb": size_kb,
                    "rows": 0,
                    "columns": [],
                    "uploaded_at": datetime.fromtimestamp(os.path.getmtime(fpath)).isoformat(),
                })
    return {"datasets": files}


@app.post("/api/v1/datasets")
async def upload_dataset(file: UploadFile = File(...)):
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
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")
    log_activity("User", "uploaded dataset", file.filename)
    return {
        "message": f"Successfully uploaded {file.filename}",
        "filename": file.filename,
        "features": list(df.columns),
        "rows": len(df),
    }


@app.delete("/api/v1/datasets/{name}")
def delete_dataset(name: str):
    file_path = os.path.join(DATASET_DIR, name)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"Dataset '{name}' not found.")
    os.remove(file_path)
    log_activity("User", "deleted dataset", name)
    return {"message": f"Dataset '{name}' deleted successfully."}


@app.get("/api/v1/datasets/{name}/preview")
def preview_dataset(name: str, rows: int = 50, offset: int = 0):
    try:
        from cleaning import load_dataset as _ld
        df = _ld(name)
        total = len(df)
        page = df.iloc[offset:offset + rows]
        return {
            "name": name,
            "total_rows": total,
            "offset": offset,
            "rows_returned": len(page),
            "columns": list(df.columns),
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
def clean(name: str, operations: str = Form(...)):
    try:
        ops = json.loads(operations)
        result = clean_dataset(name, ops)
        log_activity("User", "cleaned dataset", name)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/v1/datasets/{name}/features/generate")
def generate(name: str, operations: str = Form(...)):
    try:
        ops = json.loads(operations)
        result = generate_features(name, ops)
        log_activity("User", "generated features", name)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/v1/datasets/{name}/features/suggest")
def suggest(name: str):
    try:
        return suggest_features(name)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get("/api/v1/models")
def list_models():
    models = []
    for f in os.listdir(MODELS_DIR):
        if f.endswith(".pkl"):
            fpath = os.path.join(MODELS_DIR, f)
            size_kb = round(os.path.getsize(fpath) / 1024, 1)
            meta = load_model_metadata(f)
            models.append({
                "name": f,
                "size_kb": size_kb,
                "task_type": meta.get("task_type") if meta else None,
                "best_score": meta.get("cv_score") if meta else None,
                "created_at": datetime.fromtimestamp(os.path.getmtime(fpath)).isoformat(),
            })
    return {"models": models}


@app.get("/api/v1/models/{name}")
def get_model_detail(name: str):
    meta = load_model_metadata(name)
    if not meta:
        model_path = os.path.join(MODELS_DIR, name)
        if not os.path.exists(model_path):
            raise HTTPException(status_code=404, detail=f"Model '{name}' not found.")
        return {"name": name, "detail": "No metadata available"}
    return {"name": name, **meta}


@app.delete("/api/v1/models/{name}")
def delete_model(name: str):
    model_path = os.path.join(MODELS_DIR, name)
    meta_path = model_path.replace(".pkl", "_meta.json")
    deleted = []
    if os.path.exists(model_path):
        os.remove(model_path)
        deleted.append(name)
    if os.path.exists(meta_path):
        os.remove(meta_path)
        deleted.append(meta_path)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Model '{name}' not found.")
    log_activity("User", "deleted model", name)
    return {"message": f"Model '{name}' deleted."}


def load_deployments():
    if os.path.exists(DEPLOYMENTS_FILE):
        with open(DEPLOYMENTS_FILE) as f:
            return json.load(f)
    return []


def save_deployment(dep: dict):
    deps = load_deployments()
    deps.insert(0, dep)
    with open(DEPLOYMENTS_FILE, "w") as f:
        json.dump(deps, f, indent=2)


@app.get("/api/v1/deployments")
def list_deployments():
    return {"deployments": load_deployments()}


@app.post("/api/v1/deployments")
def create_deployment(model_name: str = Form(...), endpoint_name: str = Form(...)):
    model_path = os.path.join(MODELS_DIR, model_name)
    if not os.path.exists(model_path):
        raise HTTPException(status_code=404, detail=f"Model '{model_name}' not found.")
    dep = {
        "id": f"dep_{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "model_name": model_name,
        "endpoint_name": endpoint_name,
        "endpoint_url": f"http://127.0.0.1:8000/api/v1/predictions?model={model_name}",
        "status": "Active",
        "created_at": datetime.now().isoformat(),
        "requests_count": 0,
    }
    save_deployment(dep)
    log_activity("User", "deployed model", endpoint_name)
    return dep


@app.delete("/api/v1/deployments/{dep_id}")
def delete_deployment(dep_id: str):
    deps = load_deployments()
    new_deps = [d for d in deps if d["id"] != dep_id]
    if len(new_deps) == len(deps):
        raise HTTPException(status_code=404, detail=f"Deployment '{dep_id}' not found.")
    with open(DEPLOYMENTS_FILE, "w") as f:
        json.dump(new_deps, f, indent=2)
    log_activity("User", "undeployed endpoint", dep_id)
    return {"message": f"Deployment '{dep_id}' removed."}


@app.post("/api/v1/training")
def train_model(
    file_name: str = Form(...),
    target_column: str = Form(...),
    task_type: str = Form(None),
):
    try:
        start = time.time()
        preprocess_result = auto_preprocess(file_name, target_column, task_type)
        X = preprocess_result["X"]
        y = preprocess_result["y"]
        preprocessor = preprocess_result["preprocessor"]
        task = preprocess_result["task_type"]

        results = run_automl_training(
            X, y,
            task_type=task,
            model_name_prefix=file_name.split('.')[0],
            preprocessor=preprocessor,
        )
        elapsed = round(time.time() - start, 2)

        save_experiment({
            "id": f"exp_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "name": f"{file_name.split('.')[0]}-{results['best_model']}",
            "model": results["best_model"],
            "task_type": task,
            "cv_score": results["cv_score"],
            "metrics": results["metrics"],
            "dataset": file_name,
            "target": target_column,
            "training_time": results["training_time"],
            "total_time": elapsed,
            "runAt": datetime.now().isoformat(),
            "status": "success",
        })
        log_activity("User", "trained model", f"{file_name} -> {results['best_model']}")

        return {
            "status": "Success",
            "message": "Training completed successfully!",
            "data_summary": {
                "features_count": X.shape[1],
                "rows_count": X.shape[0],
                "task_type": task,
            },
            "training_summary": results,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/experiments")
def list_experiments():
    return {"experiments": load_experiments()}


@app.post("/api/v1/predictions")
def predict(model_name: str = Form(...), payload: str = Form(...)):
    try:
        input_data = json.loads(payload)
        result = make_prediction(model_name, input_data)
        log_activity("User", "ran inference", model_name)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/v1/monitoring/metrics")
def system_metrics():
    try:
        import psutil
        cpu = psutil.cpu_percent()
        memory = psutil.virtual_memory()
        storage = psutil.disk_usage(os.path.abspath(os.sep))
        return {
            "cpu": {"label": "CPU", "value": cpu, "detail": f"{psutil.cpu_count()} logical cores"},
            "memory": {"label": "Memory", "value": memory.percent, "detail": f"{memory.used / 1e9:.1f} GB / {memory.total / 1e9:.1f} GB"},
            "storage": {"label": "Storage", "value": storage.percent, "detail": f"{storage.used / 1e9:.1f} GB / {storage.total / 1e9:.1f} GB"},
            "gpu": {"label": "GPU", "value": 0, "detail": "Not available"},
        }
    except ImportError:
        return {
            "cpu": {"label": "CPU", "value": 0, "detail": "psutil not installed"},
            "memory": {"label": "Memory", "value": 0, "detail": "psutil not installed"},
            "storage": {"label": "Storage", "value": 0, "detail": "psutil not installed"},
            "gpu": {"label": "GPU", "value": 0, "detail": "Not available"},
        }
    except Exception:
        return {
            "cpu": {"label": "CPU", "value": 0, "detail": "N/A"},
            "memory": {"label": "Memory", "value": 0, "detail": "N/A"},
            "storage": {"label": "Storage", "value": 0, "detail": "N/A"},
            "gpu": {"label": "GPU", "value": 0, "detail": "N/A"},
        }


@app.get("/api/v1/monitoring/stats")
def live_stats():
    exps = load_experiments()
    models = [f for f in os.listdir(MODELS_DIR) if f.endswith(".pkl")]
    recent = exps[:5] if exps else []
    return {
        "modelsTrained": len(exps),
        "activeDeployments": len(models),
        "inferenceRequestsToday": sum(1 for e in exps if e.get("runAt", "").startswith(datetime.now().strftime("%Y-%m-%d"))),
        "avgLatencyMs": round(sum(e.get("training_time", 0) for e in exps) / max(len(exps), 1) * 1000, 1),
    }


@app.get("/api/v1/activity")
def activity():
    activity_file = os.path.join(BASE_DIR, "activity.json")
    if os.path.exists(activity_file):
        with open(activity_file) as f:
            return {"activities": json.load(f)}
    return {"activities": []}


@app.post("/api/v1/ai/chat")
def ai_chat(question: str = Form(...)):
    try:
        answer = answer_question(question)
        return {"answer": answer}
    except Exception as e:
        return {"answer": f"I ran into an error processing your question: {str(e)}. Please try again."}


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


@app.get("/api/v1/ai/suggestions")
def ai_suggestions():
    try:
        datasets = ai_list_datasets()
        experiments = ai_load_experiments()
        answers = []
        if not datasets:
            answers.append("Upload a dataset to get started with AutoML")
            return {"suggestions": answers}

        d = datasets[0]
        numeric_cols = [c for c, t in d.get("dtypes", {}).items() if "float" in t or "int" in t]
        text_cols = [c for c, t in d.get("dtypes", {}).items() if "object" in t or "str" in t]

        answers.append(f"Which model should I train on {d['name']}?")
        if numeric_cols:
            answers.append(f"How should I clean missing values in {d['name']}?")
        if text_cols:
            answers.append(f"Suggest features for {d['name']}")
        if experiments:
            latest = experiments[0]
            answers.append(f"Explain the {latest['model']} results on {latest['dataset']}")
        if len(datasets) > 1:
            answers.append("Compare my experiments across datasets")

        return {"suggestions": answers[:4]}
    except Exception:
        return {"suggestions": ["Which model should I use?", "How should I clean my data?", "Suggest features for my dataset"]}
