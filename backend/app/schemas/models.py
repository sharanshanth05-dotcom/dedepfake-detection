from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel

class ModelRegistryResponse(BaseModel):
    id: str
    model_name: str
    model_version: str
    supported_media_type: str
    dataset_version: Optional[str] = None
    calibration_version: Optional[str] = None
    evaluation_metrics: Optional[Dict[str, Any]] = None
    deployment_status: str
    created_at: datetime

    class Config:
        from_attributes = True

class ModelCard(BaseModel):
    name: str
    version: str
    type: str
    architecture: str
    training_data: str
    intended_use: str
    limitations: List[str]
    ethical_considerations: str
    metrics: Dict[str, float]
