"""Comprehensive API tests."""
import os
import tempfile
import pytest
from fastapi.testclient import TestClient


class TestHealth:
    def test_health_endpoint(self, client: TestClient):
        resp = client.get("/api/v1/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "healthy"


class TestAuth:
    def test_register_and_login(self, client: TestClient):
        resp = client.post("/api/v1/auth/register", data={
            "email": "test@example.com", "password": "testpass123", "name": "Test User"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "token" in data
        assert data["user"]["email"] == "test@example.com"

        resp = client.post("/api/v1/auth/login", data={
            "email": "test@example.com", "password": "testpass123"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "token" in data

    def test_register_duplicate(self, client: TestClient):
        client.post("/api/v1/auth/register", data={
            "email": "dup@example.com", "password": "testpass123", "name": "Dup"
        })
        resp = client.post("/api/v1/auth/register", data={
            "email": "dup@example.com", "password": "testpass123", "name": "Dup"
        })
        assert resp.status_code == 400

    def test_login_invalid(self, client: TestClient):
        resp = client.post("/api/v1/auth/login", data={
            "email": "nonexist@example.com", "password": "wrong"
        })
        assert resp.status_code == 401


class TestDatasets:
    def test_list_datasets(self, client: TestClient):
        resp = client.get("/api/v1/datasets")
        assert resp.status_code == 200
        assert "datasets" in resp.json()

    def test_upload_and_list(self, client: TestClient):
        with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False) as f:
            f.write("a,b,c\n1,2,3\n4,5,6\n")
            fpath = f.name

        with open(fpath, "rb") as f:
            resp = client.post("/api/v1/datasets", files={"file": (os.path.basename(fpath), f, "text/csv")})
        assert resp.status_code == 200

        resp = client.get("/api/v1/datasets")
        assert resp.status_code == 200
        names = [d["name"] for d in resp.json()["datasets"]]
        assert os.path.basename(fpath) in names

        os.unlink(fpath)

    def test_preview(self, client: TestClient):
        with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False) as f:
            f.write("x,y\n10,20\n30,40\n50,60\n")
            fpath = f.name

        with open(fpath, "rb") as f:
            client.post("/api/v1/datasets", files={"file": (os.path.basename(fpath), f, "text/csv")})

        resp = client.get(f"/api/v1/datasets/{os.path.basename(fpath)}/preview?rows=2")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_rows"] == 3
        assert len(data["data"]) == 2

        os.unlink(fpath)


class TestExperiments:
    def test_list_experiments(self, client: TestClient):
        resp = client.get("/api/v1/experiments")
        assert resp.status_code == 200
        assert "experiments" in resp.json()


class TestModels:
    def test_list_models(self, client: TestClient):
        resp = client.get("/api/v1/models")
        assert resp.status_code == 200
        assert "models" in resp.json()


class TestMonitoring:
    def test_metrics(self, client: TestClient):
        resp = client.get("/api/v1/monitoring/metrics")
        assert resp.status_code == 200
        data = resp.json()
        for key in ["cpu", "memory", "storage", "gpu"]:
            assert key in data

    def test_stats(self, client: TestClient):
        resp = client.get("/api/v1/monitoring/stats")
        assert resp.status_code == 200


class TestPipelines:
    def test_create_and_list(self, client: TestClient):
        resp = client.post("/api/v1/pipelines", json={
            "name": "Test Pipeline",
            "description": "A test pipeline",
            "steps": [
                {"type": "load_dataset", "params": {"dataset": "test.csv"}},
                {"type": "clean", "params": {}},
                {"type": "train", "params": {"target": "y"}},
            ],
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["name"] == "Test Pipeline"

        resp = client.get("/api/v1/pipelines")
        assert resp.status_code == 200
        assert len(resp.json()["pipelines"]) >= 1

    def test_run_pipeline(self, client: TestClient):
        resp = client.post("/api/v1/pipelines", json={"name": "Run Test", "steps": []})
        pipe_id = resp.json()["id"]

        resp = client.post(f"/api/v1/pipelines/{pipe_id}/run")
        assert resp.status_code == 200


class TestWebhooks:
    def test_crud(self, client: TestClient):
        resp = client.post("/api/v1/webhooks", json={
            "name": "Test Webhook",
            "url": "https://example.com/hook",
            "events": ["experiment.completed", "model.deployed"],
        })
        assert resp.status_code == 200
        wh_id = resp.json()["id"]

        resp = client.get("/api/v1/webhooks")
        assert resp.status_code == 200
        ids = [w["id"] for w in resp.json()["webhooks"]]
        assert wh_id in ids

        resp = client.delete(f"/api/v1/webhooks/{wh_id}")
        assert resp.status_code == 200


class TestActivity:
    def test_activity(self, client: TestClient):
        resp = client.get("/api/v1/activity")
        assert resp.status_code == 200
        assert "activities" in resp.json()
