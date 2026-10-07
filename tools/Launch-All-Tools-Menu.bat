@echo off
title Antigravity OS - Generative Media & Open-Source AI Suite
color 0b
cls
echo ===============================================================================
echo            ANTIGRAVITY OS -- OPEN-SOURCE AI & GENERATIVE SUITE
echo ===============================================================================
echo.
echo  --- Generative Image & Media Workstations ---
echo  [1] Launch ComfyUI Modular Diffusion Workstation (Port 8188)
echo  [2] Launch Fooocus Local SDXL High-Fidelity Studio (Port 7865)
echo.
echo  --- Open-Source AI Workspaces & Agent Builders ---
echo  [3] Launch Open WebUI (Offline AI Chat & RAG - Port 8080)
echo  [4] Launch Flowise (Visual AI Workflow & Agent Builder - Port 3000)
echo.
echo  --- Audio & Video Generative & Upscaling Pipelines ---
echo  [5] Launch Suno AI Music Generator MCP Server
echo  [6] Launch Automated Video Generator & Subtitle Pipeline
echo  [7] Launch Free Video Maker (Remotion / Web Studio)
echo  [8] Launch MCP Video Gen Server
echo  [9] Launch Video2X (AI Video & Anime 2x/4x Upscaler)
echo  [10] Launch 4K Video Upscaler & Enhancer
echo.
echo  --- Antigravity OS ---
echo  [11] Open Antigravity OS Media Studio in Browser
echo  [0] Exit
echo.
echo ===============================================================================
set /p choice="Select an option (0-11): "

if "%choice%"=="1" goto launch_comfyui
if "%choice%"=="2" goto launch_fooocus
if "%choice%"=="3" goto launch_openwebui
if "%choice%"=="4" goto launch_flowise
if "%choice%"=="5" goto launch_suno
if "%choice%"=="6" goto launch_autovideo
if "%choice%"=="7" goto launch_freemaker
if "%choice%"=="8" goto launch_mcpvideogen
if "%choice%"=="9" goto launch_video2x
if "%choice%"=="10" goto launch_4kupscaler
if "%choice%"=="11" goto launch_browser
if "%choice%"=="0" goto end
goto end

:launch_comfyui
echo [*] Starting ComfyUI on http://127.0.0.1:8188...
cd /d "c:\D drive\Antigravity\tools\ComfyUI"
python main.py --preview-method auto --listen 127.0.0.1 --port 8188
pause
goto end

:launch_fooocus
echo [*] Starting Fooocus on http://127.0.0.1:7865...
cd /d "c:\D drive\Antigravity\tools\Fooocus"
python launch.py
pause
goto end

:launch_openwebui
echo [*] Starting Open WebUI on http://localhost:8080...
cd /d "c:\D drive\Antigravity\tools\open-webui"
python -m open_webui serve --port 8080
if %errorlevel% neq 0 (
    pip install open-webui
    open-webui serve --port 8080
)
pause
goto end

:launch_flowise
echo [*] Starting Flowise on http://localhost:3000...
cd /d "c:\D drive\Antigravity\tools\Flowise"
call npx --yes flowise start
pause
goto end

:launch_suno
echo [*] Starting SunoMCP Server (AceDataCloud/SunoMCP)...
cd /d "c:\D drive\Antigravity\tools\SunoMCP"
python main.py
pause
goto end

:launch_autovideo
echo [*] Starting Automated Video Generator...
cd /d "c:\D drive\Antigravity\tools\Automated-Video-Generator"
call Start-Automated-Video-Generator.bat
pause
goto end

:launch_freemaker
echo [*] Starting Free Video Maker Studio...
cd /d "c:\D drive\Antigravity\tools\free-video-maker"
npm run dev
pause
goto end

:launch_mcpvideogen
echo [*] Starting MCP Video Gen Server...
cd /d "c:\D drive\Antigravity\tools\mcp-video-gen"
python -m src.server
pause
goto end

:launch_video2x
echo [*] Starting Video2X AI Video & Anime Enhancer...
cd /d "c:\D drive\Antigravity\tools\video2x"
call ..\Launch-Video2X.bat
pause
goto end

:launch_4kupscaler
echo [*] Starting 4K Video Upscaler & Enhancer...
cd /d "c:\D drive\Antigravity\tools\4k-video-upscaler"
call ..\Launch-4K-Video-Upscaler.bat
pause
goto end

:launch_browser
start http://localhost:3000/media
goto end

:end
exit /b
