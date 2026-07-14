# AutoML Platform API Documentation

*Generated on: 2026-07-14 12:17*

---

| Method | Path | Handler |
|--------|------|---------|
| GET | `/api/v1/activity` | `activity` |
| GET | `/api/v1/admin/stats` | `admin_stats` |
| GET | `/api/v1/admin/users` | `admin_users` |
| POST | `/api/v1/ai/chat` | `ai_chat` |
| GET | `/api/v1/ai/suggestions` | `ai_suggestions` |
| GET | `/api/v1/analytics` | `analytics` |
| GET | `/api/v1/api-keys` | `list_api_keys_api` |
| POST | `/api/v1/api-keys` | `create_api_key_api` |
| DELETE | `/api/v1/api-keys/{key_id}` | `delete_api_key_api` |
| POST | `/api/v1/auth/login` | `auth_login` |
| GET | `/api/v1/auth/me` | `auth_me` |
| POST | `/api/v1/auth/refresh` | `auth_refresh` |
| POST | `/api/v1/auth/register` | `auth_register` |
| POST | `/api/v1/batch-predictions` | `batch_predict` |
| GET | `/api/v1/datasets` | `list_datasets` |
| POST | `/api/v1/datasets` | `upload_dataset` |
| DELETE | `/api/v1/datasets/{name}` | `delete_dataset` |
| GET | `/api/v1/datasets/{name}/analyze` | `dataset_analyze` |
| POST | `/api/v1/datasets/{name}/clean` | `clean` |
| GET | `/api/v1/datasets/{name}/download` | `download_dataset` |
| POST | `/api/v1/datasets/{name}/features/generate` | `generate` |
| GET | `/api/v1/datasets/{name}/features/suggest` | `suggest` |
| GET | `/api/v1/datasets/{name}/preview` | `preview_dataset` |
| GET | `/api/v1/datasets/{name}/profile` | `dataset_profile` |
| GET | `/api/v1/deployments` | `list_deployments_api` |
| POST | `/api/v1/deployments` | `create_deployment_api` |
| DELETE | `/api/v1/deployments/{dep_id}` | `delete_deployment_api` |
| GET | `/api/v1/engine/models` | `get_engine_models` |
| POST | `/api/v1/engine/train` | `run_engine` |
| GET | `/api/v1/experiments` | `list_experiments_api` |
| GET | `/api/v1/health` | `health` |
| GET | `/api/v1/marketplace` | `list_marketplace_api` |
| POST | `/api/v1/marketplace/{item_id}/install` | `install_marketplace_api` |
| GET | `/api/v1/models` | `list_models_api` |
| GET | `/api/v1/models/{name}` | `get_model_detail` |
| DELETE | `/api/v1/models/{name}` | `delete_model` |
| GET | `/api/v1/monitoring/metrics` | `system_metrics` |
| GET | `/api/v1/monitoring/stats` | `live_stats` |
| GET | `/api/v1/pipeline-runs/{run_id}` | `get_run_api` |
| GET | `/api/v1/pipelines` | `list_pipelines_api` |
| POST | `/api/v1/pipelines` | `create_pipeline_api` |
| GET | `/api/v1/pipelines/{pipeline_id}` | `get_pipeline_api` |
| PUT | `/api/v1/pipelines/{pipeline_id}` | `update_pipeline_api` |
| DELETE | `/api/v1/pipelines/{pipeline_id}` | `delete_pipeline_api` |
| POST | `/api/v1/pipelines/{pipeline_id}/run` | `run_pipeline_api` |
| GET | `/api/v1/pipelines/{pipeline_id}/runs` | `list_runs_api` |
| POST | `/api/v1/predictions` | `predict` |
| GET | `/api/v1/projects` | `list_projects_api` |
| POST | `/api/v1/projects` | `create_project_api` |
| GET | `/api/v1/projects/{project_id}` | `get_project_api` |
| PUT | `/api/v1/projects/{project_id}` | `update_project_api` |
| DELETE | `/api/v1/projects/{project_id}` | `delete_project_api` |
| POST | `/api/v1/query` | `run_sql` |
| GET | `/api/v1/search` | `search` |
| GET | `/api/v1/teams` | `list_teams_api` |
| POST | `/api/v1/teams` | `create_team_api` |
| POST | `/api/v1/training` | `train_model` |
| POST | `/api/v1/tuning` | `run_tuning_endpoint` |
| GET | `/api/v1/tuning/params` | `get_tuning_params` |
| GET | `/api/v1/webhooks` | `list_webhooks_api` |
| POST | `/api/v1/webhooks` | `create_webhook_api` |
| DELETE | `/api/v1/webhooks/{webhook_id}` | `delete_webhook_api` |

