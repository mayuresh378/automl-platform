import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from crud import list_experiments, list_models, list_dataset_records


def dashboard_analytics(db: Session, days: int = 30) -> dict:
    experiments = list_experiments(db)
    models = list_models(db)
    datasets = list_dataset_records(db)

    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(days=days)

    recent_exps = [e for e in experiments if e.created_at and e.created_at >= cutoff]

    daily_counts: dict = {}
    for e in recent_exps:
        day = e.created_at.strftime("%Y-%m-%d") if e.created_at else "unknown"
        daily_counts[day] = daily_counts.get(day, 0) + 1

    training_trends = sorted(
        [{"date": d, "count": c} for d, c in daily_counts.items()],
        key=lambda x: x["date"]
    )

    model_scores = [
        {"name": e.name or f"Exp-{e.id[:8]}", "model": e.model or "unknown", "score": e.cv_score or 0, "time": e.training_time or 0}
        for e in experiments if e.cv_score is not None
    ]

    accuracy_trends = [
        {"date": e.created_at.strftime("%Y-%m-%d") if e.created_at else "unknown", "score": (e.cv_score or 0) * 100}
        for e in experiments if e.cv_score is not None
    ]

    model_type_counts: dict = {}
    for m in models:
        mt = m.model_type or "unknown"
        model_type_counts[mt] = model_type_counts.get(mt, 0) + 1
    model_distribution = [{"name": k, "count": v} for k, v in sorted(model_type_counts.items(), key=lambda x: -x[1])]

    total_training_hours = sum((e.training_time or 0) for e in experiments) / 3600
    total_storage_mb = sum((d.file_size_kb or 0) for d in datasets) / 1024

    return {
        "training_trends": training_trends,
        "model_scores": model_scores,
        "accuracy_trends": accuracy_trends,
        "model_distribution": model_distribution,
        "total_experiments": len(experiments),
        "total_models": len(models),
        "total_datasets": len(datasets),
        "total_training_hours": round(total_training_hours, 2),
        "total_storage_mb": round(total_storage_mb, 2),
        "success_rate": round(
            sum(1 for e in experiments if e.status == "success") / max(len(experiments), 1) * 100, 1
        ),
    }
