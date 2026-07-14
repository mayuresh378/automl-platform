-- CreateTable
CREATE TABLE "Migration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "applied_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checksum" TEXT
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "verification_token" TEXT,
    "reset_token" TEXT,
    "reset_token_expiry" DATETIME,
    "google_id" TEXT,
    "avatar_url" TEXT,
    "preferences" TEXT DEFAULT '{}',
    "mfa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "deleted_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joined_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'development',
    "notes" TEXT,
    "tags" TEXT DEFAULT '[]',
    "deleted_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "user_id" TEXT,
    CONSTRAINT "projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "key_prefix" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "last_used_at" DATETIME,
    "expires_at" DATETIME,
    "deleted_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "api_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "experiments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "task_type" TEXT,
    "dataset" TEXT,
    "target" TEXT,
    "cv_score" REAL,
    "metrics" TEXT DEFAULT '{}',
    "training_time" REAL,
    "total_time" REAL,
    "memory_usage" REAL,
    "cpu_usage" REAL,
    "status" TEXT NOT NULL DEFAULT 'success',
    "params" TEXT DEFAULT '{}',
    "feature_importance" TEXT,
    "confusion_matrix" TEXT,
    "run_at" DATETIME,
    "deleted_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,
    "project_id" TEXT,
    CONSTRAINT "experiments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "experiments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "model_registry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "model_type" TEXT,
    "task_type" TEXT,
    "framework" TEXT NOT NULL DEFAULT 'sklearn',
    "file_path" TEXT,
    "file_size_kb" REAL,
    "cv_score" REAL,
    "metrics" TEXT DEFAULT '{}',
    "params" TEXT DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'staging',
    "tags" TEXT DEFAULT '[]',
    "description" TEXT,
    "deleted_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "experiment_id" TEXT,
    "user_id" TEXT,
    "project_id" TEXT,
    CONSTRAINT "model_registry_experiment_id_fkey" FOREIGN KEY ("experiment_id") REFERENCES "experiments" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "model_registry_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "model_registry_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "deployments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "endpoint_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "environment" TEXT NOT NULL DEFAULT 'production',
    "requests_count" INTEGER NOT NULL DEFAULT 0,
    "avg_latency_ms" REAL,
    "config" TEXT DEFAULT '{}',
    "deleted_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "model_id" TEXT,
    "user_id" TEXT,
    "project_id" TEXT,
    CONSTRAINT "deployments_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "model_registry" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "deployments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "deployments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pipelines" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "steps" TEXT DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "schedule" TEXT,
    "deleted_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "user_id" TEXT,
    CONSTRAINT "pipelines_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pipeline_runs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "current_step" TEXT,
    "results" TEXT DEFAULT '{}',
    "error" TEXT,
    "started_at" DATETIME,
    "completed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pipeline_id" TEXT NOT NULL,
    CONSTRAINT "pipeline_runs_pipeline_id_fkey" FOREIGN KEY ("pipeline_id") REFERENCES "pipelines" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "datasets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "original_filename" TEXT,
    "file_path" TEXT,
    "file_size_kb" REAL,
    "rows" INTEGER,
    "columns" TEXT DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'uploaded',
    "description" TEXT,
    "deleted_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "project_id" TEXT,
    "user_id" TEXT,
    CONSTRAINT "datasets_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "datasets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "prediction_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "model_name" TEXT NOT NULL,
    "input_preview" TEXT,
    "prediction" TEXT,
    "confidence" REAL,
    "batch_size" INTEGER NOT NULL DEFAULT 1,
    "latency_ms" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,
    CONSTRAINT "prediction_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "message" TEXT,
    "type" TEXT NOT NULL DEFAULT 'info',
    "category" TEXT NOT NULL DEFAULT 'system',
    "resource_type" TEXT,
    "resource_id" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,
    CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "webhooks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "events" TEXT DEFAULT '[]',
    "secret" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "last_triggered_at" DATETIME,
    "deleted_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "user_id" TEXT,
    CONSTRAINT "webhooks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token_hash" TEXT NOT NULL,
    "refresh_token_hash" TEXT,
    "device_info" TEXT,
    "ip_address" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_used_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "marketplace_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "item_type" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "author" TEXT,
    "tags" TEXT DEFAULT '[]',
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL NOT NULL DEFAULT 0.0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "config" TEXT DEFAULT '{}',
    "deleted_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actor" TEXT,
    "action" TEXT NOT NULL,
    "target" TEXT,
    "resource_type" TEXT,
    "resource_id" TEXT,
    "details" TEXT DEFAULT '{}',
    "ip_address" TEXT,
    "status" TEXT NOT NULL DEFAULT 'success',
    "severity" TEXT NOT NULL DEFAULT 'info',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,
    CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "resource_type" TEXT,
    "resource_id" TEXT,
    "details" TEXT DEFAULT '{}',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,
    CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "teams_slug_key" ON "teams"("slug");

