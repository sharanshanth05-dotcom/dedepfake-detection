"""
TruthLens AI — FaceForensics++ (C23) Dataset Downloader & Integrator
Dataset: xdxd003/ff-c23 on Kaggle (~16.7 GB)
"""
import os
import sys
from pathlib import Path
import kagglehub

def download_and_setup_ff_c23(target_dir: str = "ml/datasets/ff_c23"):
    print("=" * 70)
    print("TruthLens AI — FaceForensics++ (C23) Benchmark Integrator")
    print("=" * 70)
    print("DATASET: xdxd003/ff-c23 (FaceForensics++ C23 Compression)")
    print("SIZE: ~16.7 GB")
    print("-" * 70)
    print("Starting download via KaggleHub (this may take 15-45 minutes)...")
    
    try:
        # Download using kagglehub (stores in local cache and avoids re-downloading)
        cache_path = kagglehub.dataset_download("xdxd003/ff-c23")
        print(f"\n[+] Download completed successfully!")
        print(f"[+] Cached location: {cache_path}")
        
        target_path = Path(target_dir).resolve()
        target_path.mkdir(parents=True, exist_ok=True)
        
        # Scan contents
        files = list(Path(cache_path).rglob("*"))
        video_files = [f for f in files if f.suffix.lower() in [".mp4", ".avi", ".mov"]]
        image_files = [f for f in files if f.suffix.lower() in [".jpg", ".jpeg", ".png"]]
        
        print(f"\n[+] Dataset scan summary:")
        print(f"    - Total items: {len(files)}")
        print(f"    - Video files: {len(video_files)}")
        print(f"    - Image files: {len(image_files)}")
        print(f"\n[+] Dataset ready for training with:")
        print(f"    python ml/video_training/train_temporal.py --data_dir \"{cache_path}\"")
        print(f"    python ml/image_training/train_vit.py --data_dir \"{cache_path}\"")
        
        return cache_path
    except Exception as e:
        print(f"\n[!] Error during download: {e}")
        print("Tip: If Kaggle requires authentication, run: kaggle config set")
        return None

if __name__ == "__main__":
    download_and_setup_ff_c23()
