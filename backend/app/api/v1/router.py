from fastapi import APIRouter
from app.api.v1.endpoints import detect, analysis, health, models

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health & Hardware"])
api_router.include_router(detect.router, prefix="/detect", tags=["Forensic Detection"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["Analysis & Reports"])
api_router.include_router(models.router, prefix="/models", tags=["Model Registry"])
