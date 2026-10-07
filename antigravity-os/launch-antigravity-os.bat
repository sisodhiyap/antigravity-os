@echo off
title Antigravity OS V7.0 - Standalone Product Runtime
cd /d "%~dp0"

echo ============================================================
echo   ANTIGRAVITY OS V7.0 - SOVEREIGN DESKTOP RUNTIME
echo ============================================================
echo   Starting local runtime supervisor and web server...
echo   Open in browser: http://localhost:3000
echo   Command Center:  http://localhost:3000/desktop
echo   PresentX Studio: http://localhost:3000/presentx
echo ============================================================
echo.

start "" "http://localhost:3000/desktop"
npm run dev
