import pandas as pd
import numpy as np
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "..", "dataset")


def load_dataset(file_name: str) -> pd.DataFrame:
    file_path = os.path.join(DATASET_DIR, file_name)
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Dataset '{file_name}' not found.")
    return pd.read_csv(file_path)


def get_dataset_path(file_name: str) -> str:
    return os.path.join(DATASET_DIR, file_name)


def profile_dataset(file_name: str) -> dict:
    df = load_dataset(file_name)
    profile = {
        "name": file_name,
        "rows": len(df),
        "columns": len(df.columns),
        "column_details": [],
        "missing_values": 0,
        "missing_pct": 0.0,
        "duplicates": int(df.duplicated().sum()),
        "dtypes": {},
    }

    for col in df.columns:
        col_info = {"name": col, "dtype": str(df[col].dtype)}
        missing = int(df[col].isnull().sum())
        col_info["missing"] = missing
        profile["missing_values"] += missing

        if df[col].dtype in ["int64", "float64"]:
            col_info["mean"] = round(float(df[col].mean()), 2) if df[col].notna().any() else None
            col_info["median"] = round(float(df[col].median()), 2) if df[col].notna().any() else None
            col_info["min"] = round(float(df[col].min()), 2) if df[col].notna().any() else None
            col_info["max"] = round(float(df[col].max()), 2) if df[col].notna().any() else None
            col_info["std"] = round(float(df[col].std()), 2) if df[col].notna().any() else None
            q1 = df[col].quantile(0.25)
            q3 = df[col].quantile(0.75)
            iqr = q3 - q1
            lower = q1 - 1.5 * iqr
            upper = q3 + 1.5 * iqr
            col_info["outliers"] = int(((df[col] < lower) | (df[col] > upper)).sum())
        else:
            col_info["unique_values"] = int(df[col].nunique())
            if df[col].nunique() < 20:
                col_info["top_values"] = df[col].value_counts().head(5).to_dict()

        profile["column_details"].append(col_info)
        profile["dtypes"][col] = str(df[col].dtype)

    profile["missing_pct"] = round(profile["missing_values"] / (profile["rows"] * profile["columns"]) * 100, 2) if profile["columns"] > 0 else 0
    return profile


def clean_dataset(file_name: str, operations: list) -> dict:
    df = load_dataset(file_name)
    applied = []

    for op in operations:
        op_type = op.get("type")
        columns = op.get("columns", [])

        if op_type == "impute_missing":
            strategy = op.get("strategy", "median")
            cols = columns if columns else df.columns
            for col in cols:
                if col in df.columns and df[col].isnull().any():
                    if df[col].dtype in ["int64", "float64"]:
                        if strategy == "median":
                            df[col] = df[col].fillna(df[col].median())
                        elif strategy == "mean":
                            df[col] = df[col].fillna(df[col].mean())
                        elif strategy == "zero":
                            df[col] = df[col].fillna(0)
                    else:
                        df[col] = df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else "unknown")
                    applied.append(f"Imputed missing values in {col} ({strategy})")

        elif op_type == "encode_categorical":
            for col in columns:
                if col in df.columns and df[col].dtype == "object":
                    df = pd.get_dummies(df, columns=[col], drop_first=True)
                    applied.append(f"One-hot encoded {col}")

        elif op_type == "scale_numeric":
            strategy = op.get("strategy", "standard")
            for col in columns:
                if col in df.columns and df[col].dtype in ["int64", "float64"]:
                    if strategy == "standard":
                        df[col] = (df[col] - df[col].mean()) / df[col].std()
                    elif strategy == "minmax":
                        df[col] = (df[col] - df[col].min()) / (df[col].max() - df[col].min())
                    applied.append(f"Scaled {col} ({strategy})")

        elif op_type == "normalize":
            for col in columns:
                if col in df.columns and df[col].dtype in ["int64", "float64"]:
                    mn, mx = df[col].min(), df[col].max()
                    if mx - mn > 0:
                        df[col] = (df[col] - mn) / (mx - mn)
                    applied.append(f"Normalized {col}")

        elif op_type == "standardize":
            for col in columns:
                if col in df.columns and df[col].dtype in ["int64", "float64"]:
                    mean, std = df[col].mean(), df[col].std()
                    if std > 0:
                        df[col] = (df[col] - mean) / std
                    applied.append(f"Standardized {col}")

        elif op_type == "remove_duplicates":
            before = len(df)
            df = df.drop_duplicates()
            removed = before - len(df)
            applied.append(f"Removed {removed} duplicate rows")

        elif op_type == "remove_outliers":
            for col in columns:
                if col in df.columns and df[col].dtype in ["int64", "float64"]:
                    q1 = df[col].quantile(0.25)
                    q3 = df[col].quantile(0.75)
                    iqr = q3 - q1
                    lower = q1 - 1.5 * iqr
                    upper = q3 + 1.5 * iqr
                    before = len(df)
                    df = df[(df[col] >= lower) & (df[col] <= upper)]
                    removed = before - len(df)
                    applied.append(f"Removed {removed} outliers from {col}")

        elif op_type == "feature_selection":
            threshold = op.get("threshold", 0.01)
            numeric_cols = df.select_dtypes(include=["int64", "float64"]).columns
            for col in numeric_cols:
                variance = df[col].var()
                if variance < threshold:
                    df = df.drop(columns=[col])
                    applied.append(f"Dropped low-variance feature {col} (var={variance:.6f})")

    cleaned_name = f"cleaned_{file_name}"
    save_path = os.path.join(DATASET_DIR, cleaned_name)
    df.to_csv(save_path, index=False)

    return {
        "cleaned_file": cleaned_name,
        "rows_after": len(df),
        "columns_after": len(df.columns),
        "applied_operations": applied,
    }


