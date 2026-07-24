import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, learning_curve, validation_curve
from sklearn.metrics import confusion_matrix, roc_curve, auc, precision_recall_curve, average_precision_score
from sklearn.pipeline import Pipeline
from preprocess import auto_preprocess

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "..", "models")


def _load_model(name):
    path = os.path.join(MODELS_DIR, name)
    if not os.path.exists(path):
        raise FileNotFoundError(f"Model '{name}' not found")
    return joblib.load(path)


def _load_meta(name):
    meta_path = os.path.join(MODELS_DIR, name.replace(".pkl", "_meta.json"))
    if os.path.exists(meta_path):
        with open(meta_path) as f:
            return json.load(f)
    return {}


def _extract_model(pipeline):
    model = pipeline
    preprocessor = None
    if hasattr(pipeline, "named_steps"):
        if "preprocessor" in pipeline.named_steps:
            preprocessor = pipeline.named_steps["preprocessor"]
        for key in ("model", "classifier", "estimator", "regressor"):
            if key in pipeline.named_steps:
                model = pipeline.named_steps[key]
                break
    return model, preprocessor


def _fmt(v):
    if isinstance(v, (np.integer,)):
        return int(v)
    if isinstance(v, (np.floating,)):
        return round(float(v), 6)
    if isinstance(v, np.ndarray):
        return v.tolist()
    return v


def compute_confusion_matrix(model_obj, X_test, y_test, task_type, meta):
    if task_type != "classification":
        return None
    y_test_list = y_test.tolist() if hasattr(y_test, "tolist") else list(y_test)
    y_pred = model_obj.predict(X_test)
    y_pred_list = y_pred.tolist() if hasattr(y_pred, "tolist") else list(y_pred)
    labels = sorted(list(set(y_test_list + y_pred_list)))
    label_map = meta.get("label_map", {})
    str_labels = [label_map.get(str(l), str(l)) for l in labels]
    cm = confusion_matrix(y_test_list, y_pred_list, labels=labels)
    return {"matrix": cm.tolist(), "labels": str_labels}


def compute_roc_curve(model_obj, X_test, y_test, task_type, meta):
    y_test_list = y_test.tolist() if hasattr(y_test, "tolist") else list(y_test)
    y_pred = model_obj.predict(X_test)
    y_pred_list = y_pred.tolist() if hasattr(y_pred, "tolist") else list(y_pred)
    labels = sorted(list(set(y_test_list + y_pred_list)))
    label_map = meta.get("label_map", {})
    str_labels = [label_map.get(str(l), str(l)) for l in labels]

    if task_type != "classification" or not hasattr(model_obj, "predict_proba"):
        return None

    y_proba = model_obj.predict_proba(X_test)

    if len(labels) == 2:
        fpr, tpr, _ = roc_curve(y_test_list, y_proba[:, 1], pos_label=labels[1])
        return {
            "fpr": [round(float(x), 4) for x in fpr],
            "tpr": [round(float(x), 4) for x in tpr],
            "auc": round(float(auc(fpr, tpr)), 4),
        }
    else:
        from sklearn.preprocessing import label_binarize
        y_test_bin = label_binarize(y_test_list, classes=labels)
        per_class_roc = []
        all_auc_vals = []
        for ci in range(len(labels)):
            fpr_i, tpr_i, _ = roc_curve(y_test_bin[:, ci], y_proba[:, ci])
            auc_i = round(float(auc(fpr_i, tpr_i)), 4)
            all_auc_vals.append(auc_i)
            per_class_roc.append({
                "label": str_labels[ci],
                "fpr": [round(float(x), 4) for x in fpr_i],
                "tpr": [round(float(x), 4) for x in tpr_i],
                "auc": auc_i,
            })
        return {"per_class": per_class_roc, "macro_auc": round(float(np.mean(all_auc_vals)), 4)}


