"""
TruthLens AI — Complete Machine Learning Training Orchestrator
Coordinates dataset preparation, Vision Transformer fine-tuning,
temporal video sequence training, and verification reporting.
"""

import sys
import argparse
from pathlib import Path

# Add project root to path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT_DIR))

from ml.datasets.prepare_faceforensics import prepare_dataset, DEFAULT_RAW_DIR, DEFAULT_OUTPUT_DIR
from ml.image_training.train_vit import train_vit_detector, load_data_from_directory
from ml.video_training.train_temporal import train_temporal_model

def run_pipeline(
    train_image: bool = True,
    train_video: bool = False,
    mode: str = "head_only",
    epochs: int = 5,
    batch_size: int = 16,
    max_videos: int = 60,
    frames_per_video: int = 4,
    force_extract: bool = False,
    raw_dir: str = DEFAULT_RAW_DIR,
    data_dir: str = DEFAULT_OUTPUT_DIR,
    vit_output: str = "weights/vit_deepfake",
    temporal_output: str = "weights/temporal_gru"
):
    print("=" * 75)
    print("TruthLens AI — Deepfake Detection ML Training Suite")
    print("=" * 75)
    
    # 1. Dataset verification / extraction
    data_path = Path(data_dir)
    train_paths, train_labels, val_paths, val_labels = load_data_from_directory(data_path)
    
    if force_extract or len(train_paths) == 0 or len(val_paths) == 0:
        print("[*] Preparing FaceForensics++ face crop dataset...")
        prep_info = prepare_dataset(
            raw_dir=raw_dir,
            output_dir=data_dir,
            max_videos_per_class=max_videos,
            frames_per_video=frames_per_video
        )
        train_paths, train_labels, val_paths, val_labels = load_data_from_directory(data_path)
    else:
        print(f"[+] Using existing preprocessed dataset at: {data_path.resolve()}")
        print(f"    - Train: {len(train_paths)} | Val: {len(val_paths)}")

    # 2. Train Vision Transformer
    if train_image:
        print("\n" + "=" * 75)
        print("STAGE 1: Vision Transformer (ViT) Deepfake Model Training")
        print("=" * 75)
        vit_metrics = train_vit_detector(
            train_paths=train_paths,
            train_labels=train_labels,
            val_paths=val_paths,
            val_labels=val_labels,
            output_dir=vit_output,
            epochs=epochs,
            batch_size=batch_size,
            mode=mode
        )

    # 3. Train Video Temporal Model
    if train_video:
        print("\n" + "=" * 75)
        print("STAGE 2: Video Temporal Consistency Model Training")
        print("=" * 75)
        train_temporal_model(
            raw_dir=raw_dir,
            max_videos_per_class=max(15, max_videos // 2),
            output_dir=temporal_output
        )

    print("\n" + "=" * 75)
    print("ALL TRAINING STAGES COMPLETED SUCCESSFULLY!")
    print("Checkpoints available:")
    if train_image:
        print(f" - Vision Transformer: {Path(vit_output).resolve()}")
    if train_video:
        print(f" - Temporal BiGRU:     {Path(temporal_output).resolve()}")
    print("=" * 75)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="TruthLens ML Training Orchestrator")
    parser.add_argument("--image", action="store_true", default=True, help="Train Vision Transformer Image Model")
    parser.add_argument("--video", action="store_true", default=False, help="Train Video Temporal Consistency Model")
    parser.add_argument("--mode", type=str, default="head_only", choices=["head_only", "top_layers", "full"])
    parser.add_argument("--epochs", type=int, default=5)
    parser.add_argument("--batch_size", type=int, default=16)
    parser.add_argument("--max_videos", type=int, default=60)
    parser.add_argument("--frames_per_video", type=int, default=4)
    parser.add_argument("--force_extract", action="store_true", default=False, help="Force re-extraction of dataset from raw videos")
    args = parser.parse_args()

    run_pipeline(
        train_image=args.image,
        train_video=args.video,
        mode=args.mode,
        epochs=args.epochs,
        batch_size=args.batch_size,
        max_videos=args.max_videos,
        frames_per_video=args.frames_per_video,
        force_extract=args.force_extract
    )
