import os
import json
import re
import pandas as pd
from datetime import datetime
from sklearn.preprocessing import LabelEncoder

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "..", "dataset")
MODELS_DIR = os.path.join(BASE_DIR, "..", "models")
EXPERIMENTS_FILE = os.path.join(BASE_DIR, "experiments.json")


def load_json(path):
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)
    return []


def load_experiments():
    return load_json(EXPERIMENTS_FILE)


def list_datasets():
    files = []
    for f in os.listdir(DATASET_DIR):
        if f.endswith((".csv", ".xlsx", ".parquet", ".json")):
            fpath = os.path.join(DATASET_DIR, f)
            try:
                df = pd.read_csv(fpath) if f.endswith(".csv") else pd.DataFrame()
                files.append({
                    "name": f,
                    "rows": len(df),
                    "columns": list(df.columns),
                    "dtypes": {c: str(dt) for c, dt in df.dtypes.items()},
                    "size_kb": round(os.path.getsize(fpath) / 1024, 1),
                })
            except Exception:
                pass
    return files


def profile_dataset_for_ai(name):
    fpath = os.path.join(DATASET_DIR, name)
    if not os.path.exists(fpath):
        return None
    df = pd.read_csv(fpath)
    profile = {
        "name": name,
        "rows": len(df),
        "columns": len(df.columns),
        "column_details": [],
        "missing_summary": {},
    }
    missing_any = 0
    for c in df.columns:
        nulls = int(df[c].isna().sum())
        dtype = str(df[c].dtype)
        info = {"name": c, "dtype": dtype, "missing": nulls, "missing_pct": round(nulls / len(df) * 100, 1)}
        if df[c].dtype in ("int64", "float64"):
            info["mean"] = round(float(df[c].mean()), 2) if nulls < len(df) else None
            info["min"] = round(float(df[c].min()), 2) if nulls < len(df) else None
            info["max"] = round(float(df[c].max()), 2) if nulls < len(df) else None
            info["unique"] = int(df[c].nunique())
        elif df[c].dtype.name in ("object", "str", "category"):
            info["unique"] = int(df[c].nunique())
            info["top_values"] = df[c].value_counts().head(5).to_dict()
        profile["column_details"].append(info)
        if nulls > 0:
            missing_any += 1
    profile["missing_summary"] = {
        "columns_with_missing": missing_any,
        "total_missing_cells": int(df.isna().sum().sum()),
    }
    try:
        from cleaning import suggest_cleaning
        profile["cleaning_suggestions"] = suggest_cleaning(name)
    except Exception:
        profile["cleaning_suggestions"] = []
    return profile


def recommend_model(experiments, datasets):
    """Recommend what to do next based on actual state."""
    lines = []
    if not datasets:
        lines.append("You haven't uploaded any datasets yet. Start by uploading a CSV or Excel file from the **Datasets** page.")
        return lines

    lines.append(f"You have **{len(datasets)} dataset(s)** available:")
    for d in datasets[:3]:
        lines.append(f"- **{d['name']}** — {d['rows']} rows, {len(d['columns'])} columns")

    if experiments:
        successful = [e for e in experiments if e.get("status") == "success"]
        if successful:
            best = max(successful, key=lambda e: e.get("cv_score", 0))
            lines.append(f"\nYour best run so far: **{best['name']}** (score: {best['cv_score']}) on **{best['dataset']}**")
            lines.append(f"Check the **Models** page to deploy it, or try **Training** with a different target column.")

    if len(datasets) == 1 and not experiments:
        d = datasets[0]
        numeric_cols = [c for c, t in d.get("dtypes", {}).items() if "float" in t or "int" in t]
        text_cols = [c for c, t in d.get("dtypes", {}).items() if "object" in t or "str" in t]
        lines.append(f"\n**{d['name']}** has {len(numeric_cols)} numeric and {len(text_cols)} text columns.")
        if numeric_cols:
            target_hint = numeric_cols[-1] if len(numeric_cols) > 1 else numeric_cols[0]
            lines.append(f"Try training with **{target_hint}** as the target column — it looks like a good candidate.")
        if text_cols:
            lines.append(f"Columns like {', '.join(text_cols[:3])} could be good classification targets.")
    return lines


