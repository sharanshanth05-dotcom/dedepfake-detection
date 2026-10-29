"""
TruthLens AI — FaceForensics++ (C23) Dataset Extractor & Preprocessor
Extracts facial regions of interest (ROI) from original and manipulated videos
with identity-level train/validation isolation to prevent data leakage.
"""

import os
import re
import cv2
import json
import argparse
from pathlib import Path
from typing import List, Tuple, Dict, Any

DEFAULT_RAW_DIR = r"D:\college work\datasets_cache\datasets\xdxd003\ff-c23\versions\1\FaceForensics++_C23"
DEFAULT_OUTPUT_DIR = r"ml\data\processed_ff"

def get_video_id(filename: str) -> int:
    """Extracts numeric base video ID from filename (e.g. '042.mp4' -> 42, '042_870.mp4' -> 42)."""
    base = Path(filename).stem
    match = re.match(r"^(\d+)", base)
    if match:
        return int(match.group(1))
    return -1

def extract_faces_from_video(
    video_path: Path,
    face_cascade: cv2.CascadeClassifier,
    frames_to_extract: int = 3,
    crop_size: Tuple[int, int] = (224, 224),
    margin_ratio: float = 0.20
) -> List[Any]:
    """Samples frames evenly from a video and extracts cropped face images."""
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        return []

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total_frames <= 0:
        cap.release()
        return []

    # Choose evenly spaced frame indices, avoiding very start and end frames
    start_frame = max(2, int(total_frames * 0.1))
    end_frame = max(start_frame + 1, int(total_frames * 0.9))
    step = max(1, (end_frame - start_frame) // max(1, frames_to_extract))
    sample_indices = [min(end_frame, start_frame + i * step) for i in range(frames_to_extract)]

    extracted_faces = []

    for frame_idx in sample_indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
        ret, frame = cap.read()
        if not ret or frame is None:
            continue

        h, w = frame.shape[:2]
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.15,
            minNeighbors=4,
            minSize=(60, 60)
        )

        if len(faces) == 0:
            # Fallback: center crop if face not immediately detected
            ch, cw = int(h * 0.6), int(w * 0.6)
            cy, cx = h // 2, w // 2
            face_crop = frame[cy - ch//2 : cy + ch//2, cx - cw//2 : cx + cw//2]
        else:
            # Select largest detected face
            faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
            fx, fy, fw, fh = faces[0]

            # Apply proportional margin around face boundary
            pad_x = int(fw * margin_ratio)
            pad_y = int(fh * margin_ratio)
            x1 = max(0, fx - pad_x)
            y1 = max(0, fy - pad_y)
            x2 = min(w, fx + fw + pad_x)
            y2 = min(h, fy + fh + pad_y)

            face_crop = frame[y1:y2, x1:x2]

        if face_crop.size > 0:
            face_resized = cv2.resize(face_crop, crop_size, interpolation=cv2.INTER_AREA)
            extracted_faces.append(face_resized)

    cap.release()
    return extracted_faces

def prepare_dataset(
    raw_dir: str = DEFAULT_RAW_DIR,
    output_dir: str = DEFAULT_OUTPUT_DIR,
    max_videos_per_class: int = 50,
    frames_per_video: int = 4,
    val_id_threshold: int = 750
) -> Dict[str, Any]:
    """
    Scans FaceForensics++ directories, enforces identity split,
    extracts face crops, and saves organized training and validation sets.
    """
    raw_path = Path(raw_dir)
    out_path = Path(output_dir)

    if not raw_path.exists():
        raise FileNotFoundError(f"Raw dataset path does not exist: {raw_path}")

    # Set up output directories
    train_auth_dir = out_path / "train" / "authentic"
    train_manip_dir = out_path / "train" / "manipulated"
    val_auth_dir = out_path / "val" / "authentic"
    val_manip_dir = out_path / "val" / "manipulated"

    for d in [train_auth_dir, train_manip_dir, val_auth_dir, val_manip_dir]:
        d.mkdir(parents=True, exist_ok=True)

    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

    # 1. Authentic videos
    original_dir = raw_path / "original"
    auth_videos = sorted([f for f in original_dir.glob("*.mp4")]) if original_dir.exists() else []

    # 2. Manipulated videos (sample across Deepfakes, FaceSwap, Face2Face, NeuralTextures)
    manip_types = ["Deepfakes", "FaceSwap", "Face2Face", "NeuralTextures"]
    manip_videos = []
    for mt in manip_types:
        mt_dir = raw_path / mt
        if mt_dir.exists():
            vids = sorted([f for f in mt_dir.glob("*.mp4")])
            manip_videos.extend(vids)

    print("=" * 70)
    print("TruthLens AI — FaceForensics++ Dataset Extraction & Identity Split")
    print("=" * 70)
    print(f"Source Directory:     {raw_path}")
    print(f"Target Output:        {out_path.resolve()}")
    print(f"Authentic Videos:     {len(auth_videos)} found")
    print(f"Manipulated Videos:   {len(manip_videos)} found across {manip_types}")
    print(f"Max Videos / Class:   {max_videos_per_class}")
    print(f"Frames / Video:       {frames_per_video}")
    print(f"Identity Split Line:  Video ID < {val_id_threshold} -> Train, >= {val_id_threshold} -> Val")
    print("-" * 70)

    # Enforce identity-level split between train and val pools
    train_quota = max(1, int(0.8 * max_videos_per_class))
    val_quota = max(1, max_videos_per_class - train_quota)

    auth_train = [v for v in auth_videos if get_video_id(v.name) < val_id_threshold][:train_quota]
    auth_val = [v for v in auth_videos if get_video_id(v.name) >= val_id_threshold][:val_quota]
    auth_selected = auth_train + auth_val

    manip_train, manip_val = [], []
    per_type_train = max(1, train_quota // len(manip_types))
    per_type_val = max(1, val_quota // len(manip_types))

    for mt in manip_types:
        mt_dir = raw_path / mt
        if mt_dir.exists():
            vids = sorted([f for f in mt_dir.glob("*.mp4")])
            m_tr = [v for v in vids if get_video_id(v.name) < val_id_threshold][:per_type_train]
            m_va = [v for v in vids if get_video_id(v.name) >= val_id_threshold][:per_type_val]
            manip_train.extend(m_tr)
            manip_val.extend(m_va)

    manip_selected = manip_train[:train_quota] + manip_val[:val_quota]

    manifest = {"train": [], "val": []}
    counts = {"train_auth": 0, "train_manip": 0, "val_auth": 0, "val_manip": 0}

    # Process Authentic
    print(f"[*] Extracting faces from {len(auth_selected)} Authentic videos...")
    for v_idx, v_path in enumerate(auth_selected):
        vid_id = get_video_id(v_path.name)
        is_val = (vid_id >= val_id_threshold)
        target_dir = val_auth_dir if is_val else train_auth_dir
        split_key = "val" if is_val else "train"

        faces = extract_faces_from_video(v_path, face_cascade, frames_to_extract=frames_per_video)
        for f_idx, face in enumerate(faces):
            out_filename = f"auth_vid_{vid_id:04d}_frame_{f_idx:02d}.jpg"
            out_filepath = target_dir / out_filename
            cv2.imwrite(str(out_filepath), face)

            manifest[split_key].append({
                "filepath": str(out_filepath.resolve()),
                "label": 0,
                "label_name": "authentic",
                "video_id": vid_id,
                "type": "original"
            })
            if is_val:
                counts["val_auth"] += 1
            else:
                counts["train_auth"] += 1

    # Process Manipulated
    print(f"[*] Extracting faces from {len(manip_selected)} Manipulated videos...")
    for v_idx, v_path in enumerate(manip_selected):
        vid_id = get_video_id(v_path.name)
        is_val = (vid_id >= val_id_threshold)
        target_dir = val_manip_dir if is_val else train_manip_dir
        split_key = "val" if is_val else "train"
        mtype = v_path.parent.name

        faces = extract_faces_from_video(v_path, face_cascade, frames_to_extract=frames_per_video)
        for f_idx, face in enumerate(faces):
            out_filename = f"manip_{mtype}_vid_{vid_id:04d}_frame_{f_idx:02d}_{v_idx}.jpg"
            out_filepath = target_dir / out_filename
            cv2.imwrite(str(out_filepath), face)

            manifest[split_key].append({
                "filepath": str(out_filepath.resolve()),
                "label": 1,
                "label_name": "manipulated",
                "video_id": vid_id,
                "type": mtype
            })
            if is_val:
                counts["val_manip"] += 1
            else:
                counts["train_manip"] += 1

    # Save manifest JSON
    manifest_path = out_path / "dataset_manifest.json"
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    total_train = counts["train_auth"] + counts["train_manip"]
    total_val = counts["val_auth"] + counts["val_manip"]

    print("\n[+] Extraction Complete!")
    print(f"    - Training Set:   {total_train} images ({counts['train_auth']} Authentic, {counts['train_manip']} Manipulated)")
    print(f"    - Validation Set: {total_val} images ({counts['val_auth']} Authentic, {counts['val_manip']} Manipulated)")
    print(f"    - Manifest saved: {manifest_path.resolve()}")

    return {
        "manifest_path": str(manifest_path),
        "counts": counts,
        "total_train": total_train,
        "total_val": total_val
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Prepare FaceForensics++ Face Crop Dataset")
    parser.add_argument("--raw_dir", type=str, default=DEFAULT_RAW_DIR, help="Path to raw FaceForensics++_C23 folder")
    parser.add_argument("--output_dir", type=str, default=DEFAULT_OUTPUT_DIR, help="Target directory for processed crops")
    parser.add_argument("--max_videos", type=int, default=50, help="Max videos per class to process")
    parser.add_argument("--frames_per_video", type=int, default=4, help="Frames to extract per video")
    parser.add_argument("--val_threshold", type=int, default=750, help="Video ID cutoff for validation set")
    args = parser.parse_args()

    prepare_dataset(
        raw_dir=args.raw_dir,
        output_dir=args.output_dir,
        max_videos_per_class=args.max_videos,
        frames_per_video=args.frames_per_video,
        val_id_threshold=args.val_threshold
    )
