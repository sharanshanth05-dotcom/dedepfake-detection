import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="analyst")  # analyst, admin, auditor
    created_at = Column(DateTime, default=datetime.utcnow)

    analyses = relationship("Analysis", back_populates="user", cascade="all, delete-orphan")

class Analysis(Base):
    __tablename__ = "analysis"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    media_type = Column(String(20), nullable=False)  # image, video, audio
    original_filename = Column(String(255), nullable=False)
    file_hash = Column(String(64), index=True, nullable=False)  # SHA-256
    status = Column(String(30), default="completed")  # queued, processing, completed, failed
    predicted_class = Column(String(50), nullable=False)  # authentic, manipulated, inconclusive
    trust_score = Column(Float, nullable=False)  # 0 to 100
    manipulation_probability = Column(Float, nullable=False)  # 0.0 to 1.0
    model_confidence = Column(Float, nullable=False)  # 0.0 to 1.0
    model_version = Column(String(100), nullable=False)
    processing_time = Column(Float, nullable=False)  # in seconds
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Forensic context & artifacts
    risk_level = Column(String(30), default="low")  # low, moderate, elevated, critical, inconclusive
    explanation = Column(Text, nullable=True)
    limitations = Column(Text, nullable=True)
    file_size_bytes = Column(Integer, default=0)
    metadata_json = Column(JSON, nullable=True)  # File dimensions, sample rate, fps, duration, etc.
    details_json = Column(JSON, nullable=True)   # Heatmap base64, frame/audio timeline data

    user = relationship("User", back_populates="analyses")
    evidence_items = relationship("AnalysisEvidence", back_populates="analysis", cascade="all, delete-orphan")

class AnalysisEvidence(Base):
    __tablename__ = "analysis_evidence"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    analysis_id = Column(String(36), ForeignKey("analysis.id"), nullable=False)
    evidence_type = Column(String(50), nullable=False)  # visual_attention, temporal_inconsistency, spectral_artifact, face_boundary
    timestamp_or_region = Column(String(100), nullable=True)  # e.g. "00:04.2" or "[120, 45, 230, 260]"
    evidence_description = Column(Text, nullable=False)
    evidence_reference = Column(String(255), nullable=True)  # path or tag

    analysis = relationship("Analysis", back_populates="evidence_items")

class ModelRegistry(Base):
    __tablename__ = "model_registry"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    model_name = Column(String(100), nullable=False)
    model_version = Column(String(50), nullable=False)
    supported_media_type = Column(String(20), nullable=False)  # image, video, audio
    dataset_version = Column(String(100), nullable=True)
    calibration_version = Column(String(50), nullable=True)
    evaluation_metrics = Column(JSON, nullable=True)  # { "accuracy": 0.94, "f1": 0.93, "brier_score": 0.06 }
    deployment_status = Column(String(30), default="active")  # active, evaluating, deprecated
    created_at = Column(DateTime, default=datetime.utcnow)
