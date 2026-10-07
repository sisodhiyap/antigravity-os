@echo off
title Open WebUI (Local & Sovereign AI Chat)
cd /d "c:\D drive\Antigravity\tools\open-webui"
echo ===============================================================================
echo              STARTING OPEN WEBUI (LOCAL AI INTERFACE)
echo ===============================================================================
echo.
echo [*] Checking Ollama host on http://127.0.0.1:11434...
echo [*] Starting Open WebUI server on http://localhost:8080...
echo.
python -m open_webui serve --port 8080
if %errorlevel% neq 0 (
    echo [*] Running via pip module fallback...
    pip install open-webui
    open-webui serve --port 8080
)
pause
