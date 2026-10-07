# COMFYUI MEDIA PROVENANCE & REALITY EVIDENCE

```text
================================================================================
           ANTIGRAVITY OS v7.0 — MEDIA PROVENANCE SPECIFICATION
================================================================================
```

## 1. Provenance Invariant

Every media asset produced by ComfyUI embeds immutable metadata:
- `assetId`
- `projectId`
- `workflowId`
- `modelId`
- `modelVersion`
- `seed`
- `parameters` (width, height, steps, cfg)
- `promptHash` (SHA-256)
- `outputHash` (SHA-256)
- `generationTimeMs`
- `hardware`
- `localOrCloud`
- `license`
- `verificationStatus`

## 2. Zero-Trust Reality Kernel Verification

Claims regarding media outputs are submitted to the V7 Reality Kernel and proven via raw execution evidence in the append-only SHA-256 ledger.