---

## Endpoint Details


### GET `/api/v1/activity`

**Handler:** `activity`  
**Name:** `activity`  

### GET `/api/v1/admin/stats`

**Handler:** `admin_stats`  
**Name:** `admin_stats`  

### GET `/api/v1/admin/users`

**Handler:** `admin_users`  
**Name:** `admin_users`  

### POST `/api/v1/ai/chat`

**Handler:** `ai_chat`  
**Name:** `ai_chat`  

### GET `/api/v1/ai/suggestions`

**Handler:** `ai_suggestions`  
**Name:** `ai_suggestions`  

### GET `/api/v1/analytics`

**Handler:** `analytics`  
**Name:** `analytics`  

### GET `/api/v1/api-keys`

**Handler:** `list_api_keys_api`  
**Name:** `list_api_keys_api`  

### POST `/api/v1/api-keys`

**Handler:** `create_api_key_api`  
**Name:** `create_api_key_api`  

### DELETE `/api/v1/api-keys/{key_id}`

**Handler:** `delete_api_key_api`  
**Name:** `delete_api_key_api`  

### POST `/api/v1/auth/login`

**Handler:** `auth_login`  
**Name:** `auth_login`  

### GET `/api/v1/auth/me`

**Handler:** `auth_me`  
**Name:** `auth_me`  

### POST `/api/v1/auth/refresh`

**Handler:** `auth_refresh`  
**Name:** `auth_refresh`  

### POST `/api/v1/auth/register`

**Handler:** `auth_register`  
**Name:** `auth_register`  

### POST `/api/v1/batch-predictions`

**Handler:** `batch_predict`  
**Name:** `batch_predict`  

### GET `/api/v1/datasets`

**Handler:** `list_datasets`  
**Name:** `list_datasets`  

### POST `/api/v1/datasets`

**Handler:** `upload_dataset`  
**Name:** `upload_dataset`  

### DELETE `/api/v1/datasets/{name}`

**Handler:** `delete_dataset`  
**Name:** `delete_dataset`  

### GET `/api/v1/datasets/{name}/analyze`

**Handler:** `dataset_analyze`  
**Name:** `dataset_analyze`  

### POST `/api/v1/datasets/{name}/clean`

**Handler:** `clean`  
**Name:** `clean`  

### GET `/api/v1/datasets/{name}/download`

**Handler:** `download_dataset`  
**Name:** `download_dataset`  

### POST `/api/v1/datasets/{name}/features/generate`

**Handler:** `generate`  
**Name:** `generate`  

### GET `/api/v1/datasets/{name}/features/suggest`

**Handler:** `suggest`  
**Name:** `suggest`  

### GET `/api/v1/datasets/{name}/preview`

**Handler:** `preview_dataset`  
**Name:** `preview_dataset`  

### GET `/api/v1/datasets/{name}/profile`

**Handler:** `dataset_profile`  
**Name:** `dataset_profile`  

### GET `/api/v1/deployments`

**Handler:** `list_deployments_api`  
**Name:** `list_deployments_api`  

### POST `/api/v1/deployments`

**Handler:** `create_deployment_api`  
**Name:** `create_deployment_api`  

### DELETE `/api/v1/deployments/{dep_id}`

**Handler:** `delete_deployment_api`  
**Name:** `delete_deployment_api`  

### GET `/api/v1/engine/models`

**Handler:** `get_engine_models`  
**Name:** `get_engine_models`  

### POST `/api/v1/engine/train`

**Handler:** `run_engine`  
**Name:** `run_engine`  

