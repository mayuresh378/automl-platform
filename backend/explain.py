import os
import json
import joblib
import numpy as np
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "..", "models")
DATASET_DIR = os.path.join(BASE_DIR, "..", "dataset")


def _load_model(name: str):
    path = os.path.join(MODELS_DIR, name)
    if not os.path.exists(path):
        raise FileNotFoundError(f"Model '{name}' not found")
    return joblib.load(path)


def _load_meta(name: str):
    meta_path = os.path.join(MODELS_DIR, name.replace(".pkl", "_meta.json"))
    if os.path.exists(meta_path):
        with open(meta_path) as f:
            return json.load(f)
    return {}


def explain_prediction(model_name: str, input_data: dict = None):
    pipeline = _load_model(model_name)
    meta = _load_meta(model_name)

    # Extract the actual model from pipeline
    model = pipeline
    preprocessor = None
    if hasattr(pipeline, "named_steps"):
        if "preprocessor" in pipeline.named_steps:
            preprocessor = pipeline.named_steps["preprocessor"]
        if "model" in pipeline.named_steps:
            model = pipeline.named_steps["model"]
        elif "classifier" in pipeline.named_steps:
            model = pipeline.named_steps["classifier"]

    feature_names = meta.get("feature_names", [])
    task_type = meta.get("task_type", "classification")

    # Get or create sample input
    if input_data is None and meta.get("sample_input"):
        input_data = meta["sample_input"]

    # Generate prediction explanation
    explanation = {
        "model_name": model_name,
        "task_type": task_type,
        "feature_importance": [],
        "shap_values": [],
        "confidence": None,
        "prediction": None,
        "prediction_label": None,
        "top_features": [],
        "feature_count": len(feature_names),
    }

    # Get feature importances from model
    importances = _get_importances(model, feature_names)
    explanation["feature_importance"] = importances

    # Generate SHAP-like values
    shap_values = _generate_shap_values(model, importances, feature_names)
    explanation["shap_values"] = shap_values

    # Get prediction and confidence for sample input
    if input_data and feature_names:
        try:
            df_in = pd.DataFrame([input_data]) if isinstance(input_data, dict) else pd.DataFrame(input_data)
            # Ensure feature columns match
            for f in feature_names:
                if f not in df_in.columns:
                    df_in[f] = 0
            df_in = df_in[feature_names]

            if hasattr(pipeline, "predict"):
                pred = pipeline.predict(df_in)
                explanation["prediction"] = _fmt(pred[0])

            if hasattr(pipeline, "predict_proba") and task_type == "classification":
                proba = pipeline.predict_proba(df_in)
                probs = proba[0]
                explanation["confidence"] = round(float(max(probs)), 4)
                classes = pipeline.classes_.tolist() if hasattr(pipeline, "classes_") else list(range(len(probs)))
                label_map = meta.get("label_map", {})
                predicted_class = int(pred[0]) if pred is not None else int(np.argmax(probs))
                explanation["prediction_label"] = label_map.get(str(predicted_class), str(predicted_class))
                explanation["probabilities"] = {
                    str(label_map.get(str(c), str(c))): round(float(p), 4)
                    for c, p in zip(classes, probs)
                }
        except Exception:
            pass

    # Top features by absolute shap value
    sorted_shap = sorted(shap_values, key=lambda x: abs(x.get("value", 0)), reverse=True)
    explanation["top_features"] = sorted_shap[:10]

    return explanation


def _get_importances(model, feature_names):
    importances = []
    if hasattr(model, "feature_importances_"):
        fi = model.feature_importances_
        for i, name in enumerate(feature_names):
            if i < len(fi):
                importances.append({
                    "feature": name,
                    "importance": round(float(fi[i]), 4),
                })
    elif hasattr(model, "coef_"):
        coefs = model.coef_
        if coefs.ndim > 1:
            coefs = coefs[0]
        for i, name in enumerate(feature_names):
            if i < len(coefs):
                importances.append({
                    "feature": name,
                    "importance": round(float(coefs[i]), 4),
                })
    # Normalize to [0, 1]
    if importances:
        vals = np.abs([i["importance"] for i in importances])
        vmax = vals.max()
        if vmax > 0:
            for i, imp in enumerate(importances):
                importances[i]["normalized"] = round(float(vals[i] / vmax), 4)
        else:
            for i, imp in enumerate(importances):
                importances[i]["normalized"] = 0.0
        # Sort by importance
        importances.sort(key=lambda x: abs(x["importance"]), reverse=True)
    return importances


def _generate_shap_values(model, importances, feature_names):
    """Generate simulated SHAP values from feature importance or coefficients."""
    if not feature_names:
        return []

    base_value = 0.5

    if importances:
        imp_map = {i["feature"]: i["importance"] for i in importances}
        total_abs = sum(abs(v) for v in imp_map.values())
        if total_abs > 0:
            shap = []
            for name in feature_names:
                raw = imp_map.get(name, 0)
                val = (raw / total_abs) * 0.8
                shap.append({
                    "feature": name,
                    "value": round(float(val), 4),
                    "abs_value": round(float(abs(val)), 4),
                    "direction": "positive" if val >= 0 else "negative",
                })
            return shap

    # Fallback: equal distribution
    n = len(feature_names)
    return [
        {"feature": name, "value": round(0.8 / n, 4), "abs_value": round(0.8 / n, 4), "direction": "positive"}
        for name in feature_names
    ]


def _fmt(v):
    if isinstance(v, (np.integer,)):
        return int(v)
    if isinstance(v, (np.floating,)):
        return float(v)
    if isinstance(v, np.ndarray):
        return v.tolist()
    return v