def answer_question(question: str) -> str:
    question_lower = question.lower().strip()
    datasets = list_datasets()
    experiments = load_experiments()

    # Dataset listing
    if re.search(r"(what|list|show).*(dataset|csv|file|data)", question_lower) and not re.search(r"(profile|clean|feature)", question_lower):
        if not datasets:
            return "No datasets uploaded yet. Head to the **Datasets** page to upload one."
        lines = ["Here are your datasets:\n"]
        for d in datasets:
            kinds = []
            for c, t in d.get("dtypes", {}).items():
                if "float" in t or "int" in t:
                    kinds.append("numeric")
                    break
            for c, t in d.get("dtypes", {}).items():
                if "object" in t or "str" in t:
                    kinds.append("text")
                    break
            lines.append(f"- **{d['name']}** — {d['rows']} rows × {len(d['columns'])} columns ({', '.join(kinds) if kinds else 'mixed'})")
            lines.append(f"  Columns: {', '.join(d['columns'][:8])}{'...' if len(d['columns']) > 8 else ''}")
        return "\n".join(lines)

    # Model recommendation
    if re.search(r"(which|what|recommend|best).*(model|algorithm|estimator)", question_lower) or \
       re.search(r"(model|algorithm).*(should|recommend|suggest|best)", question_lower) or \
       re.search(r"what.*(use|train)", question_lower):
        if not datasets:
            return "Upload a dataset first from the **Datasets** page, then I can recommend the best model for your data."
        if not experiments:
            d = datasets[0]
            text_cols = [c for c, t in d.get("dtypes", {}).items() if "object" in t or "str" in t]
            has_text_target = len(text_cols) > 0
            lines = [f"Based on **{d['name']}** ({d['rows']} rows, {len(d['columns'])} columns):\n"]
            if has_text_target:
                lines.append("This looks like a **classification** task. I recommend starting with:")
                lines.append("- **LogisticRegression** — fast, interpretable baseline")
                lines.append("- **RandomForest** — handles non-linearity well")
                lines.append("- **GradientBoosting** — often the best accuracy")
                lines.append("\nGo to the **Training** page, select a text/category column as target, and run a few models.")
            else:
                lines.append("This looks like a **regression** task (numeric target). I recommend:")
                lines.append("- **Ridge / Lasso** — fast linear baselines")
                lines.append("- **RandomForest** — great out of the box")
                lines.append("- **GradientBoosting** — top accuracy with tuning")
                lines.append("\nGo to the **Training** page and pick a numeric column as target.")
            return "\n".join(lines)
        else:
            successful = [e for e in experiments if e.get("status") == "success"]
            if successful:
                best = max(successful, key=lambda e: e.get("cv_score", 0))
                return (
                    f"Your best model so far is **{best['model']}** (score: {best['cv_score']}) "
                    f"trained on **{best['dataset']}** targeting **{best['target']}**.\n\n"
                    f"You can deploy it from the **Models** page or try other algorithms via **Training**."
                )

    # Explain performance / accuracy drop
    if re.search(r"(explain|why|drop|performance|accuracy)", question_lower) and \
       re.search(r"(model|experiment|run|train|accuracy|score)", question_lower):
        if not experiments:
            return "No experiments completed yet. Run a training job first, then I can analyze the results."
        successful = [e for e in experiments if e.get("status") == "success"]
        if successful:
            grouped = {}
            for e in successful:
                key = (e.get("dataset"), e.get("target"))
                grouped.setdefault(key, []).append(e)
            lines = []
            for (ds, tg), group in grouped.items():
                if len(group) > 1:
                    scores = [(e.get("cv_score", 0), e.get("model", "?"), e.get("training_time", 0)) for e in group]
                    best_s = max(scores, key=lambda x: x[0])
                    lines.append(f"For **{ds}** targeting **{tg}**:")
                    for s, m, t in sorted(scores, key=lambda x: x[0], reverse=True):
                        marker = "⭐" if s == best_s[0] else ""
                        lines.append(f"  {marker} **{m}** — score {s} (took {t}s)")
                    if len(scores) > 1:
                        spread = round(max(s[0] for s in scores) - min(s[0] for s in scores), 4)
                        if spread > 0.05:
                            lines.append(f"  *Notice: {spread} spread between best and worst — consider hyperparameter tuning.*")
            if not lines:
                lines.append("Only one experiment per dataset so far. Run more to compare performance.")
            return "\n".join(lines)
        return "No successful experiments to analyze."

    # Suggest features
    if re.search(r"(feature|column|engineer|transform)", question_lower) and \
       re.search(r"(suggest|recommend|generate|create|engineer)", question_lower):
        if not datasets:
            return "Upload a dataset first, then I can suggest feature engineering steps."
        name = None
        for d in datasets:
            if d["name"] in question or d["name"].split(".")[0] in question:
                name = d["name"]
                break
        if not name:
            name = datasets[0]["name"]
        profile = profile_dataset_for_ai(name)
        if not profile:
            return f"Could not load {name}."
        lines = [f"Feature suggestions for **{name}**:\n"]
        numeric = [c for c in profile["column_details"] if c["dtype"] in ("int64", "float64")]
        text = [c for c in profile["column_details"] if c["dtype"] in ("object", "str", "category")]
        if len(numeric) >= 2:
            pairs = [f"{numeric[i]['name']} × {numeric[j]['name']}" for i in range(min(3, len(numeric))) for j in range(i+1, min(4, len(numeric)))]
            lines.append(f"- **Interaction features**: {', '.join(pairs[:3])}")
            lines.append("- **Polynomial features**: squares of key numeric columns")
        if len(numeric) >= 1:
            lines.append("- **Binned features**: discretize continuous columns into categories")
        if len(numeric) >= 2:
            lines.append(f"- **Ratios**: {numeric[0]['name']} / {numeric[1]['name']} (if no zeros)")
        if text:
            encoded = [c["name"] for c in text]
            lines.append(f"- **Text features**: {', '.join(encoded)} — apply one-hot encoding or target encoding")
        lines.append(f"\nGo to **Feature Engineering** page to apply these or use AI-suggested transforms.")
        return "\n".join(lines)

    # Suggest cleaning
    if re.search(r"(clean|cleaning|missing|null|impute)", question_lower):
        if not datasets:
            return "Upload a dataset first to get cleaning recommendations."
        name = None
        for d in datasets:
            if d["name"] in question or d["name"].split(".")[0] in question:
                name = d["name"]
                break
        if not name:
            name = datasets[0]["name"]
        profile = profile_dataset_for_ai(name)
        if not profile:
            return f"Could not load {name}."
        lines = [f"Data quality report for **{name}**:\n"]
        missing_cols = [c for c in profile["column_details"] if c["missing"] > 0]
        if missing_cols:
            lines.append(f"**{len(missing_cols)} column(s)** have missing values:")
            for c in missing_cols:
                lines.append(f"- **{c['name']}**: {c['missing']} missing ({c['missing_pct']}%) — impute with median/mode")
        else:
            lines.append("No missing values found. ✅")
        low_cardinality = [c for c in profile["column_details"] if c.get("unique", 999) <= 2 and c["dtype"] in ("object", "str", "category")]
        if low_cardinality:
            lines.append(f"\n**{len(low_cardinality)} binary column(s)** detected — keep as-is for modeling.")
        if profile.get("cleaning_suggestions"):
            lines.append("\nRecommended cleaning actions:")
            for s in profile["cleaning_suggestions"]:
                lines.append(f"- {s}")
        lines.append(f"\nGo to **Data Cleaning** page to apply these operations.")
        return "\n".join(lines)

    # General stats / what can you do
    if re.search(r"(hello|hi|hey|what can you do|help|capabilities)", question_lower):
        lines = [
            "I'm your AutoML AI Assistant. Here's what I can help with:\n",
            "- **📊 Dataset analysis** — ask \"what datasets do I have?\" or \"profile my data\"",
            "- **🤖 Model recommendations** — ask \"which model should I use?\"",
            "- **📈 Performance analysis** — ask \"explain my experiment results\"",
            "- **🔧 Feature engineering** — ask \"suggest features for my dataset\"",
            "- **🧹 Data cleaning** — ask \"how should I clean my data?\"",
            "- **🚀 Deployment** — ask \"how do I deploy a model?\"\n",
            "Try one of the suggestions below or type your own question!"
        ]
        return "\n".join(lines)

    # Fallback: give contextual help
    lines = [f"I understand you're asking about \"{question}\". Here's what I know:\n"]
    if datasets:
        lines.append(f"You have **{len(datasets)} dataset(s)** loaded.")
        lines.append(f"There are **{len(experiments)} experiment(s)** completed.")
        successful = [e for e in experiments if e.get("status") == "success"]
        if successful:
            best = max(successful, key=lambda e: e.get("cv_score", 0))
            lines.append(f"Your best model is **{best['model']}** with score **{best['cv_score']}**.")
    else:
        lines.append("You haven't uploaded any data yet. Start from the **Datasets** page!")
    lines.append("\n💡 Tip: Try asking more specifically — e.g. \"recommend a model for my dataset\" or \"show me my experiments\".")

    return "\n".join(lines)
