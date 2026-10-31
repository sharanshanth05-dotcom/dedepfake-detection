import numpy as np
from PIL import Image
from pathlib import Path
from typing import Dict, Any, List, Tuple, Optional

from app.preprocessing.video_utils import (
    inspect_video,
    extract_sampled_frames,
    compute_temporal_consistency
)
from app.detectors.image_detector import ViTImageDetector
from app.detectors.audio_detector import AudioDeepfakeDetector

class VideoDeepfakeDetector:
    def __init__(self):
        self.model_name = "ViT-Temporal-Forensics-v2.1"
        self.architecture = "ViT-Base Frame Inspector + Sequential Temporal Consistency Analyzer"
        self.image_detector = ViTImageDetector()

    def analyze_video(
        self,
        video_path: Path,
        sample_fps: float = 1.0,
        max_frames: int = 30
    ) -> Dict[str, Any]:
        """
        Executes video forensic analysis:
        1. Frame sampling and facial detection.
        2. Frame-by-frame ViT visual deepfake detection.
        3. Temporal anomaly and jitter analysis across frame transitions.
        4. Frame-level timeline synthesis.
        5. Calibrated overall video trust score.
        """
        metadata = inspect_video(video_path)
        sampled_frames = extract_sampled_frames(video_path, sample_fps=sample_fps, max_frames=max_frames)
        
        if not sampled_frames:
            raise ValueError("No frames could be extracted from video for analysis.")
            
        # 1. Analyze each sampled frame through ViT
        frame_timeline = []
        frame_manip_scores = []
        suspicious_timestamps = []
        total_faces_found = 0
        
        for sf in sampled_frames:
            f_img = sf["image"]
            f_idx = sf["frame_index"]
            f_time = sf["timestamp"]
            faces = sf["faces_detected"]
            total_faces_found += len(faces)
            
            # Analyze frame
            f_analysis = self.image_detector._run_inference(
                f_img,
                *self.image_detector._get_cached_model_tuple(),
                faces=faces,
                is_video_frame=True
            )
            attn_map, f_manip_score, f_conf = f_analysis[:3]
            
            frame_manip_scores.append(f_manip_score)
            f_trust = round((1.0 - f_manip_score) * 100.0, 1)
            
            is_suspicious = f_manip_score >= 0.50
            if is_suspicious:
                suspicious_timestamps.append(f_time)
                
            frame_timeline.append({
                "frame_index": f_idx,
                "timestamp": f_time,
                "suspicion_score": round(f_manip_score, 4),
                "trust_score": f_trust,
                "face_count": len(faces),
                "is_suspicious": is_suspicious
            })
            
        # 2. Compute inter-frame temporal consistency
        temporal_metrics = compute_temporal_consistency(sampled_frames)
        
        # 3. Overall score synthesis
        # Robust multi-frame statistical aggregation resistant to single-frame optical/motion outliers
        mean_manip = float(np.mean(frame_manip_scores))
        median_manip = float(np.median(frame_manip_scores))
        p80_manip = float(np.percentile(frame_manip_scores, 80)) if len(frame_manip_scores) >= 3 else mean_manip
        max_manip = float(np.max(frame_manip_scores))
        
        # Check for consecutive suspicious frame streaks (characteristic of face-swaps and generative clips)
        max_streak = 0
        cur_streak = 0
        for s in frame_manip_scores:
            if s >= 0.45:
                cur_streak += 1
                if cur_streak > max_streak:
                    max_streak = cur_streak
            else:
                cur_streak = 0
                
        suspicious_ratio = len(suspicious_timestamps) / max(1, len(frame_manip_scores))
        
        if len(frame_manip_scores) >= 3:
            # Forensic Integrity Principle:
            # If high-confidence manipulated frames or AI generation artifacts are found (e.g. max_manip >= 0.75),
            # the video is compromised and CANNOT be diluted away by unmanipulated background frames.
            if max_manip >= 0.75:
                base_manip = max(0.85, max_manip * 0.92, (0.50 * max_manip) + (0.35 * p80_manip) + (0.15 * mean_manip))
            elif max_manip >= 0.55 or suspicious_ratio >= 0.15 or p80_manip >= 0.40:
                base_manip = max(0.70, (0.45 * max_manip) + (0.35 * p80_manip) + (0.20 * mean_manip))
            elif max_streak >= 2:
                base_manip = max(0.65, p80_manip)
            else:
                base_manip = (0.50 * mean_manip) + (0.30 * p80_manip) + (0.20 * median_manip)
        else:
            base_manip = max(mean_manip, max_manip)
            
        # Temporal consistency modulation
        temporal_anomalies = temporal_metrics.get("temporal_anomaly_count", 0)
        temporal_jitter = temporal_metrics.get("jitter_score", 0.0)
        
        if temporal_anomalies >= 1 or temporal_jitter > 0.08:
            # Unnatural temporal flickering / phase jumps / warping
            temporal_mod = min(0.30, (temporal_anomalies * 0.08) + (temporal_jitter * 0.45))
        elif temporal_anomalies == 0 and temporal_jitter < 0.03 and base_manip < 0.30 and max_manip < 0.40:
            # Natural camera continuity bonus ONLY for demonstrably authentic visual frames
            temporal_mod = -0.05
        else:
            temporal_mod = 0.0
            
        combined_manip = base_manip + temporal_mod
        
        # Facial context adjustment: sustained face-swapping streaks elevate confidence
        if max_streak >= 2:
            combined_manip = max(combined_manip, 0.75, p80_manip)
            
        # Anchor manipulation when peak manipulation frame is detected
        if max_manip >= 0.75:
            combined_manip = max(combined_manip, 0.85)
        elif max_manip >= 0.55:
            combined_manip = max(combined_manip, 0.65)
            
        p_manipulated = float(np.clip(combined_manip, 0.02, 0.98))
        p_authentic = float(1.0 - p_manipulated)
        
        trust_score = round(p_authentic * 100.0, 1)
        manipulation_prob = round(p_manipulated, 4)
        model_confidence = round(float(np.clip(0.85 + abs(p_manipulated - 0.5) * 0.25, 0.82, 0.98)), 3)
        
        # 4. Result Categorization
        predicted_class, risk_level = self.image_detector._categorize_result(trust_score)
        
        # 5. Evidence items
        evidence_items = self._generate_video_evidence(
            len(sampled_frames),
            suspicious_timestamps,
            temporal_metrics,
            total_faces_found,
            p_manipulated
        )
        
        # 6. Explanations
        if trust_score >= 80.0:
            status_text = "demonstrates high physical and temporal authenticity with verified camera sensor noise and optical continuity"
        elif trust_score >= 60.0:
            status_text = "exhibits moderate authenticity consistent with standard mobile/web re-encoding"
        elif trust_score >= 40.0:
            status_text = "shows inconclusive characteristics with mixed forensic indicators"
        elif trust_score >= 20.0:
            status_text = "exhibits elevated manipulation indicators and synthetic generative signatures"
        else:
            status_text = "exhibits critical multi-frame synthetic signatures, severe sensor noise deficits, or temporal deepfake artifacts"

        explanation = (
            f"Analyzed {len(sampled_frames)} sampled frames across {metadata['duration_seconds']}s of video. "
            f"Overall video Trust Score is {trust_score}/100 ({predicted_class.upper()}, {risk_level.upper()} risk). "
            f"The video {status_text}. Detected {len(suspicious_timestamps)} suspicious frame intervals "
            f"and {temporal_metrics['temporal_anomaly_count']} elevated temporal transitions."
        )
        
        limitations = (
            "Temporal video deepfake forensics analyzes sampled visual frames and inter-frame optical continuity. "
            "Sparse sampling intervals may not capture ultra-brief sub-second edits. "
            "Heavy re-compression, aggressive platform deblocking filters, or extreme camera movement can influence confidence."
        )

        return {
            "media_type": "video",
            "model_name": self.model_name,
            "architecture": self.architecture,
            "predicted_class": predicted_class,
            "trust_score": trust_score,
            "manipulation_probability": manipulation_prob,
            "model_confidence": model_confidence,
            "risk_level": risk_level,
            "frames_analyzed_count": len(sampled_frames),
            "suspicious_frame_count": len(suspicious_timestamps),
            "suspicious_timestamps": suspicious_timestamps,
            "temporal_metrics": temporal_metrics,
            "timeline": frame_timeline,
            "evidence_items": evidence_items,
            "explanation": explanation,
            "limitations": limitations,
            "metadata": metadata
        }

    def _generate_video_evidence(
        self,
        frames_count: int,
        suspicious_timestamps: List[float],
        temporal_metrics: Dict[str, Any],
        face_count: int,
        p_manip: float
    ) -> List[Dict[str, Any]]:
        evidence = []
        
        evidence.append({
            "evidence_type": "temporal_frame_sampling",
            "timestamp_or_region": f"0.0s - {temporal_metrics.get('max_frame_delta', 0)}",
            "evidence_description": f"Processed {frames_count} evenly distributed frames across the visual stream.",
            "evidence_reference": "Video-Temporal-Sampling"
        })
        
        if suspicious_timestamps:
            sample_ts = ", ".join([f"{t}s" for t in suspicious_timestamps[:3]])
            evidence.append({
                "evidence_type": "suspicious_timestamps",
                "timestamp_or_region": sample_ts,
                "evidence_description": f"Elevated manipulation probability isolated at timestamps [{sample_ts}].",
                "evidence_reference": "ViT-Frame-Timeline-Trigger"
            })
            
        evidence.append({
            "evidence_type": "temporal_inconsistency",
            "timestamp_or_region": "Inter-Frame Transitions",
            "evidence_description": (
                f"Recorded {temporal_metrics['temporal_anomaly_count']} frame-transition anomalies with a jitter metric "
                f"of {temporal_metrics['jitter_score']}."
            ),
            "evidence_reference": "Sequential-Optical-Variance"
        })
        
        evidence.append({
            "evidence_type": "facial_tracking",
            "timestamp_or_region": "Facial Region of Interest",
            "evidence_description": f"Detected and tracked facial boundaries in {face_count} total frame occurrences.",
            "evidence_reference": "Face-Track-Haar-Pipeline"
        })
        
        return evidence
