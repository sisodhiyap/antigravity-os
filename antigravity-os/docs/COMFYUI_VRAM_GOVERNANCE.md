# COMFYUI DYNAMIC VRAM & RESOURCE GOVERNANCE

```text
================================================================================
           ANTIGRAVITY OS v7.0 — VRAM GOVERNOR SPECIFICATION
================================================================================
```

## 1. Resource Tiers

- **`SAFE` (< 60% VRAM)**: Direct execution at maximum quality and resolution.
- **`NORMAL` (60% - 85% VRAM)**: Standard execution with active VRAM monitoring.
- **`HEAVY` (85% - 95% VRAM)**: Automatic resolution downscaling, frame reduction, or FP8 quantization applied.
- **`CRITICAL` (> 95% VRAM)**: Over-budget task safely rejected or held in queue to prevent system Out-Of-Memory crashes.

## 2. Unlimited Local Mode

Local execution operates under `LOCAL_UNLIMITED_MODE`: no artificial quotas, limited solely by hardware thermals, VRAM, and RAM availability.