def auto_clean(file_name: str) -> dict:
    df = load_dataset(file_name)
    applied = []
    before_rows = len(df)
    before_cols = len(df.columns)

    # 1. Remove duplicates
    dup_before = len(df)
    df = df.drop_duplicates()
    dup_removed = dup_before - len(df)
    if dup_removed > 0:
        applied.append(f"Removed {dup_removed} duplicate rows")

    # 2. Impute missing values
    for col in df.columns:
        if df[col].isnull().any():
            if df[col].dtype in ["int64", "float64"]:
                df[col] = df[col].fillna(df[col].median())
            else:
                df[col] = df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else "unknown")
            applied.append(f"Imputed missing values in {col}")

    # 3. Encode categorical columns
    cat_cols = df.select_dtypes(include=["object"]).columns.tolist()
    for col in cat_cols:
        df = pd.get_dummies(df, columns=[col], drop_first=True)
        applied.append(f"One-hot encoded {col}")

    # 4. Remove outliers (IQR)
    numeric_cols = df.select_dtypes(include=["int64", "float64"]).columns
    for col in numeric_cols:
        q1 = df[col].quantile(0.25)
        q3 = df[col].quantile(0.75)
        iqr = q3 - q1
        lower = q1 - 1.5 * iqr
        upper = q3 + 1.5 * iqr
        before = len(df)
        df = df[(df[col] >= lower) & (df[col] <= upper)]
        removed = before - len(df)
        if removed > 0:
            applied.append(f"Removed {removed} outliers from {col}")

    # 5. Standardize numeric features
    for col in df.select_dtypes(include=["int64", "float64"]).columns:
        mean, std = df[col].mean(), df[col].std()
        if std > 0:
            df[col] = (df[col] - mean) / std
            applied.append(f"Standardized {col}")

    # 6. Drop low-variance features
    for col in df.select_dtypes(include=["int64", "float64"]).columns:
        if df[col].var() < 0.01:
            df = df.drop(columns=[col])
            applied.append(f"Dropped low-variance feature {col}")

    # Save
    cleaned_name = f"auto_cleaned_{file_name}"
    save_path = os.path.join(DATASET_DIR, cleaned_name)
    df.to_csv(save_path, index=False)

    return {
        "cleaned_file": cleaned_name,
        "rows_before": before_rows,
        "rows_after": len(df),
        "columns_before": before_cols,
        "columns_after": len(df.columns),
        "applied_operations": applied,
        "summary": {
            "duplicates_removed": before_rows - dup_before + dup_removed,
            "missing_imputed": sum(1 for a in applied if a.startswith("Imputed")),
            "categorical_encoded": sum(1 for a in applied if a.startswith("One-hot")),
            "outliers_removed": sum(1 for a in applied if a.startswith("Removed")),
            "features_standardized": sum(1 for a in applied if a.startswith("Standardized")),
            "low_variance_dropped": sum(1 for a in applied if a.startswith("Dropped")),
        },
    }
