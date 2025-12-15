@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Starting Servers
echo ========================================
echo.

rem check python
python --version >nul 2>&1
if errorlevel 1 (
    echo Python not found
    pause
    exit /b 1
)

rem start frontend in new window so script continues
start "frontend" cmd /c "npm run dev"

rem go backend folder
cd /d "%~dp0..\backend"
if not exist "main.py" (
    echo backend folder not found
    pause
    exit /b 1
)

rem check venv
if not exist "venv\Scripts\activate.bat" (
    echo venv missing
    pause
    exit /b 1
)

call venv\Scripts\activate.bat

rem env check
if not exist ".env" (
    if exist ".env.development" (
        copy ".env.development" ".env" >nul
    ) else (
        echo env missing
        pause
        exit /b 1
    )
)



echo starting api http://localhost:8000
python run.py

pause
