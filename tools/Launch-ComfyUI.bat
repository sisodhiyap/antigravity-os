@echo off
title ComfyUI Workstation
cd /d "c:\D drive\Antigravity\tools\ComfyUI"
echo Starting ComfyUI on http://127.0.0.1:8188...
python main.py --preview-method auto --listen 127.0.0.1 --port 8188
pause
