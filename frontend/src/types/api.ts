export interface ApiError {
  code: string;
  details?: string;
  field?: string;
}

export interface ApiResponse<T = any> {
  status: 'ok' | 'error';
  data?: T;
  message?: string;
  error?: ApiError;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
}

export interface PaginatedApiResponse<T> extends ApiResponse<PaginatedResponse<T>> {}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'viewer';
  email_verified: boolean;
  avatar_url?: string | null;
  preferences?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  refresh_token: string;
  user: User;
}

export interface Dataset {
  id: string;
  name: string;
  filename: string;
  rows: number;
  columns: number;
  size_bytes: number;
  status: 'uploaded' | 'processing' | 'ready' | 'error';
  created_at: string;
  updated_at: string;
}

export interface DatasetPreview {
  columns: string[];
  rows: Record<string, any>[];
  total: number;
  dtypes: Record<string, string>;
}

export interface DatasetProfile {
  name: string;
  rows: number;
  columns: number;
  column_profiles: ColumnProfile[];
  missing_cells: number;
  duplicate_rows: number;
}

export interface ColumnProfile {
  name: string;
  dtype: string;
  missing: number;
  missing_pct: number;
  unique: number;
  mean?: number;
  std?: number;
  min?: number;
  max?: number;
  q25?: number;
  q50?: number;
  q75?: number;
}

export interface DatasetAnalysis {
  target: string;
  problem_type: 'classification' | 'regression';
  feature_importance: Record<string, number>;
  correlations: Record<string, number>;
  recommendations: string[];
}

export interface Experiment {
  id: string;
  name: string;
  model_name: string;
  algorithm: string;
  dataset_name: string;
  target_column: string;
  status: 'running' | 'completed' | 'failed' | 'queued';
  metrics?: ModelMetrics;
  hyperparameters?: Record<string, any>;
  duration_seconds?: number;
  created_at: string;
  updated_at: string;
}

export interface ModelMetrics {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1_score?: number;
  mae?: number;
  mse?: number;
  rmse?: number;
  r2_score?: number;
  confusion_matrix?: number[][];
}

export interface Model {
  id: string;
  name: string;
  algorithm: string;
  dataset_name: string;
  target_column: string;
  status: 'training' | 'ready' | 'failed' | 'archived';
  metrics?: ModelMetrics;
  version: number;
  size_bytes?: number;
  framework: string;
  experiment_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Deployment {
  id: string;
  model_name: string;
  endpoint_name: string;
  endpoint_url: string;
  status: 'creating' | 'running' | 'stopped' | 'failed';
  model_id: string;
  version: number;
  requests_total: number;
  avg_latency_ms: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'archived' | 'completed';
  tags?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  steps: PipelineStep[];
  schedule?: string;
  is_active: boolean;
  last_run_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PipelineStep {
  id: string;
  type: 'dataset' | 'clean' | 'feature_engineer' | 'train' | 'evaluate' | 'deploy' | 'notify' | 'custom';
  name: string;
  config: Record<string, any>;
}

export interface PipelineRun {
  id: string;
  pipeline_id: string;
  status: 'running' | 'completed' | 'failed';
  started_at: string;
  finished_at?: string;
  error?: string;
  step_results: Record<string, any>;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  last_triggered_at?: string;
  created_at: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  last_used_at?: string;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  role: 'owner' | 'admin' | 'member';
  member_count: number;
  created_at: string;
}

export interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  author: string;
  downloads: number;
  rating: number;
  installed: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  target_type: string;
  details?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'info' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

export interface AuthSession {
  id: string;
  device_info?: string;
  ip_address?: string;
  is_current: boolean;
  last_active_at: string;
  created_at: string;
}

export interface SearchResults {
  users: User[];
  projects: Project[];
  datasets: Dataset[];
  models: Model[];
}

export interface MonitoringMetrics {
  cpu_percent: number;
  memory_percent: number;
  disk_percent: number;
  gpu_utilization?: number;
  requests_per_minute: number;
  active_deployments: number;
}

export interface MonitoringStats {
  total_models: number;
  total_datasets: number;
  total_experiments: number;
  total_predictions: number;
  avg_training_time: number;
  success_rate: number;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  database: 'connected' | 'disconnected';
  disk_usage_pct: number;
  uptime_seconds: number;
  version: string;
}

export interface TrainingJob {
  id: string;
  experiment_name: string;
  dataset_name: string;
  target_column: string;
  algorithm: string;
  status: 'queued' | 'training' | 'completed' | 'failed';
  progress: number;
  eta?: string;
  created_at: string;
}
