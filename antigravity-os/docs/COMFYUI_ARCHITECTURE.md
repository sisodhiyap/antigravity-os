# COMFYUI LOCAL GENERATIVE MEDIA FABRIC — ARCHITECTURE

```text
================================================================================
           ANTIGRAVITY OS v7.0 — COMFYUI FABRIC ARCHITECTURE
================================================================================
```

## 1. Overview & System Placement

ComfyUI serves as the primary local generative media engine for Antigravity OS v7.0 across Image, Video, Audio, and 3D modalities, operating as an isolated plugin in `src/plugins/comfyui/` above the frozen V7 core.

```text
                          V7 FROZEN CORE
                                │
                                ▼
                           HERMES AGENT
                      (Media Director Engine)
                                │
                                ▼
                     MEDIA INTELLIGENCE ROUTER
                                │
                                ▼
                         COMFYUI ADAPTER
                                │
                                ▼
                      LOCAL COMFYUI SERVER
                                │
                                ▼
                         WORKFLOW ENGINE
                                │
                                ▼
                            LOCAL GPU
                     (VRAM / Resource Governor)
                                │
                                ▼
                         GENERATED MEDIA
                   (Image, Video, Audio, 3D)
                                │
                                ▼
                    QUALITY / SECURITY / REALITY
                                │
                                ▼
                         EVIDENCE LEDGER
```

## 2. Core Subsystems

1. **`ComfyUIAdapter` (`src/plugins/comfyui/ComfyUIAdapter.ts`)**: High-level orchestrator mediating between Hermes Media Director and local hardware.
2. **`ComfyUIHealth` (`src/plugins/comfyui/ComfyUIHealth.ts`)**: Hardware probe detecting OS, GPU, VRAM, and server status.
3. **`ComfyUIResourceManager` (`src/plugins/comfyui/ComfyUIResourceManager.ts`)**: VRAM governor managing `SAFE`, `NORMAL`, `HEAVY`, and `CRITICAL` tiers.
4. **`ComfyUIModelRegistry` (`src/plugins/comfyui/ComfyUIModelRegistry.ts`)**: Catalog of installed local models (Flux, SDXL, Wan, LTX, SVD, ACE-Step, TripoSR).
5. **`ComfyUIWorkflowRegistry` (`src/plugins/comfyui/ComfyUIWorkflowRegistry.ts`)**: Built-in and custom workflow DAG templates.
6. **`ComfyUIWorkflowEngine` (`src/plugins/comfyui/ComfyUIWorkflowEngine.ts`)**: Dynamic parameter injection and schema validator.
7. **`ComfyUIQueueManager` (`src/plugins/comfyui/ComfyUIQueueManager.ts`)**: Persistent local generation queue with retry and cancellation.
8. **`ComfyUIOutputManager` (`src/plugins/comfyui/ComfyUIOutputManager.ts`)**: Multi-format exporter and provenance tagger.
9. **`ComfyUISandbox` (`src/plugins/comfyui/ComfyUISandbox.ts`)**: Project isolation preventing path traversal.
10. **`ComfyUISecurity` (`src/plugins/comfyui/ComfyUISecurity.ts`)**: Custom node static analyzer and prompt-injection defender.
11. **`ComfyUIRealityBridge` & `ComfyUIEvidenceBridge`**: Zero-trust Reality Kernel claim proof and hash ledger recording.
