import time
import uuid
import shutil
from pathlib import Path
from typing import Dict, Any
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import calculate_sha256, sanitize_filename, verify_file_signature
from app.database.session import get_db
from app.database.models import Analysis, AnalysisEvidence
from app.schemas.analysis import AnalysisResponse
from app.detectors.image_detector import ViTImageDetector
from app.detectors.video_detector import VideoDeepfakeDetector
from app.detectors.audio_detector import AudioDeepfakeDetector
from app.services.report_service import ForensicReportService

router = APIRouter()

image_detector = ViTImageDetector()
video_detector = VideoDeepfakeDetector()
audio_detector = AudioDeepfakeDetector()
report_service = ForensicReportService(settings.REPORTS_DIR)

@router.post("/image", response_model=AnalysisResponse)
async def detect_image(
    file: UploadFile = File(...),
    notes: str = Form(None),
    db: Session = Depends(get_db)
):
    """
    Analyzes uploaded image through Vision Transformer (ViT) deepfake detection pipeline.
    Extracts attention rollout heatmaps, human facial ROIs, and calibrated trust score.
    """
    # 1. Extension validation
    orig_ext = Path(file.filename or "").suffix.lower()
    if orig_ext not in settings.ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported image format '{orig_ext}'. Allowed: {', '.join(settings.ALLOWED_IMAGE_EXTENSIONS)}"
        )
        
    # 2. Secure file persistence
    safe_name = sanitize_filename(file.filename or "upload.jpg")
    file_id = str(uuid.uuid4())
    stored_path = settings.UPLOAD_DIR / f"{file_id}{orig_ext}"
    
    try:
        with open(stored_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to store uploaded file: {str(e)}")
    finally:
        file.file.close()

    file_size = stored_path.stat().st_size
    if file_size > settings.MAX_IMAGE_SIZE_MB * 1024 * 1024:
        stored_path.unlink(missing_ok=True)
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail=f"File exceeds maximum allowed size ({settings.MAX_IMAGE_SIZE_MB}MB)")

    # 3. Magic bytes security check
    if not verify_file_signature(stored_path, "image"):
        stored_path.unlink(missing_ok=True)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File header signature mismatch (possible spoofed extension).")

    # 4. SHA-256 Provenance Hash
    file_hash = calculate_sha256(stored_path)

    # 5. Run ViT Detection Pipeline
    t_start = time.time()
    try:
        detection_result = image_detector.analyze_image(stored_path)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"Image forensics processing error: {str(e)}")
    finally:
        # Secure cleanup of uploaded media
        stored_path.unlink(missing_ok=True)
        
    duration = round(time.time() - t_start, 3)

    # 6. Save Analysis to Database
    analysis_record = Analysis(
        id=file_id,
        media_type="image",
        original_filename=safe_name,
        file_hash=file_hash,
        file_size_bytes=file_size,
        status="completed",
        predicted_class=detection_result["predicted_class"],
        trust_score=detection_result["trust_score"],
        manipulation_probability=detection_result["manipulation_probability"],
        model_confidence=detection_result["model_confidence"],
        risk_level=detection_result["risk_level"],
        model_version=detection_result["model_name"],
        processing_time=duration,
        explanation=detection_result["explanation"],
        limitations=detection_result["limitations"],
        metadata_json=detection_result["metadata"],
        details_json={
            "faces_detected_count": detection_result["faces_detected_count"],
            "visualizations": detection_result["visualizations"]
        }
    )
    db.add(analysis_record)

    # Save evidence items
    evidence_schemas = []
    for ev in detection_result["evidence_items"]:
        ev_id = str(uuid.uuid4())
        ev_db = AnalysisEvidence(
            id=ev_id,
            analysis_id=file_id,
            evidence_type=ev["evidence_type"],
            timestamp_or_region=ev.get("timestamp_or_region"),
            evidence_description=ev["evidence_description"],
            evidence_reference=ev.get("evidence_reference")
        )
        db.add(ev_db)
        evidence_schemas.append({
            "id": ev_id,
            "evidence_type": ev["evidence_type"],
            "timestamp_or_region": ev.get("timestamp_or_region"),
            "evidence_description": ev["evidence_description"],
            "evidence_reference": ev.get("evidence_reference")
        })

    db.commit()
    db.refresh(analysis_record)

    # 7. Generate Forensic Reports in Background/Disk
    report_dict = {
        "id": file_id,
        "media_type": "image",
        "original_filename": safe_name,
        "file_hash": file_hash,
        "file_size_bytes": file_size,
        "trust_score": detection_result["trust_score"],
        "manipulation_probability": detection_result["manipulation_probability"],
        "model_confidence": detection_result["model_confidence"],
        "predicted_class": detection_result["predicted_class"],
        "risk_level": detection_result["risk_level"],
        "model_version": detection_result["model_name"],
        "processing_time": duration,
        "explanation": detection_result["explanation"],
        "limitations": detection_result["limitations"],
        "evidence_items": evidence_schemas,
        "created_at": analysis_record.created_at,
        "visualizations": detection_result.get("visualizations", {})
    }
    try:
        report_service.generate_json_report(report_dict)
        report_service.generate_pdf_report(report_dict)
    except Exception as e:
        print(f"[TruthLens] Forensic report rendering notice: {e}")

    return AnalysisResponse(
        id=analysis_record.id,
        media_type="image",
        original_filename=analysis_record.original_filename,
        file_hash=analysis_record.file_hash,
        file_size_bytes=analysis_record.file_size_bytes,
        status=analysis_record.status,
        predicted_class=analysis_record.predicted_class,
        trust_score=analysis_record.trust_score,
        manipulation_probability=analysis_record.manipulation_probability,
        model_confidence=analysis_record.model_confidence,
        risk_level=analysis_record.risk_level,
        model_version=analysis_record.model_version,
        processing_time=analysis_record.processing_time,
        created_at=analysis_record.created_at,
        explanation=analysis_record.explanation,
        limitations=analysis_record.limitations,
        metadata=analysis_record.metadata_json,
        evidence_items=evidence_schemas,
        details=analysis_record.details_json
    )

