# Antigravity OS V7.0 — Clean Machine Installation Guide

## 1. Prerequisites
- **Operating System**: Windows 11 / Linux (Ubuntu 22.04 LTS+) / macOS (Apple Silicon M1+)
- **Node.js**: v20.x or v22.x LTS
- **Python**: v3.10 or v3.11 (for local ComfyUI standalone execution)
- **GPU (Optional for Local Media)**: NVIDIA RTX (>=6GB VRAM) or Apple Silicon Unified Memory

## 2. Setup Procedure
```bash
# 1. Clone repository
git clone https://github.com/sisodhiyap/antigravity-os.git
cd antigravity-os

# 2. Install Node dependencies
npm install

# 3. Initialize Local Inference Engines (Optional)
# Start Ollama
ollama run qwen2.5-coder:32b

# 4. Verify System & Baseline
npm run verify:v7:unified
npm run verify:v7:release
```
