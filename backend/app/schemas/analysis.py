from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class EvidenceItemSchema(BaseModel):
    id: Optional[str] = None
    evidence_type: str  # visual_attention, temporal_inconsistency, spectral_artifact, face_boundary
    timestamp_or_region: Optional[str] = None
    evidence_description: str
    evidence_reference: Optional[str] = None

class AnalysisCreateRequest(BaseModel):
    notes: Optional[str] = None

class AnalysisResponse(BaseModel):
    id: str
    media_type: str
    original_filename: str
    file_hash: str
    file_size_bytes: int
    status: str
    predicted_class: str  # authentic, manipulated, inconclusive
    trust_score: float  # 0 to 100
    manipulation_probability: float  # 0.0 to 1.0
    model_confidence: float  # 0.0 to 1.0
    risk_level: str  # low, moderate, elevated, critical, inconclusive
    model_version: str
    processing_time: float
    created_at: datetime
    explanation: Optional[str] = None
    limitations: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    evidence_items: List[EvidenceItemSchema] = []
    details: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class AnalysisHistoryItem(BaseModel):
    id: str
    media_type: str
    original_filename: str
    file_hash: str
    status: str
    predicted_class: str
    trust_score: float
    manipulation_probability: float
    model_confidence: float
    risk_level: str
    model_version: str
    processing_time: float
    created_at: datetime

    class Config:
        from_attributes = True

class DashboardStatsResponse(BaseModel):
    total_analyses: int
    image_count: int
    video_count: int
    audio_count: int
    authentic_count: int
    manipulated_count: int
    inconclusive_count: int
    average_trust_score: float
    recent_analyses: List[AnalysisHistoryItem]
    score_distribution: Dict[str, int]
