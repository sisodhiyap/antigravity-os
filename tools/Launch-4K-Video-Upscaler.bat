@echo off
title 4K Video Upscaler & Enhancer
cd /d "c:\D drive\Antigravity\tools\4k-video-upscaler"
echo ===============================================================================
echo             ANTIGRAVITY OS -- AI 4K VIDEO UPSCALER & ENHANCER
echo ===============================================================================
echo.
echo Drag and drop any video file onto this script or enter the full path below.
echo.
set /p vid="Enter video path: "
if "%vid%"=="" (
    echo No video provided.
    pause
    exit /b
)
python upscale_video.py %vid% --resolution 4k
pause