@router.post("/video", response_model=AnalysisResponse)
async def detect_video(
    file: UploadFile = File(...),
    notes: str = Form(None),
    db: Session = Depends(get_db)
):
    """
    Analyzes uploaded video through ViT frame-sampling and temporal inconsistency modeling.
    Tracks faces and generates frame-level suspicion timeline.
    """
    orig_ext = Path(file.filename or "").suffix.lower()
    if orig_ext not in settings.ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported video format '{orig_ext}'. Allowed: {', '.join(settings.ALLOWED_VIDEO_EXTENSIONS)}"
        )
        
    safe_name = sanitize_filename(file.filename or "upload.mp4")
    file_id = str(uuid.uuid4())
    stored_path = settings.UPLOAD_DIR / f"{file_id}{orig_ext}"
    
    try:
        with open(stored_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to store video: {str(e)}")
    finally:
        file.file.close()

    file_size = stored_path.stat().st_size
    if file_size > settings.MAX_VIDEO_SIZE_MB * 1024 * 1024:
        stored_path.unlink(missing_ok=True)
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail=f"Video exceeds {settings.MAX_VIDEO_SIZE_MB}MB limit.")

    file_hash = calculate_sha256(stored_path)

    t_start = time.time()
    try:
        detection_result = video_detector.analyze_video(stored_path, sample_fps=settings.VIDEO_SAMPLE_FPS, max_frames=settings.MAX_VIDEO_FRAMES)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"Video forensics processing error: {str(e)}")
    finally:
        stored_path.unlink(missing_ok=True)
        
    duration = round(time.time() - t_start, 3)

    analysis_record = Analysis(
        id=file_id,
        media_type="video",
        original_filename=safe_name,
        file_hash=file_hash,
        file_size_bytes=file_size,
        status="completed",
        predicted_class=detection_result["predicted_class"],
        trust_score=detection_result["trust_score"],
        manipulation_probability=detection_result["manipulation_probability"],
        model_confidence=detection_result["model_confidence"],
        risk_level=detection_result["risk_level"],
        model_version=detection_result["model_name"],
        processing_time=duration,
        explanation=detection_result["explanation"],
        limitations=detection_result["limitations"],
        metadata_json=detection_result["metadata"],
        details_json={
            "frames_analyzed_count": detection_result["frames_analyzed_count"],
            "suspicious_frame_count": detection_result["suspicious_frame_count"],
            "suspicious_timestamps": detection_result["suspicious_timestamps"],
            "temporal_metrics": detection_result["temporal_metrics"],
            "timeline": detection_result["timeline"]
        }
    )
    db.add(analysis_record)

    evidence_schemas = []
    for ev in detection_result["evidence_items"]:
        ev_id = str(uuid.uuid4())
        ev_db = AnalysisEvidence(
            id=ev_id,
            analysis_id=file_id,
            evidence_type=ev["evidence_type"],
            timestamp_or_region=ev.get("timestamp_or_region"),
            evidence_description=ev["evidence_description"],
            evidence_reference=ev.get("evidence_reference")
        )
        db.add(ev_db)
        evidence_schemas.append({
            "id": ev_id,
            "evidence_type": ev["evidence_type"],
            "timestamp_or_region": ev.get("timestamp_or_region"),
            "evidence_description": ev["evidence_description"],
            "evidence_reference": ev.get("evidence_reference")
        })

    db.commit()
    db.refresh(analysis_record)

    # Render Reports
    report_dict = {
        "id": file_id,
        "media_type": "video",
        "original_filename": safe_name,
        "file_hash": file_hash,
        "file_size_bytes": file_size,
        "trust_score": detection_result["trust_score"],
        "manipulation_probability": detection_result["manipulation_probability"],
        "model_confidence": detection_result["model_confidence"],
        "predicted_class": detection_result["predicted_class"],
        "risk_level": detection_result["risk_level"],
        "model_version": detection_result["model_name"],
        "processing_time": duration,
        "explanation": detection_result["explanation"],
        "limitations": detection_result["limitations"],
        "evidence_items": evidence_schemas,
        "created_at": analysis_record.created_at
    }
    try:
        report_service.generate_json_report(report_dict)
        report_service.generate_pdf_report(report_dict)
    except Exception as e:
        print(f"[TruthLens] Report generation notice: {e}")

    return AnalysisResponse(
        id=analysis_record.id,
        media_type="video",
        original_filename=analysis_record.original_filename,
        file_hash=analysis_record.file_hash,
        file_size_bytes=analysis_record.file_size_bytes,
        status=analysis_record.status,
        predicted_class=analysis_record.predicted_class,
        trust_score=analysis_record.trust_score,
        manipulation_probability=analysis_record.manipulation_probability,
        model_confidence=analysis_record.model_confidence,
        risk_level=analysis_record.risk_level,
        model_version=analysis_record.model_version,
        processing_time=analysis_record.processing_time,
        created_at=analysis_record.created_at,
        explanation=analysis_record.explanation,
        limitations=analysis_record.limitations,
        metadata=analysis_record.metadata_json,
        evidence_items=evidence_schemas,
        details=analysis_record.details_json
    )

