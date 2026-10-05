@echo off
title Janiuay BPLO System - Starting Server
echo ===================================
echo  Janiuay Business Permit System
echo ===================================
echo Starting server...
echo.
cd /d "%~dp0backend"

:: Start the server in background
start "Janiuay BPLO Server" cmd /k "npm run dev"

:: Wait a few seconds for server to start
timeout /t 5 /nobreak >nul

:: Open the website in default browser
echo Opening website in browser...
start http://localhost:5000

echo.
echo Server is starting! The website should open shortly.
echo If it doesn't open automatically, visit: http://localhost:5000
echo.
