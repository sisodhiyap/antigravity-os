# 🛰️ Antigravity OS v5.3 — Capability Graph & Resource Guards Specification

> **Module**: Capability Discovery & Graph (`src/capabilities/`)  
> **Telemetry Source**: Host Hardware (CPU, GPU, VRAM, RAM), Model Daemon, MCP Servers  

---

## 1. Live Capability Graph Schema

```
                      ┌─────────────────────────┐
                      │  Live Host Environment  │
                      └────────────┬────────────┘
                                   │ Real-time Probing
            ┌──────────────────────┼──────────────────────┐
            ▼                      ▼                      ▼
┌──────────────────────┐┌──────────────────────┐┌──────────────────────┐
│  Hardware Telemetry  ││  AI Model Registry   ││   MCP Tool Bridges   │
│ • RTX 3060 6GB VRAM  ││ • Ollama (Local GPU) ││ • Filesystem MCP     │
│ • Ryzen 9 16 Cores   ││ • Qwen 7B (31 tok/s) ││ • Playwright Browser │
│ • 16GB Total RAM     ││ • AirLLM (Probed)    ││ • GitHub & Blender   │
└──────────────────────┘└──────────────────────┘└──────────────────────┘
```

---

## 2. Resource-Aware Autonomy Guards
Before executing any graph node:
1. **Free RAM Check**: Asserts `freeRamGb >= 1.0 GB`. If below threshold, queues tasks or falls back to in-process memory-efficient generation.
2. **GPU VRAM Check**: Validates model memory footprint against available 6.0 GB VRAM.
3. **Execution Concurrency Limit**: Defaults to max 4 concurrent tasks to prevent CPU thrashing.