@router.post("/audio", response_model=AnalysisResponse)
async def detect_audio(
    file: UploadFile = File(...),
    notes: str = Form(None),
    db: Session = Depends(get_db)
):
    """
    Analyzes uploaded speech/audio through acoustic spectral inspection and synthetic vocoder detection.
    Computes segment-level timeline and overall voice trust score.
    """
    orig_ext = Path(file.filename or "").suffix.lower()
    if orig_ext not in settings.ALLOWED_AUDIO_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported audio format '{orig_ext}'. Allowed: {', '.join(settings.ALLOWED_AUDIO_EXTENSIONS)}"
        )
        
    safe_name = sanitize_filename(file.filename or "upload.wav")
    file_id = str(uuid.uuid4())
    stored_path = settings.UPLOAD_DIR / f"{file_id}{orig_ext}"
    
    try:
        with open(stored_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to store audio: {str(e)}")
    finally:
        file.file.close()

    file_size = stored_path.stat().st_size
    if file_size > settings.MAX_AUDIO_SIZE_MB * 1024 * 1024:
        stored_path.unlink(missing_ok=True)
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail=f"Audio exceeds {settings.MAX_AUDIO_SIZE_MB}MB limit.")

    file_hash = calculate_sha256(stored_path)

    t_start = time.time()
    try:
        detection_result = audio_detector.analyze_audio(stored_path)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"Audio forensics processing error: {str(e)}")
    finally:
        stored_path.unlink(missing_ok=True)
        
    duration = round(time.time() - t_start, 3)

    analysis_record = Analysis(
        id=file_id,
        media_type="audio",
        original_filename=safe_name,
        file_hash=file_hash,
        file_size_bytes=file_size,
        status="completed",
        predicted_class=detection_result["predicted_class"],
        trust_score=detection_result["trust_score"],
        manipulation_probability=detection_result["manipulation_probability"],
        model_confidence=detection_result["model_confidence"],
        risk_level=detection_result["risk_level"],
        model_version=detection_result["model_name"],
        processing_time=duration,
        explanation=detection_result["explanation"],
        limitations=detection_result["limitations"],
        metadata_json=detection_result["metadata"],
        details_json={
            "segments_count": detection_result["segments_count"],
            "suspicious_intervals_count": detection_result["suspicious_intervals_count"],
            "suspicious_intervals": detection_result["suspicious_intervals"],
            "global_spectral_features": detection_result["global_spectral_features"],
            "timeline": detection_result["timeline"]
        }
    )
    db.add(analysis_record)

    evidence_schemas = []
    for ev in detection_result["evidence_items"]:
        ev_id = str(uuid.uuid4())
        ev_db = AnalysisEvidence(
            id=ev_id,
            analysis_id=file_id,
            evidence_type=ev["evidence_type"],
            timestamp_or_region=ev.get("timestamp_or_region"),
            evidence_description=ev["evidence_description"],
            evidence_reference=ev.get("evidence_reference")
        )
        db.add(ev_db)
        evidence_schemas.append({
            "id": ev_id,
            "evidence_type": ev["evidence_type"],
            "timestamp_or_region": ev.get("timestamp_or_region"),
            "evidence_description": ev["evidence_description"],
            "evidence_reference": ev.get("evidence_reference")
        })

    db.commit()
    db.refresh(analysis_record)

    report_dict = {
        "id": file_id,
        "media_type": "audio",
        "original_filename": safe_name,
        "file_hash": file_hash,
        "file_size_bytes": file_size,
        "trust_score": detection_result["trust_score"],
        "manipulation_probability": detection_result["manipulation_probability"],
        "model_confidence": detection_result["model_confidence"],
        "predicted_class": detection_result["predicted_class"],
        "risk_level": detection_result["risk_level"],
        "model_version": detection_result["model_name"],
        "processing_time": duration,
        "explanation": detection_result["explanation"],
        "limitations": detection_result["limitations"],
        "evidence_items": evidence_schemas,
        "created_at": analysis_record.created_at
    }
    try:
        report_service.generate_json_report(report_dict)
        report_service.generate_pdf_report(report_dict)
    except Exception as e:
        print(f"[TruthLens] Report generation notice: {e}")

    return AnalysisResponse(
        id=analysis_record.id,
        media_type="audio",
        original_filename=analysis_record.original_filename,
        file_hash=analysis_record.file_hash,
        file_size_bytes=analysis_record.file_size_bytes,
        status=analysis_record.status,
        predicted_class=analysis_record.predicted_class,
        trust_score=analysis_record.trust_score,
        manipulation_probability=analysis_record.manipulation_probability,
        model_confidence=analysis_record.model_confidence,
        risk_level=analysis_record.risk_level,
        model_version=analysis_record.model_version,
        processing_time=analysis_record.processing_time,
        created_at=analysis_record.created_at,
        explanation=analysis_record.explanation,
        limitations=analysis_record.limitations,
        metadata=analysis_record.metadata_json,
        evidence_items=evidence_schemas,
        details=analysis_record.details_json
    )
