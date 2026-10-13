from typing import List, Optional
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database.session import get_db
from app.database.models import Analysis, AnalysisEvidence
from app.schemas.analysis import AnalysisResponse, AnalysisHistoryItem, DashboardStatsResponse
from app.core.config import settings

router = APIRouter()

@router.get("/history", response_model=List[AnalysisHistoryItem])
def get_analysis_history(
    media_type: Optional[str] = Query(None, description="Filter by media type: image, video, audio"),
    risk_level: Optional[str] = Query(None, description="Filter by risk level"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """Retrieves previous analyses history sorted by recent date."""
    query = db.query(Analysis)
    if media_type:
        query = query.filter(Analysis.media_type == media_type.lower())
    if risk_level:
        query = query.filter(Analysis.risk_level == risk_level.lower())
        
    records = query.order_by(desc(Analysis.created_at)).limit(limit).all()
    return records

@router.get("/dashboard/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Computes forensic dashboard summary metrics and risk distribution."""
    total = db.query(Analysis).count()
    img_cnt = db.query(Analysis).filter(Analysis.media_type == "image").count()
    vid_cnt = db.query(Analysis).filter(Analysis.media_type == "video").count()
    aud_cnt = db.query(Analysis).filter(Analysis.media_type == "audio").count()
    
    auth_cnt = db.query(Analysis).filter(Analysis.predicted_class == "authentic").count()
    manip_cnt = db.query(Analysis).filter(Analysis.predicted_class == "manipulated").count()
    incon_cnt = db.query(Analysis).filter(Analysis.predicted_class == "inconclusive").count()
    
    all_scores = [r.trust_score for r in db.query(Analysis.trust_score).all()]
    avg_score = round(sum(all_scores) / len(all_scores), 1) if all_scores else 100.0
    
    recent = db.query(Analysis).order_by(desc(Analysis.created_at)).limit(6).all()
    
    # Score distribution brackets
    score_dist = {
        "80-100": db.query(Analysis).filter(Analysis.trust_score >= 80).count(),
        "60-79": db.query(Analysis).filter(Analysis.trust_score >= 60, Analysis.trust_score < 80).count(),
        "40-59": db.query(Analysis).filter(Analysis.trust_score >= 40, Analysis.trust_score < 60).count(),
        "20-39": db.query(Analysis).filter(Analysis.trust_score >= 20, Analysis.trust_score < 40).count(),
        "0-19": db.query(Analysis).filter(Analysis.trust_score < 20).count(),
    }
    
    return DashboardStatsResponse(
        total_analyses=total,
        image_count=img_cnt,
        video_count=vid_cnt,
        audio_count=aud_cnt,
        authentic_count=auth_cnt,
        manipulated_count=manip_cnt,
        inconclusive_count=incon_cnt,
        average_trust_score=avg_score,
        recent_analyses=recent,
        score_distribution=score_dist
    )

@router.get("/{analysis_id}", response_model=AnalysisResponse)
def get_analysis_by_id(analysis_id: str, db: Session = Depends(get_db)):
    """Retrieves full analysis report, forensic evidence, and visualization payloads."""
    record = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Forensic analysis record not found.")
        
    evidence_items = [
        {
            "id": ev.id,
            "evidence_type": ev.evidence_type,
            "timestamp_or_region": ev.timestamp_or_region,
            "evidence_description": ev.evidence_description,
            "evidence_reference": ev.evidence_reference
        }
        for ev in record.evidence_items
    ]
    
    return AnalysisResponse(
        id=record.id,
        media_type=record.media_type,
        original_filename=record.original_filename,
        file_hash=record.file_hash,
        file_size_bytes=record.file_size_bytes,
        status=record.status,
        predicted_class=record.predicted_class,
        trust_score=record.trust_score,
        manipulation_probability=record.manipulation_probability,
        model_confidence=record.model_confidence,
        risk_level=record.risk_level,
        model_version=record.model_version,
        processing_time=record.processing_time,
        created_at=record.created_at,
        explanation=record.explanation,
        limitations=record.limitations,
        metadata=record.metadata_json,
        evidence_items=evidence_items,
        details=record.details_json
    )

@router.get("/{analysis_id}/pdf")
def download_pdf_report(analysis_id: str, db: Session = Depends(get_db)):
    """Downloads certified PDF forensic audit report."""
    record = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Forensic record not found.")
        
    pdf_path = settings.REPORTS_DIR / f"forensic_report_{analysis_id}.pdf"
    if not pdf_path.exists():
        # Re-render on demand if deleted
        from app.services.report_service import ForensicReportService
        rep_svc = ForensicReportService(settings.REPORTS_DIR)
        report_dict = {
            "id": record.id,
            "media_type": record.media_type,
            "original_filename": record.original_filename,
            "file_hash": record.file_hash,
            "file_size_bytes": record.file_size_bytes,
            "trust_score": record.trust_score,
            "manipulation_probability": record.manipulation_probability,
            "model_confidence": record.model_confidence,
            "predicted_class": record.predicted_class,
            "risk_level": record.risk_level,
            "model_version": record.model_version,
            "processing_time": record.processing_time,
            "explanation": record.explanation,
            "limitations": record.limitations,
            "evidence_items": [
                {
                    "evidence_type": ev.evidence_type,
                    "timestamp_or_region": ev.timestamp_or_region,
                    "evidence_description": ev.evidence_description,
                    "evidence_reference": ev.evidence_reference
                }
                for ev in record.evidence_items
            ],
            "created_at": record.created_at
        }
        pdf_path = rep_svc.generate_pdf_report(report_dict)
        
    return FileResponse(
        path=str(pdf_path),
        filename=f"TruthLens_Report_{analysis_id[:8]}.pdf",
        media_type="application/pdf"
    )

@router.get("/{analysis_id}/json")
def download_json_report(analysis_id: str, db: Session = Depends(get_db)):
    """Downloads structured machine-readable JSON forensic audit record."""
    record = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Forensic record not found.")
        
    json_path = settings.REPORTS_DIR / f"forensic_report_{analysis_id}.json"
    if not json_path.exists():
        from app.services.report_service import ForensicReportService
        rep_svc = ForensicReportService(settings.REPORTS_DIR)
        report_dict = {
            "id": record.id,
            "media_type": record.media_type,
            "original_filename": record.original_filename,
            "file_hash": record.file_hash,
            "file_size_bytes": record.file_size_bytes,
            "trust_score": record.trust_score,
            "manipulation_probability": record.manipulation_probability,
            "model_confidence": record.model_confidence,
            "predicted_class": record.predicted_class,
            "risk_level": record.risk_level,
            "model_version": record.model_version,
            "processing_time": record.processing_time,
            "explanation": record.explanation,
            "limitations": record.limitations,
            "created_at": record.created_at
        }
        json_path = rep_svc.generate_json_report(report_dict)

    return FileResponse(
        path=str(json_path),
        filename=f"TruthLens_Report_{analysis_id[:8]}.json",
        media_type="application/json"
    )

@router.delete("/{analysis_id}")
def delete_analysis(analysis_id: str, db: Session = Depends(get_db)):
    """Removes analysis from database and deletes corresponding reports."""
    record = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Forensic record not found.")
        
    # Delete disk reports
    pdf_path = settings.REPORTS_DIR / f"forensic_report_{analysis_id}.pdf"
    json_path = settings.REPORTS_DIR / f"forensic_report_{analysis_id}.json"
    pdf_path.unlink(missing_ok=True)
    json_path.unlink(missing_ok=True)
    
    db.delete(record)
    db.commit()
    return {"status": "success", "message": f"Analysis {analysis_id} deleted successfully."}