def compute_pr_curve(model_obj, X_test, y_test, task_type, meta):
    y_test_list = y_test.tolist() if hasattr(y_test, "tolist") else list(y_test)
    y_pred = model_obj.predict(X_test)
    y_pred_list = y_pred.tolist() if hasattr(y_pred, "tolist") else list(y_pred)
    labels = sorted(list(set(y_test_list + y_pred_list)))
    label_map = meta.get("label_map", {})
    str_labels = [label_map.get(str(l), str(l)) for l in labels]

    if task_type != "classification" or not hasattr(model_obj, "predict_proba"):
        return None

    y_proba = model_obj.predict_proba(X_test)

    if len(labels) == 2:
        prec_arr, rec_arr, _ = precision_recall_curve(y_test_list, y_proba[:, 1], pos_label=labels[1])
        return {
            "precision": [round(float(x), 4) for x in prec_arr],
            "recall": [round(float(x), 4) for x in rec_arr],
            "average_precision": round(float(average_precision_score(y_test_list, y_proba[:, 1])), 4),
        }
    else:
        from sklearn.preprocessing import label_binarize
        y_test_bin = label_binarize(y_test_list, classes=labels)
        per_class_pr = []
        all_ap_vals = []
        for ci in range(len(labels)):
            p_i, r_i, _ = precision_recall_curve(y_test_bin[:, ci], y_proba[:, ci])
            ap_i = round(float(average_precision_score(y_test_bin[:, ci], y_proba[:, ci])), 4)
            all_ap_vals.append(ap_i)
            per_class_pr.append({
                "label": str_labels[ci],
                "precision": [round(float(x), 4) for x in p_i],
                "recall": [round(float(x), 4) for x in r_i],
                "ap": ap_i,
            })
        return {"per_class": per_class_pr, "macro_ap": round(float(np.mean(all_ap_vals)), 4)}


