@echo off
TITLE TruthLens AI - Localhost Launcher
echo =====================================================================
echo                TruthLens AI - Localhost Launcher
echo =====================================================================
echo.

set ROOT_DIR=%~dp0
cd /d "%ROOT_DIR%"

echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "TruthLens AI - Backend (Port 8000)" cmd /k "cd /d "%ROOT_DIR%backend" && py -3.10 -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Starting React + Vite Frontend on http://localhost:5173 ...
start "TruthLens AI - Frontend (Port 5173)" cmd /k "cd /d "%ROOT_DIR%frontend" && npm run dev"

echo.
echo =====================================================================
echo Both servers have been launched in separate terminal windows!
echo.
echo   - Web UI:       http://localhost:5173
echo   - Backend API:  http://127.0.0.1:8000
echo   - Swagger Docs: http://127.0.0.1:8000/docs
echo =====================================================================
echo.
timeout /t 5 /nobreak >nul 2>&1 || ping -n 6 127.0.0.1 >nul
exit /b 0
