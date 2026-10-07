# Antigravity OS V7.0 — Model Management Guide

## 1. Configured vs Executable Governance
Antigravity OS strictly distinguishes configured models from executable engines:
- **EXECUTABLE**: Verified through live minimal inference or ping tests with empirical latency recorded.
- **UNAVAILABLE**: Tagged if unreachable, uninstalled, or lacking hardware headroom.
- **Fallback Hierarchy**: Automatic graceful fallback routes queries from primary cloud models to local Ollama/ComfyUI engines during outages.
