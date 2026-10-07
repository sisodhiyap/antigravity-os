# COMFYUI OPERATOR RUNBOOK

```text
================================================================================
           ANTIGRAVITY OS v7.0 — COMFYUI OPERATOR GUIDE
================================================================================
```

## 1. Accessing Media Studio

Open `/media` in the dashboard to access the ComfyUI generation deck.

### Modality Tabs:
- **Image**: Flux.1 Schnell (FP8), SDXL Base 1.0, ControlNet
- **Video**: Wan 2.1 Video (BF16), LTX Video (FP8), SVD
- **Audio**: ACE-Step Acoustic Synthesizer
- **3D**: TripoSR Image-to-3D Mesh Generator
- **Upscale**: RealESRGAN 4x Upscaling

## 2. Local-First & Hardware Invariant

All jobs run locally by default on local GPU/CPU. No cloud credits or external APIs are used unless explicitly toggled by the operator.

## 3. Verification Commands

Run full 30-gate test suite:
```bash
npm run verify:comfyui
```

Run independent verifier:
```bash
npm run verify:comfyui:independent
```
