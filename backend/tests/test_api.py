import io
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from PIL import Image
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import Base, engine, SessionLocal
from app.api.v1.endpoints.models import MODEL_CARDS
from app.database.models import ModelRegistry

# Ensure tables and seed exist
Base.metadata.create_all(bind=engine)
db = SessionLocal()
if db.query(ModelRegistry).count() == 0:
    for card in MODEL_CARDS:
        reg = ModelRegistry(
            id=card["id"],
            model_name=card["model_name"],
            model_version=card["model_version"],
            supported_media_type=card["supported_media_type"],
            dataset_version=card["dataset_version"],
            calibration_version=card["calibration_version"],
            evaluation_metrics=card["evaluation_metrics"],
            deployment_status=card["deployment_status"]
        )
        db.add(reg)
    db.commit()
db.close()

client = TestClient(app)

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "hardware" in data
    assert "modalities_ready" in data

def test_model_registry_list():
    response = client.get("/api/v1/models/")
    assert response.status_code == 200
    models = response.json()
    assert len(models) >= 3

def test_model_cards():
    response = client.get("/api/v1/models/cards")
    assert response.status_code == 200
    cards = response.json()
    assert any(c["supported_media_type"] == "image" for c in cards)

def test_detect_image_flow():
    # Create test image in memory
    img = Image.new("RGB", (256, 256), color=(120, 150, 180))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    response = client.post(
        "/api/v1/detect/image",
        files={"file": ("synthetic_test.jpg", buf, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert "trust_score" in data
    assert "manipulation_probability" in data
    assert "predicted_class" in data
    assert "evidence_items" in data
    assert data["media_type"] == "image"
    assert data["status"] == "completed"

def test_dashboard_stats():
    response = client.get("/api/v1/analysis/dashboard/stats")
    assert response.status_code == 200
    stats = response.json()
    assert "total_analyses" in stats
    assert "score_distribution" in stats

if __name__ == "__main__":
    print("[1/5] Running health check...")
    test_health_check()
    print("[2/5] Running model registry test...")
    test_model_registry_list()
    print("[3/5] Running model cards test...")
    test_model_cards()
    print("[4/5] Running image detection flow test...")
    test_detect_image_flow()
    print("[5/5] Running dashboard stats test...")
    test_dashboard_stats()
    print("\nALL 5 INTEGRATION TESTS PASSED SUCCESSFULLY! ✓")
