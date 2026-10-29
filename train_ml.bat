@echo off
setlocal enabledelayedexpansion

echo =====================================================================
echo       TruthLens AI — Deep Learning Model Training Suite
echo =====================================================================
echo.
echo Dataset: FaceForensics++ (C23) Benchmark
echo Cache:   D:\college work\datasets_cache
echo.
echo Select training workflow:
echo [1] Fast Transfer Learning - Vision Transformer (ViT) [~2-3 mins]
echo [2] Balanced Fine-Tuning   - ViT Top Layers           [~6-8 mins]
echo [3] Full Sequence Training  - Video Temporal BiGRU     [~3-5 mins]
echo [4] Extract / Refresh Preprocessed FaceForensics++ Dataset
echo [5] Exit
echo.

set /p choice="Enter choice [1-5]: "

if "%choice%"=="1" (
    echo.
    echo [*] Starting ViT Fast-Transfer Fine-Tuning...
    py -3.10 -u ml/image_training/train_vit.py --mode head_only --epochs 4 --batch_size 16 --output_dir weights/vit_deepfake
) else if "%choice%"=="2" (
    echo.
    echo [*] Starting ViT Top-Layers Fine-Tuning...
    py -3.10 -u ml/image_training/train_vit.py --mode top_layers --epochs 3 --batch_size 8 --output_dir weights/vit_deepfake
) else if "%choice%"=="3" (
    echo.
    echo [*] Starting Video Temporal Consistency Model Training...
    py -3.10 -u ml/video_training/train_temporal.py
) else if "%choice%"=="4" (
    echo.
    echo [*] Extracting FaceForensics++ Dataset crops...
    py -3.10 -u ml/datasets/prepare_faceforensics.py --max_videos 50 --frames_per_video 4
) else (
    echo Exiting.
    exit /b 0
)

echo.
echo =====================================================================
echo Training process completed.
echo Check weights in: weights/vit_deepfake
echo =====================================================================
pause
