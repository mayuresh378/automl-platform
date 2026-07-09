import os
import time
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score, RandomizedSearchCV
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, confusion_matrix,
    mean_squared_error, mean_absolute_error, r2_score
)
from sklearn.pipeline import Pipeline

# Classification models
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier

# Regression models
from sklearn.linear_model import Ridge, Lasso
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.svm import SVR
from sklearn.neighbors import KNeighborsRegressor

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "..", "models")
os.makedirs(MODELS_DIR, exist_ok=True)

CLASSIFICATION_MODELS = {
    "LogisticRegression": {
        "model": LogisticRegression(max_iter=2000, random_state=42),
        "params": {"C": [0.01, 0.1, 1, 10], "solver": ["lbfgs", "liblinear"]},
    },
    "RandomForest": {
        "model": RandomForestClassifier(random_state=42),
        "params": {"n_estimators": [50, 100, 200], "max_depth": [None, 10, 20]},
    },
    "GradientBoosting": {
        "model": GradientBoostingClassifier(random_state=42),
        "params": {"n_estimators": [50, 100], "learning_rate": [0.01, 0.1], "max_depth": [3, 5]},
    },
    "SVC": {
        "model": SVC(probability=True, random_state=42),
        "params": {"C": [0.1, 1, 10], "kernel": ["rbf", "linear"], "gamma": ["scale", "auto"]},
    },
    "KNN": {
        "model": KNeighborsClassifier(),
        "params": {"n_neighbors": [3, 5, 7, 11], "weights": ["uniform", "distance"]},
    },
}

REGRESSION_MODELS = {
    "Ridge": {
        "model": Ridge(random_state=42),
        "params": {"alpha": [0.01, 0.1, 1, 10, 100]},
    },
    "Lasso": {
        "model": Lasso(random_state=42),
        "params": {"alpha": [0.001, 0.01, 0.1, 1]},
    },
    "RandomForest": {
        "model": RandomForestRegressor(random_state=42),
        "params": {"n_estimators": [50, 100, 200], "max_depth": [None, 10, 20]},
    },
    "GradientBoosting": {
        "model": GradientBoostingRegressor(random_state=42),
        "params": {"n_estimators": [50, 100], "learning_rate": [0.01, 0.1], "max_depth": [3, 5]},
    },
    "SVR": {
        "model": SVR(),
        "params": {"C": [0.1, 1, 10], "kernel": ["rbf", "linear"], "gamma": ["scale", "auto"]},
    },
    "KNN": {
        "model": KNeighborsRegressor(),
        "params": {"n_neighbors": [3, 5, 7, 11], "weights": ["uniform", "distance"]},
    },
}


