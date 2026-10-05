@echo off
title Janiuay Business Permit System - Quick Start
echo ===================================
echo  Janiuay Business Permit System
echo  Quick Start Script
echo ===================================
echo.
echo Starting Server...
echo.

:: Navigate to backend and start
cd /d "%~dp0backend"
if not exist node_modules (
    echo Installing dependencies...
    npm install
)

start "Janiuay BPLO Server" cmd /k "npm run dev"

echo Server starting on http://localhost:5000
echo.
echo Frontend: http://localhost:5000
echo.
echo ===================================
echo  Server is starting!
echo.
echo  Open http://localhost:5000 in your browser
echo ===================================
echo.
echo Press any key to close this window...
pause >nul
