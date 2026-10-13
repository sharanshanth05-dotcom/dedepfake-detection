import os
from pathlib import Path
from typing import List, Set
from pydantic import BaseModel, Field

class Settings(BaseModel):
    PROJECT_NAME: str = "TruthLens AI"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Base directories
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    UPLOAD_DIR: Path = Path(os.getenv("UPLOAD_DIR", str(Path(__file__).resolve().parent.parent.parent / "uploads")))
    REPORTS_DIR: Path = Path(os.getenv("REPORTS_DIR", str(Path(__file__).resolve().parent.parent.parent.parent / "reports")))
    STATIC_DIR: Path = Path(os.getenv("STATIC_DIR", str(Path(__file__).resolve().parent.parent.parent / "static")))
    
    # Security & CORS
    SECRET_KEY: str = os.getenv("SECRET_KEY", "cybersecurity-secret-key-truthlens-ai-2026-production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{Path(__file__).resolve().parent.parent.parent}/truthlens.db")
    
    # Upload constraints
    MAX_IMAGE_SIZE_MB: int = 15
    MAX_VIDEO_SIZE_MB: int = 100
    MAX_AUDIO_SIZE_MB: int = 40
    
    ALLOWED_IMAGE_EXTENSIONS: Set[str] = {".jpg", ".jpeg", ".png", ".webp"}
    ALLOWED_VIDEO_EXTENSIONS: Set[str] = {".mp4", ".mov", ".webm"}
    ALLOWED_AUDIO_EXTENSIONS: Set[str] = {".wav", ".mp3", ".flac", ".m4a"}
    
    # Models
    DEFAULT_VIT_IMAGE_MODEL: str = "google/vit-base-patch16-224"
    DEFAULT_AUDIO_MODEL: str = "facebook/wav2vec2-base"
    
    # Video sampling
    VIDEO_SAMPLE_FPS: float = 1.0  # Sample 1 frame per second
    MAX_VIDEO_FRAMES: int = 30     # Up to 30 frames for analysis

settings = Settings()

# Ensure directories exist safely
try:
    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    settings.REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    settings.STATIC_DIR.mkdir(parents=True, exist_ok=True)
except Exception as e:
    print(f"[TruthLens] Storage directory init notice: {e}")