-- CreateIndex
CREATE INDEX "teams_slug_idx" ON "teams"("slug");

-- CreateIndex
CREATE INDEX "teams_created_at_idx" ON "teams"("created_at");

-- CreateIndex
CREATE INDEX "team_members_user_id_idx" ON "team_members"("user_id");

-- CreateIndex
CREATE INDEX "team_members_team_id_idx" ON "team_members"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_user_id_team_id_key" ON "team_members"("user_id", "team_id");

-- CreateIndex
CREATE INDEX "projects_user_id_idx" ON "projects"("user_id");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "projects_created_at_idx" ON "projects"("created_at");

-- CreateIndex
CREATE INDEX "projects_user_id_status_idx" ON "projects"("user_id", "status");

-- CreateIndex
CREATE INDEX "api_keys_user_id_idx" ON "api_keys"("user_id");

-- CreateIndex
CREATE INDEX "api_keys_status_idx" ON "api_keys"("status");

-- CreateIndex
CREATE INDEX "api_keys_key_prefix_idx" ON "api_keys"("key_prefix");

-- CreateIndex
CREATE INDEX "experiments_user_id_idx" ON "experiments"("user_id");

-- CreateIndex
CREATE INDEX "experiments_project_id_idx" ON "experiments"("project_id");

-- CreateIndex
CREATE INDEX "experiments_status_idx" ON "experiments"("status");

-- CreateIndex
CREATE INDEX "experiments_created_at_idx" ON "experiments"("created_at");

-- CreateIndex
CREATE INDEX "experiments_project_id_created_at_idx" ON "experiments"("project_id", "created_at");

-- CreateIndex
CREATE INDEX "model_registry_user_id_idx" ON "model_registry"("user_id");

-- CreateIndex
CREATE INDEX "model_registry_project_id_idx" ON "model_registry"("project_id");

-- CreateIndex
CREATE INDEX "model_registry_experiment_id_idx" ON "model_registry"("experiment_id");

-- CreateIndex
CREATE INDEX "model_registry_status_idx" ON "model_registry"("status");

-- CreateIndex
CREATE INDEX "model_registry_created_at_idx" ON "model_registry"("created_at");

-- CreateIndex
CREATE INDEX "model_registry_model_type_idx" ON "model_registry"("model_type");

-- CreateIndex
CREATE INDEX "deployments_user_id_idx" ON "deployments"("user_id");

-- CreateIndex
CREATE INDEX "deployments_project_id_idx" ON "deployments"("project_id");

-- CreateIndex
CREATE INDEX "deployments_model_id_idx" ON "deployments"("model_id");

-- CreateIndex
CREATE INDEX "deployments_status_idx" ON "deployments"("status");

-- CreateIndex
CREATE INDEX "deployments_environment_idx" ON "deployments"("environment");

-- CreateIndex
CREATE INDEX "deployments_created_at_idx" ON "deployments"("created_at");

-- CreateIndex
CREATE INDEX "pipelines_user_id_idx" ON "pipelines"("user_id");

