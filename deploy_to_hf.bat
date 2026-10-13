@echo off
echo =====================================================================
echo    TruthLens AI - Hugging Face Spaces 1-Click Deployment Assistant
echo =====================================================================
echo.
echo Step 1: Make sure you have created your Space on Hugging Face:
echo   - URL: https://huggingface.co/new-space
echo   - SDK: Choose "Docker" -> "Blank"
echo   - Hardware: "CPU basic (16GB RAM - Free)"
echo   - Visibility: Public
echo.
set /p SPACE_URL="Enter your Hugging Face Space Git URL (e.g. https://huggingface.co/spaces/YOUR_USERNAME/truthlens-ai): "

if "%SPACE_URL%"=="" (
    echo Error: No URL provided. Exiting.
    pause
    exit /b 1
)

echo.
echo Adding Hugging Face remote...
git remote remove space 2>nul
git remote add space %SPACE_URL%

echo.
echo Pushing project to Hugging Face Spaces...
git push space main

echo.
echo =====================================================================
echo Deployment initiated!
echo Visit your Space on Hugging Face to view build progress and live app.
echo =====================================================================
pause
