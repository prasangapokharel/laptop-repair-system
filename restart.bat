@echo off
REM Script to restart the Laptop Repair Store backend server
REM This ensures the latest code is loaded

echo ========================================
echo Restarting Backend Server
echo ========================================
echo.

REM Step 1: Kill any existing Python processes running the backend
echo [1/3] Stopping existing backend processes...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq *uvicorn*" >nul 2>&1
taskkill /F /IM python.exe /FI "IMAGENAME eq python.exe" >nul 2>&1
timeout /t 2 >nul

echo [2/3] Cleaning Python cache...
cd backend
rmdir /s /q __pycache__ >nul 2>&1
for /d /r . %%d in (__pycache__) do @if exist "%%d" rmdir /s /q "%%d" >nul 2>&1
del /s /q *.pyc >nul 2>&1

echo [3/3] Starting backend server with auto-reload...
echo.
echo Backend server starting at http://localhost:8000
echo Press Ctrl+C to stop the server
echo.
echo ========================================

uvicorn main:app --reload --host 0.0.0.0 --port 8000
