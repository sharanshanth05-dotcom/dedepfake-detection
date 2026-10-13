@echo off
echo =====================================================================
echo    TruthLens AI - Download FaceForensics++ Dataset to D: Drive
echo =====================================================================
echo.
echo Target Storage Directory: D:\college work\datasets_cache
echo Target Drive:             D: (Free space: ~202 GB)
echo Dataset:                  xdxd003/ff-c23 (~16.7 GB)
echo.
echo WARNING: This will download 16.7 GB directly to D:\college work.
echo Ensure you have an active internet connection.
echo.
pause
echo.
echo Starting download...
python ml/datasets/download_faceforensics.py
echo.
echo =====================================================================
echo Process finished.
echo =====================================================================
pause
