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

    # Save cleaned dataset
    cleaned_name = f"cleaned_{file_name}"
    save_path = os.path.join(DATASET_DIR, cleaned_name)
    df.to_csv(save_path, index=False)

    return {
        "cleaned_file": cleaned_name,
        "rows_after": len(df),
        "columns_after": len(df.columns),
        "applied_operations": applied,
    }
