# AutoML Platform

A full-stack automated machine learning platform with dataset management, feature engineering, model training, deployment, and monitoring.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                  │
│  localhost:3000  ───  Vite Proxy (/api)  ────  Backend      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI + Uvicorn)               │
│  localhost:8000  │  SQLAlchemy ORM  │  scikit-learn         │
│                  │  DuckDB (SQL)    │  JWT Auth             │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
   ┌──────────┐       ┌──────────┐       ┌──────────────┐
   │PostgreSQL│       │  Redis   │       │  Filesystem  │
   │(Docker)  │       │(Docker)  │       │ datasets/    │
   │or SQLite │       │  Celery  │       │ models/      │
   └──────────┘       └──────────┘       └──────────────┘
```

## Features

| Page | Description |
|------|-------------|
| **Dashboard** | Overview of experiments, models, system health |
| **Upload** | Upload datasets (CSV, Excel, Parquet, JSON) |
| **Explorer** | Browse datasets with column stats, distributions, correlations |
| **Cleaning** | Drop columns, fill missing values, remove duplicates |
| **Feature Engineering** | Create polynomial/interaction features, binning, log transforms |
| **Training** | AutoML with scikit-learn — classification & regression |
| **Predictions** | Run predictions on trained models |
| **Deployments** | Deploy models as API endpoints |
| **Monitoring** | Model performance metrics over time |
| **Pipelines** | Create and run multi-step ML pipelines |
| **Automations** | Webhook-based automation triggers |
| **SQL Editor** | Query datasets directly with DuckDB SQL engine |
| **Projects** | Organize experiments and models by project |
| **Marketplace** | Browse and install pre-built model templates |
| **Settings** | Profile, API keys, teams, billing, admin audit log |

### AutoML Pipeline
- **Preprocessing**: Auto-detect column types, handle missing values, scale/normalize, one-hot encode (with high-cardinality drop >50 unique)
- **Models**: LogisticRegression, RandomForest, GradientBoosting, SVC, KNN (classification); Ridge, Lasso, RandomForest, GradientBoosting, SVR, KNN (regression)
- **Tuning**: RandomizedSearchCV with configurable iterations and cross-validation
- **Persistence**: Models saved as `.pkl` with metadata JSON

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- (Optional) Docker & Docker Compose

### Local Development

```bash
# 1. Backend
cd backend
python -m venv .venv
.venv\Scripts\activate      # Windows
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000** in your browser.

### Docker Deployment

```bash
docker-compose up --build
```

Open **http://localhost** (served via nginx on port 80).

## Database

The platform uses **SQLAlchemy ORM** with automatic fallback:
- **PostgreSQL** when `DATABASE_URL` environment variable is set
- **SQLite** (`backend/automl.db`) by default for local development

Tables are auto-created on first startup via `init_db()`.

## API

Interactive API docs: **http://localhost:8000/docs** (Swagger UI)

### Key Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/register` | Register user |
| POST | `/api/v1/auth/login` | Login |
| GET | `/api/v1/datasets` | List datasets |
| POST | `/api/v1/datasets` | Upload dataset |
| GET | `/api/v1/datasets/{name}/preview` | Preview dataset |
| GET | `/api/v1/datasets/{name}/profile` | Dataset profile/stats |
| POST | `/api/v1/datasets/{name}/clean` | Clean dataset |
| POST | `/api/v1/training` | Start AutoML training |
| GET | `/api/v1/experiments` | List experiments |
| GET | `/api/v1/models` | List trained models |
| POST | `/api/v1/deployments` | Deploy model |
| POST | `/api/v1/predictions` | Run prediction |
| GET | `/api/v1/monitoring/metrics` | Monitoring metrics |
| GET | `/api/v1/monitoring/stats` | Monitoring stats |
| POST | `/api/v1/query` | Run SQL query via DuckDB |
| POST | `/api/v1/ai/chat` | AI assistant chat |

## Testing

```bash
cd backend
.venv\Scripts\activate
pytest tests/ -v
```

15 tests covering auth, datasets, experiments, models, monitoring, pipelines, webhooks, and activity log.

## Tech Stack

**Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Zustand, Lucide React

**Backend**: Python 3.11+, FastAPI, SQLAlchemy 2.0, scikit-learn, Pandas, DuckDB, JWT (python-jose)

**Infrastructure**: Docker, Docker Compose, PostgreSQL 16, Redis 7, nginx, GitHub Actions (CI/CD)