-- CreateIndex
CREATE INDEX "pipelines_status_idx" ON "pipelines"("status");

-- CreateIndex
CREATE INDEX "pipelines_created_at_idx" ON "pipelines"("created_at");

-- CreateIndex
CREATE INDEX "pipeline_runs_pipeline_id_idx" ON "pipeline_runs"("pipeline_id");

-- CreateIndex
CREATE INDEX "pipeline_runs_status_idx" ON "pipeline_runs"("status");

-- CreateIndex
CREATE INDEX "pipeline_runs_created_at_idx" ON "pipeline_runs"("created_at");

-- CreateIndex
CREATE INDEX "datasets_project_id_idx" ON "datasets"("project_id");

-- CreateIndex
CREATE INDEX "datasets_user_id_idx" ON "datasets"("user_id");

-- CreateIndex
CREATE INDEX "datasets_status_idx" ON "datasets"("status");

-- CreateIndex
CREATE INDEX "datasets_filename_idx" ON "datasets"("filename");

-- CreateIndex
CREATE INDEX "datasets_created_at_idx" ON "datasets"("created_at");

-- CreateIndex
CREATE INDEX "prediction_logs_user_id_idx" ON "prediction_logs"("user_id");

-- CreateIndex
CREATE INDEX "prediction_logs_model_name_idx" ON "prediction_logs"("model_name");

-- CreateIndex
CREATE INDEX "prediction_logs_created_at_idx" ON "prediction_logs"("created_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_category_idx" ON "notifications"("category");

-- CreateIndex
CREATE INDEX "notifications_read_idx" ON "notifications"("read");

-- CreateIndex
CREATE INDEX "notifications_user_id_read_idx" ON "notifications"("user_id", "read");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "webhooks_user_id_idx" ON "webhooks"("user_id");

-- CreateIndex
CREATE INDEX "webhooks_status_idx" ON "webhooks"("status");

-- CreateIndex
CREATE INDEX "webhooks_created_at_idx" ON "webhooks"("created_at");

-- CreateIndex
CREATE INDEX "user_sessions_user_id_idx" ON "user_sessions"("user_id");

-- CreateIndex
CREATE INDEX "user_sessions_is_active_idx" ON "user_sessions"("is_active");

-- CreateIndex
CREATE INDEX "user_sessions_token_hash_idx" ON "user_sessions"("token_hash");

-- CreateIndex
CREATE INDEX "user_sessions_expires_at_idx" ON "user_sessions"("expires_at");

-- CreateIndex
CREATE INDEX "marketplace_items_item_type_idx" ON "marketplace_items"("item_type");

-- CreateIndex
CREATE INDEX "marketplace_items_category_idx" ON "marketplace_items"("category");

-- CreateIndex
CREATE INDEX "marketplace_items_featured_idx" ON "marketplace_items"("featured");

-- CreateIndex
CREATE INDEX "marketplace_items_created_at_idx" ON "marketplace_items"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_resource_type_idx" ON "audit_logs"("resource_type");

-- CreateIndex
CREATE INDEX "audit_logs_resource_id_idx" ON "audit_logs"("resource_id");

-- CreateIndex
CREATE INDEX "audit_logs_status_idx" ON "audit_logs"("status");

-- CreateIndex
CREATE INDEX "audit_logs_severity_idx" ON "audit_logs"("severity");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_action_created_at_idx" ON "audit_logs"("user_id", "action", "created_at");

-- CreateIndex
CREATE INDEX "activity_logs_user_id_idx" ON "activity_logs"("user_id");

-- CreateIndex
CREATE INDEX "activity_logs_action_idx" ON "activity_logs"("action");

-- CreateIndex
CREATE INDEX "activity_logs_resource_type_idx" ON "activity_logs"("resource_type");

-- CreateIndex
CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs"("created_at");

-- CreateIndex
CREATE INDEX "activity_logs_user_id_created_at_idx" ON "activity_logs"("user_id", "created_at");
