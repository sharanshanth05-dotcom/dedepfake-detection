import cv2
import numpy as np
from PIL import Image
from pathlib import Path
from typing import List, Dict, Any, Tuple
from app.preprocessing.image_utils import detect_faces

def inspect_video(video_path: Path) -> Dict[str, Any]:
    """Inspects video metadata via OpenCV."""
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise ValueError("Could not open video file for processing.")
    
    fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH) or 0)
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT) or 0)
    duration = total_frames / fps if fps > 0 else 0.0
    
    cap.release()
    
    return {
        "fps": round(fps, 2),
        "total_frames": total_frames,
        "width": width,
        "height": height,
        "duration_seconds": round(duration, 2),
        "has_visual_stream": total_frames > 0
    }

def extract_sampled_frames(
    video_path: Path,
    sample_fps: float = 1.0,
    max_frames: int = 30
) -> List[Dict[str, Any]]:
    """
    Extracts representative frames with timestamp, frame index, PIL image,
    and detected faces.
    """
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise ValueError("Failed to open video stream.")
    
    video_fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    duration = total_frames / video_fps if video_fps > 0 else 0.0
    
    # Adaptive sampling:
    # Dense sampling for short clips (1-5s) so transient face-swaps or AI generation artifacts
    # are never missed, while distributing up to max_frames for longer recordings.
    if total_frames > 0:
        if total_frames <= max_frames:
            step = 1
        else:
            target_frames = min(max_frames, max(15, min(total_frames, int(duration * 3.0))))
            step = max(1, total_frames // target_frames)
    else:
        step = max(1, int(video_fps / sample_fps))
    
    sampled_frames = []
    frame_idx = 0
    
    while cap.isOpened() and len(sampled_frames) < max_frames:
        ret, frame = cap.read()
        if not ret:
            break
            
        if frame_idx % step == 0:
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil_img = Image.fromarray(rgb_frame)
            timestamp = round(frame_idx / video_fps, 2)
            
            faces = detect_faces(pil_img)
            
            sampled_frames.append({
                "frame_index": frame_idx,
                "timestamp": timestamp,
                "image": pil_img,
                "faces_detected": faces,
                "face_count": len(faces)
            })
            
        frame_idx += 1
        
    cap.release()
    return sampled_frames

def compute_temporal_consistency(sampled_frames: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Analyzes inter-frame variance and pixel differentials across frames
    to capture temporal jitter, blur spikes, and deepfake blending artifacts.
    """
    if len(sampled_frames) < 2:
        return {
            "mean_frame_delta": 0.0,
            "max_frame_delta": 0.0,
            "temporal_anomaly_count": 0,
            "jitter_score": 0.0
        }
        
    deltas = []
    for i in range(len(sampled_frames) - 1):
        img_a = np.array(sampled_frames[i]["image"].resize((128, 128)))
        img_b = np.array(sampled_frames[i + 1]["image"].resize((128, 128)))
        
        # Absolute mean pixel difference normalized to 0..1
        diff = np.mean(np.abs(img_a.astype(float) - img_b.astype(float))) / 255.0
        deltas.append(diff)
        
    deltas_np = np.array(deltas)
    mean_delta = float(np.mean(deltas_np))
    std_delta = float(np.std(deltas_np))
    
    # An anomaly occurs if a single transition exceeds 2.2 standard deviations
    threshold = mean_delta + 2.2 * (std_delta + 1e-6)
    anomalies = [i for i, d in enumerate(deltas) if d > threshold]
    
    return {
        "mean_frame_delta": round(mean_delta, 4),
        "max_frame_delta": round(float(np.max(deltas_np)), 4),
        "temporal_anomaly_count": len(anomalies),
        "anomaly_frame_indices": anomalies,
        "jitter_score": round(std_delta, 4)
    }
