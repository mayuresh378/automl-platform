import { http } from '../../../services/http';

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

export interface FeatureImportanceItem {
  feature: string;
  importance: number;
  normalized: number;
}

export interface LearningCurveData {
  train_sizes: number[];
  train_mean: number[];
  train_std: number[];
  val_mean: number[];
  val_std: number[];
  scoring: string;
  error?: string;
}

export interface ValidationCurveData {
  param_name: string;
  param_range: string[];
  train_mean: number[];
  train_std: number[];
  val_mean: number[];
  val_std: number[];
  scoring: string;
  error?: string;
}

export interface ResidualPlotData {
  predicted: number[];
  residuals: number[];
  actual: number[];
  mean_residual: number;
  std_residual: number;
}

export interface PredictionDistributionData {
  type: 'classification' | 'regression';
  predictions: { label: string; count: number; pct: number }[] | number[];
  actual?: number[];
  total?: number;
  mean?: number;
  std?: number;
  min?: number;
  max?: number;
}

export interface ComprehensiveEvaluation {
  model_name: string;
  task_type: string;
  feature_names: string[];
  train_size: number;
  test_size: number;
  confusion_matrix: ConfusionMatrixData | null;
  roc_curve: RocCurveData | null;
  pr_curve: PrCurveData | null;
  feature_importance: FeatureImportanceItem[];
  learning_curve: LearningCurveData;
  validation_curve: ValidationCurveData;
  residual_plot: ResidualPlotData | null;
  prediction_distribution: PredictionDistributionData;
}

export const evaluationService = {
  comprehensive: (modelName: string, fileName: string, targetColumn: string) => {
    const form = new FormData();
    form.append('file_name', fileName);
    form.append('target_column', targetColumn);
    return http.post<ComprehensiveEvaluation>(`/models/${encodeURIComponent(modelName)}/evaluate-all`, form);
  },
};
