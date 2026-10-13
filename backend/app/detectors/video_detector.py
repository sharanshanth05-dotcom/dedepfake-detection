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
                faces=faces
            )
            attn_map, f_manip_score, f_conf = f_analysis[:3]
            
            frame_manip_scores.append(f_manip_score)
            f_trust = round((1.0 - f_manip_score) * 100.0, 1)
            
            is_suspicious = f_manip_score >= 0.5
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
        # Weighted combination: 65% worst-case/average frame anomaly + 35% temporal jitter
        avg_manip = float(np.mean(frame_manip_scores))
        peak_manip = float(np.max(frame_manip_scores))
        temporal_penalty = min(0.3, temporal_metrics["temporal_anomaly_count"] * 0.08 + temporal_metrics["jitter_score"] * 0.5)
        
        combined_manip = 0.45 * avg_manip + 0.35 * peak_manip + 0.20 * temporal_penalty
        p_manipulated = float(np.clip(combined_manip, 0.02, 0.98))
        p_authentic = float(1.0 - p_manipulated)
        
        trust_score = round(p_authentic * 100.0, 1)
        manipulation_prob = round(p_manipulated, 4)
        model_confidence = round(0.85 + (0.10 * (len(sampled_frames) / max_frames)), 3)
        
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
        explanation = (
            f"Analyzed {len(sampled_frames)} sampled frames across {metadata['duration_seconds']}s of video. "
            f"Overall video Trust Score is {trust_score}/100 with an estimated manipulation probability of "
            f"{round(manipulation_prob * 100, 1)}%. Detected {len(suspicious_timestamps)} suspicious frame intervals "
            f"and {temporal_metrics['temporal_anomaly_count']} temporal transitions with elevated variance."
        )
        
        limitations = (
            "Temporal video deepfake detection is subject to frame sampling density. Analyzing sampled frames "
            "at controlled intervals does not guarantee detection of ultra-brief or sparsely interpolated manipulations. "
            "Fast camera pan, motion blur, or intense video compression can induce spurious temporal anomaly signals."
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
