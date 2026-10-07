# HERMES MEDIA DIRECTOR ORCHESTRATION

```text
================================================================================
           ANTIGRAVITY OS v7.0 — HERMES MEDIA DIRECTOR
================================================================================
```

## 1. Role of Hermes as Media Director

Hermes acts as the autonomous director translating high-level user creative requests into sandboxed ComfyUI workflow DAGs:

1. **Understand Intent**: Parses style, mood, duration, aspect ratio, and resolution.
2. **Consult Media Bible**: Ensures recurring character, lighting, and wardrobe consistency.
3. **Resource & Model Check**: Queries `ComfyUIResourceManager` to verify local VRAM headroom.
4. **Workflow Compilation**: Populates node inputs and seeds dynamically.
5. **Sandbox Dispatch**: Runs generation in an isolated directory.
6. **Reality & Quality Proof**: Validates output integrity and records evidence in `EvidenceCollector`.
