from fastapi import APIRouter
from datetime import datetime
import torch

router = APIRouter()

@router.get("/health")
def health_check():
    """System health and hardware accelerator status."""
    cuda_available = torch.cuda.is_available()
    return {
        "status": "healthy",
        "service": "TruthLens AI Forensics Engine",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "hardware": {
            "torch_version": torch.__version__,
            "cuda_available": cuda_available,
            "device": torch.cuda.get_device_name(0) if cuda_available else "CPU (Standard Inference Engine)"
        },
        "modalities_ready": ["image", "video", "audio"]
    }
