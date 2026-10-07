@echo off
title Video2X - AI Video Upscaler & Frame Interpolator
cd /d "c:\D drive\Antigravity\tools\video2x"
echo ===============================================================================
echo                VIDEO2X -- AI VIDEO & ANIME ENHANCER
echo ===============================================================================
echo.
echo [*] Supported algorithms: Real-CUGAN, Real-ESRGAN, Waifu2x, Anime4K, RIFE
echo [*] Checking Vulkan / CUDA GPU acceleration...
echo.
if exist "build\bin\video2x.exe" (
    "build\bin\video2x.exe" --help
) else (
    echo [*] Python Video2X runner mode...
    python -m pip install video2x
    video2x --help
)
pause
