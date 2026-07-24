import { http } from '../../../services/http';

export interface FeatureImportance {
  feature: string;
  importance: number;
  normalized: number;
}

export interface ShapValue {
  feature: string;
  value: number;
  abs_value: number;
  direction: 'positive' | 'negative';
}

export interface ConfusionMatrixData {
  matrix: number[][];
  labels: string[];
}

export interface RocCurveData {
  fpr: number[];
  tpr: number[];
  auc: number;
  per_class?: { label: string; fpr: number[]; tpr: number[]; auc: number }[];
  macro_auc?: number;
}

export interface PrCurveData {
  precision: number[];
  recall: number[];
  average_precision: number;
  per_class?: { label: string; precision: number[]; recall: number[]; ap: number }[];
  macro_ap?: number;
}

export interface PredictionPreview {
  actual: string;
  predicted: string;
  top_classes: { label: string; probability: number }[];
}

export interface ModelEvaluation {
  model_name: string;
  task_type: string;
  feature_names: string[];
  feature_importance: FeatureImportance[];
  shap_values: ShapValue[];
  confusion_matrix: ConfusionMatrixData | null;
  roc_curve: RocCurveData | null;
  pr_curve: PrCurveData | null;
  prediction_preview: PredictionPreview[];
  test_size: number;
  train_size: number;
}

export const explainService = {
  evaluate: (modelName: string, fileName: string, targetColumn: string) => {
    const form = new FormData();
    form.append('file_name', fileName);
    form.append('target_column', targetColumn);
    return http.post<ModelEvaluation>(`/models/${encodeURIComponent(modelName)}/evaluation`, form);
  },
};