def run_automl_training(X, y, task_type, model_name_prefix="automl_model", preprocessor=None, cv_folds=5):
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y if task_type == "classification" else None
    )

    model_candidates = CLASSIFICATION_MODELS if task_type == "classification" else REGRESSION_MODELS
    n_classes = y.nunique() if task_type == "classification" else None

    results = []
    for name, spec in model_candidates.items():
        try:
            start = time.time()
            base_model = spec["model"]
            param_dist = spec["params"]

            if n_classes == 2 and name == "LogisticRegression":
                pass

            search = RandomizedSearchCV(
                base_model, param_dist, n_iter=min(10, _count_params(param_dist)),
                cv=min(3, cv_folds), scoring=_default_scoring(task_type),
                random_state=42, n_jobs=-1, verbose=0,
            )
            search.fit(X_train, y_train)

            train_time = time.time() - start
            y_pred = search.predict(X_test)
            cv_score = search.best_score_

            metrics = _compute_metrics(y_test, y_pred, task_type)

            feature_importance = _get_feature_importance(search.best_estimator_, X.columns, task_type)

            results.append({
                "name": name,
                "model": search.best_estimator_,
                "best_params": search.best_params_,
                "cv_score": round(float(cv_score), 4),
                "metrics": metrics,
                "feature_importance": feature_importance,
                "training_time": round(train_time, 2),
            })
        except Exception as e:
            results.append({"name": name, "model": None, "error": str(e)})

    successful = [r for r in results if r["model"] is not None]
    if not successful:
        errors = [f"{r['name']}: {r['error']}" for r in results if "error" in r]
        raise RuntimeError(f"No models trained successfully. Errors: {'; '.join(errors)}")

    if task_type == "classification":
        successful.sort(key=lambda r: r["metrics"]["accuracy"], reverse=True)
    else:
        successful.sort(key=lambda r: r["metrics"]["r2"], reverse=True)

    best = successful[0]

    full_pipeline = Pipeline([("preprocessor", preprocessor), ("model", best["model"])]) if preprocessor else best["model"]

    model_filename = f"{model_name_prefix}_{best['name']}.pkl"
    save_path = os.path.join(MODELS_DIR, model_filename)
    joblib.dump(full_pipeline, save_path)

    label_encoder = getattr(y, "attrs", {}).get("label_encoder")
    label_map = None
    if label_encoder is not None:
        label_map = {int(i): str(c) for i, c in enumerate(label_encoder.classes_)}

    metadata = {
        "task_type": task_type,
        "n_classes": n_classes,
        "feature_names": list(X.columns),
        "label_map": label_map,
        "best_params": best["best_params"],
        "cv_score": best["cv_score"],
        "metrics": best["metrics"],
        "feature_importance": best.get("feature_importance"),
        "training_time": best["training_time"],
        "test_size": len(X_test),
        "train_size": len(X_train),
        "total_results": [
            {
                "name": r["name"],
                "cv_score": r.get("cv_score"),
                "metrics": r.get("metrics"),
                "training_time": r.get("training_time"),
            }
            for r in successful
        ],
    }
    metadata_path = save_path.replace(".pkl", "_meta.json")
    import json
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2, default=str)

    return {
        "best_model": best["name"],
        "best_params": best["best_params"],
        "cv_score": best["cv_score"],
        "metrics": best["metrics"],
        "feature_importance": best.get("feature_importance"),
        "training_time": best["training_time"],
        "saved_at": model_filename,
        "task_type": task_type,
        "results": metadata["total_results"],
    }


def _count_params(param_dist):
    count = 1
    for v in param_dist.values():
        count *= len(v)
    return count


def _default_scoring(task_type):
    return "accuracy" if task_type == "classification" else "r2"


def _compute_metrics(y_true, y_pred, task_type):
    metrics = {}
    if task_type == "classification":
        metrics["accuracy"] = round(float(accuracy_score(y_true, y_pred)), 4)
        try:
            metrics["precision"] = round(float(precision_score(y_true, y_pred, average="weighted")), 4)
            metrics["recall"] = round(float(recall_score(y_true, y_pred, average="weighted")), 4)
            metrics["f1"] = round(float(f1_score(y_true, y_pred, average="weighted")), 4)
            cm = confusion_matrix(y_true, y_pred).tolist()
            metrics["confusion_matrix"] = cm
        except Exception:
            pass
    else:
        metrics["mse"] = round(float(mean_squared_error(y_true, y_pred)), 4)
        metrics["rmse"] = round(float(np.sqrt(mean_squared_error(y_true, y_pred))), 4)
        metrics["mae"] = round(float(mean_absolute_error(y_true, y_pred)), 4)
        metrics["r2"] = round(float(r2_score(y_true, y_pred)), 4)
    return metrics


def _get_feature_importance(model, feature_names, task_type):
    if hasattr(model, "feature_importances_"):
        importances = model.feature_importances_
    elif hasattr(model, "coef_"):
        importances = np.abs(model.coef_)
        if importances.ndim > 1:
            importances = importances.mean(axis=0)
    else:
        return None

    if len(importances) != len(feature_names):
        return None

    indices = np.argsort(importances)[::-1]
    return [
        {"feature": feature_names[i], "importance": round(float(importances[i]), 4)}
        for i in indices[:20]
    ]