def compute_learning_curve(pipeline, X, y, task_type):
    try:
        train_sizes_abs, train_scores, val_scores = learning_curve(
            pipeline, X, y,
            train_sizes=np.linspace(0.1, 1.0, 10),
            cv=min(5, len(y) // 2) if len(y) >= 10 else 2,
            scoring="accuracy" if task_type == "classification" else "r2",
            n_jobs=-1,
            random_state=42,
        )
        return {
            "train_sizes": [int(x) for x in train_sizes_abs],
            "train_mean": [round(float(x), 4) for x in np.mean(train_scores, axis=1)],
            "train_std": [round(float(x), 4) for x in np.std(train_scores, axis=1)],
            "val_mean": [round(float(x), 4) for x in np.mean(val_scores, axis=1)],
            "val_std": [round(float(x), 4) for x in np.std(val_scores, axis=1)],
            "scoring": "accuracy" if task_type == "classification" else "r2",
        }
    except Exception as e:
        return {"error": str(e)}


def compute_validation_curve(pipeline, X, y, task_type, estimator):
    param_name = None
    param_range = None

    if hasattr(estimator, "n_estimators"):
        param_name = "n_estimators"
        param_range = [10, 25, 50, 75, 100, 150, 200]
    elif hasattr(estimator, "C"):
        param_name = "estimator__C" if hasattr(pipeline, "named_steps") else "C"
        param_range = [0.01, 0.1, 1, 10, 100]
    elif hasattr(estimator, "max_depth"):
        param_name = "estimator__max_depth" if hasattr(pipeline, "named_steps") else "max_depth"
        param_range = [2, 3, 5, 7, 10, 15, None]
    elif hasattr(estimator, "n_neighbors"):
        param_name = "estimator__n_neighbors" if hasattr(pipeline, "named_steps") else "n_neighbors"
        param_range = [3, 5, 7, 9, 11, 15, 21]

    if param_name is None:
        return {"error": "No tunable hyperparameter found for validation curve"}

    try:
        # Filter out None values for param_range
        valid_range = [p for p in param_range if p is not None]
        if len(valid_range) < 2:
            return {"error": "Insufficient parameter range for validation curve"}

        # For max_depth with None, use a special handling
        if param_name.endswith("max_depth"):
            valid_range = [2, 3, 5, 7, 10, 15]

        train_scores, val_scores = validation_curve(
            pipeline, X, y,
            param_name=param_name,
            param_range=valid_range,
            cv=min(5, len(y) // 2) if len(y) >= 10 else 2,
            scoring="accuracy" if task_type == "classification" else "r2",
            n_jobs=-1,
        )
        return {
            "param_name": param_name.split("__")[-1] if "__" in param_name else param_name,
            "param_range": [str(p) for p in valid_range],
            "train_mean": [round(float(x), 4) for x in np.mean(train_scores, axis=1)],
            "train_std": [round(float(x), 4) for x in np.std(train_scores, axis=1)],
            "val_mean": [round(float(x), 4) for x in np.mean(val_scores, axis=1)],
            "val_std": [round(float(x), 4) for x in np.std(val_scores, axis=1)],
            "scoring": "accuracy" if task_type == "classification" else "r2",
        }
    except Exception as e:
        return {"error": str(e)}


def compute_residual_plot(model_obj, X_test, y_test, task_type):
    if task_type == "classification":
        return None

    y_pred = model_obj.predict(X_test)
    residuals = y_test - y_pred

    indices = np.random.choice(len(residuals), min(500, len(residuals)), replace=False) if len(residuals) > 500 else np.arange(len(residuals))

    return {
        "predicted": [round(float(y_pred[i]), 4) for i in indices],
        "residuals": [round(float(residuals[i]), 4) for i in indices],
        "actual": [round(float(y_test[i]), 4) for i in indices],
        "mean_residual": round(float(np.mean(residuals)), 4),
        "std_residual": round(float(np.std(residuals)), 4),
    }


def compute_prediction_distribution(y_test, y_pred, task_type):
    if task_type == "classification":
        unique, counts = np.unique(y_pred, return_counts=True)
        total = len(y_pred)
        return {
            "type": "classification",
            "predictions": [{"label": str(u), "count": int(c), "pct": round(float(c / total) * 100, 1)} for u, c in zip(unique, counts)],
            "total": total,
        }
    else:
        return {
            "type": "regression",
            "predictions": [round(float(x), 4) for x in y_pred[:500]],
            "actual": [round(float(x), 4) for x in y_test[:500]],
            "mean": round(float(np.mean(y_pred)), 4),
            "std": round(float(np.std(y_pred)), 4),
            "min": round(float(np.min(y_pred)), 4),
            "max": round(float(np.max(y_pred)), 4),
        }


def compute_feature_importance(model, feature_names):
    importances = []
    importances_arr = None
    if hasattr(model, "feature_importances_"):
        importances_arr = model.feature_importances_
    elif hasattr(model, "coef_"):
        coefs = model.coef_
        importances_arr = coefs[0] if coefs.ndim > 1 else coefs

    if importances_arr is not None and feature_names:
        abs_imp = np.abs(importances_arr)
        vmax = abs_imp.max()
        for i, fname in enumerate(feature_names):
            if i < len(importances_arr):
                importances.append({
                    "feature": fname,
                    "importance": round(float(importances_arr[i]), 6),
                    "normalized": round(float(abs_imp[i] / vmax), 4) if vmax > 0 else 0,
                })
        importances.sort(key=lambda x: abs(x["importance"]), reverse=True)
    return importances


def evaluate_model_comprehensive(model_name, file_name, target_column):
    pipeline = _load_model(model_name)
    meta = _load_meta(model_name)
    model, preprocessor = _extract_model(pipeline)
    task_type = meta.get("task_type", "classification")
    feature_names = meta.get("feature_names", [])

    preprocess_result = auto_preprocess(file_name, target_column, task_type)
    X = preprocess_result["X"]
    y = preprocess_result["y"]
    preprocessor_from_data = preprocess_result["preprocessor"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42,
        stratify=y if task_type == "classification" else None,
    )

    model_obj = pipeline
    if not isinstance(pipeline, Pipeline):
        model_obj = Pipeline([("preprocessor", preprocessor_from_data), ("model", pipeline)])

    try:
        model_obj.fit(X_train, y_train)
    except Exception:
        pass

    y_pred = model_obj.predict(X_test)

    result = {
        "model_name": model_name,
        "task_type": task_type,
        "feature_names": feature_names,
        "train_size": len(X_train),
        "test_size": len(X_test),
        "confusion_matrix": compute_confusion_matrix(model_obj, X_test, y_test, task_type, meta),
        "roc_curve": compute_roc_curve(model_obj, X_test, y_test, task_type, meta),
        "pr_curve": compute_pr_curve(model_obj, X_test, y_test, task_type, meta),
        "feature_importance": compute_feature_importance(model, feature_names),
        "learning_curve": compute_learning_curve(model_obj, X, y, task_type),
        "validation_curve": compute_validation_curve(model_obj, X, y, task_type, model),
        "residual_plot": compute_residual_plot(model_obj, X_test, y_test, task_type),
        "prediction_distribution": compute_prediction_distribution(y_test, y_pred, task_type),
    }

    return result
