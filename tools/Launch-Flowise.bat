@echo off
title Flowise (Open-Source Visual AI Agent Builder)
cd /d "c:\D drive\Antigravity\tools\Flowise"
echo ===============================================================================
echo              STARTING FLOWISE (VISUAL AI WORKFLOW BUILDER)
echo ===============================================================================
echo.
echo [*] Starting Flowise UI on http://localhost:3000...
echo.
call npx --yes flowise start
pause
