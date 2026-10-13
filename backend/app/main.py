import os
import sys
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles

# Add parent directory to path to enable package resolution
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.config import settings
from app.database.session import engine, Base, SessionLocal
from app.database.models import User, ModelRegistry
from app.core.security import hash_password
from app.api.v1.router import api_router
from app.api.v1.endpoints.models import MODEL_CARDS

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database schema exists
    Base.metadata.create_all(bind=engine)
    
    # Seed default models and analyst user
    db = SessionLocal()
    try:
        # Check default user
        admin = db.query(User).filter(User.email == "admin@truthlens.ai").first()
        if not admin:
            admin_user = User(
                name="Chief Forensic Analyst",
                email="admin@truthlens.ai",
                password_hash=hash_password("Admin@12345"),
                role="admin"
            )
            db.add(admin_user)
            
        # Seed or update all multimodal forensic models in registry
        for card in MODEL_CARDS:
            existing = db.query(ModelRegistry).filter(ModelRegistry.id == card["id"]).first()
            if not existing:
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
            else:
                existing.model_name = card["model_name"]
                existing.model_version = card["model_version"]
                existing.supported_media_type = card["supported_media_type"]
                existing.evaluation_metrics = card["evaluation_metrics"]
                
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[TruthLens] DB seed notice: {e}")
    finally:
        db.close()
        
    yield
    # Shutdown logic if needed

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Cybersecurity platform analyzing images, videos, and audio for AI generation and manipulation.",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits dev frontend clients
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Never expose internal stack traces in production API responses
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": str(exc),
            "service": "TruthLens Forensics Core"
        }
    )

# Include API v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Serve frontend SPA if built, while preserving API routes and docs
def get_frontend_dist() -> Path | None:
    custom_dist = os.getenv("FRONTEND_DIST")
    if custom_dist and (Path(custom_dist) / "index.html").exists():
        return Path(custom_dist)
    candidates = [
        Path(__file__).resolve().parent.parent.parent / "frontend" / "dist",
        Path(__file__).resolve().parent.parent / "frontend" / "dist",
        Path(__file__).resolve().parent.parent / "dist",
        Path("/home/user/app/frontend/dist"),
        Path("/app/frontend/dist"),
    ]
    for candidate in candidates:
        if (candidate / "index.html").exists():
            return candidate
    return None

frontend_dist = get_frontend_dist()
if frontend_dist:
    if (frontend_dist / "assets").exists():
        app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")

    @app.get("/")
    async def serve_index():
        return FileResponse(str(frontend_dist / "index.html"))

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return JSONResponse(status_code=404, content={"detail": "Not Found"})
        target_file = frontend_dist / full_path
        if full_path and target_file.is_file():
            return FileResponse(str(target_file))
        return FileResponse(str(frontend_dist / "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "service": "TruthLens AI API Gateway",
            "status": "operational",
            "documentation": "/docs",
            "api_v1": "/api/v1"
        }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