### GET `/api/v1/experiments`

**Handler:** `list_experiments_api`  
**Name:** `list_experiments_api`  

### GET `/api/v1/health`

**Handler:** `health`  
**Name:** `health`  

### GET `/api/v1/marketplace`

**Handler:** `list_marketplace_api`  
**Name:** `list_marketplace_api`  

### POST `/api/v1/marketplace/{item_id}/install`

**Handler:** `install_marketplace_api`  
**Name:** `install_marketplace_api`  

### GET `/api/v1/models`

**Handler:** `list_models_api`  
**Name:** `list_models_api`  

### GET `/api/v1/models/{name}`

**Handler:** `get_model_detail`  
**Name:** `get_model_detail`  

### DELETE `/api/v1/models/{name}`

**Handler:** `delete_model`  
**Name:** `delete_model`  

### GET `/api/v1/monitoring/metrics`

**Handler:** `system_metrics`  
**Name:** `system_metrics`  

### GET `/api/v1/monitoring/stats`

**Handler:** `live_stats`  
**Name:** `live_stats`  

### GET `/api/v1/pipeline-runs/{run_id}`

**Handler:** `get_run_api`  
**Name:** `get_run_api`  

### GET `/api/v1/pipelines`

**Handler:** `list_pipelines_api`  
**Name:** `list_pipelines_api`  

### POST `/api/v1/pipelines`

**Handler:** `create_pipeline_api`  
**Name:** `create_pipeline_api`  

### GET `/api/v1/pipelines/{pipeline_id}`

**Handler:** `get_pipeline_api`  
**Name:** `get_pipeline_api`  

### PUT `/api/v1/pipelines/{pipeline_id}`

**Handler:** `update_pipeline_api`  
**Name:** `update_pipeline_api`  

### DELETE `/api/v1/pipelines/{pipeline_id}`

**Handler:** `delete_pipeline_api`  
**Name:** `delete_pipeline_api`  

### POST `/api/v1/pipelines/{pipeline_id}/run`

**Handler:** `run_pipeline_api`  
**Name:** `run_pipeline_api`  

### GET `/api/v1/pipelines/{pipeline_id}/runs`

**Handler:** `list_runs_api`  
**Name:** `list_runs_api`  

### POST `/api/v1/predictions`

**Handler:** `predict`  
**Name:** `predict`  

### GET `/api/v1/projects`

**Handler:** `list_projects_api`  
**Name:** `list_projects_api`  

### POST `/api/v1/projects`

**Handler:** `create_project_api`  
**Name:** `create_project_api`  

### GET `/api/v1/projects/{project_id}`

**Handler:** `get_project_api`  
**Name:** `get_project_api`  

### PUT `/api/v1/projects/{project_id}`

**Handler:** `update_project_api`  
**Name:** `update_project_api`  

### DELETE `/api/v1/projects/{project_id}`

**Handler:** `delete_project_api`  
**Name:** `delete_project_api`  

### POST `/api/v1/query`

**Handler:** `run_sql`  
**Name:** `run_sql`  

### GET `/api/v1/search`

**Handler:** `search`  
**Name:** `search`  

### GET `/api/v1/teams`

**Handler:** `list_teams_api`  
**Name:** `list_teams_api`  

### POST `/api/v1/teams`

**Handler:** `create_team_api`  
**Name:** `create_team_api`  

### POST `/api/v1/training`

**Handler:** `train_model`  
**Name:** `train_model`  

### POST `/api/v1/tuning`

**Handler:** `run_tuning_endpoint`  
**Name:** `run_tuning_endpoint`  

### GET `/api/v1/tuning/params`

**Handler:** `get_tuning_params`  
**Name:** `get_tuning_params`  

### GET `/api/v1/webhooks`

**Handler:** `list_webhooks_api`  
**Name:** `list_webhooks_api`  

### POST `/api/v1/webhooks`

**Handler:** `create_webhook_api`  
**Name:** `create_webhook_api`  

### DELETE `/api/v1/webhooks/{webhook_id}`

**Handler:** `delete_webhook_api`  
**Name:** `delete_webhook_api`  