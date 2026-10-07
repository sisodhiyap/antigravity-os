# Antigravity OS V7.0 — ComfyUI Generative Media Guide

## 1. Local-First Diffusion Architecture
ComfyUI integration runs 100% locally on host hardware:
- **Zero Cloud Egress**: Media prompts and generated assets never leave the host machine without explicit operator permission.
- **Hardware & VRAM Governor**: Evaluates available VRAM before starting generations to prevent Out-Of-Memory host crashes.
- **Custom Node Auditing**: Statically inspects Python custom nodes for malicious OS commands (`os.system`, `subprocess`, `eval`) before loading.
