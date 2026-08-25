# 🤖 Antigravity AI Mesh & Resource-Aware Intelligent Routing Architecture

Antigravity OS v5.1 utilizes a tiered, low-latency, and fault-tolerant AI mesh routing architecture combining fast local engines, layered large-model engines, and cloud swarms, orchestrated by an intelligent resource-aware routing engine.

```text
                                ANTIGRAVITY AI ROUTER (:8080)
                                              │
                         ┌────────────────────┼────────────────────┐
                         │                    │                    │
                    OLLAMA ENGINE       AIRLLM ENGINE        CLOUD MESH
                 (http://127.0.0.1:11434) (http://127.0.0.1:8000) (OpenRouter / APIs)
                         │                    │                    │
                   ⚡ FAST LOCAL       🧠 LARGE MODELS       🌐 GLOBAL SWARM
                 (qwen2.5-coder:14b)  (Qwen/Qwen3-32B)     (nemotron-3.5, deepseek)
                 (VRAM: ~3.8 GB)      (VRAM: <4.5 GB)      (VRAM: 0 MB Remote)
                         │                    │                    │
                         └────────────────────┼────────────────────┘
                                              │
                                 INTELLIGENT ROUTING & ESCALATION
                                              │
                              ┌───────────────┴───────────────┐
                              │                               │
                       RESOURCE GUARD                  SMART FALLBACK
                     (RAM / VRAM Safe)             (Capability-Based)
```

---

## ⚡ Active Local & Remote Providers

| Provider | Type | Active Model | Parameter Class | Role & Tier | VRAM Usage | Latency Profile |
|---|:---:|---|:---:|---|:---:|:---:|
| **Ollama** | `Local Fast` | `qwen2.5-coder:14b` / `7b` | 14.7B / 7.6B | Real-time coding, autocomplete, fast edits | ~3.8 GB / ~2.2 GB | ~3.5 tok/s |
| **AirLLM** | `Local Large` | `Qwen/Qwen3-32B` | 32.5B | 32B–70B deep reasoning, layered block streaming | <4.5 GB | ~282 tok/s (Stream) |
| **OpenRouter** | `Cloud Free` | `nvidia/nemotron-3.5-lightning:free` | 120B-A12B MoE | Distributed swarm fallback & zero-cost cloud mesh | 0 MB | >400 tok/s |

---

## 🧭 Intelligent Request Classification Categories

Every request is categorized across multi-label classification vectors:
1. **`FAST_LOCAL`**: Low-latency snippet generation, boilerplate, formatting, single-file edits.
2. **`LOCAL_LARGE`**: 32B+ parameter local reasoning, architectural design, low-VRAM layered inference.
3. **`CLOUD`**: High-stakes production verification, cloud-quality review, zero local footprint.
4. **`VISION`**: Multimodal visual inspection, screenshot QA (`minicpm-v:latest`).
5. **`LONG_CONTEXT`**: Deep repository analysis, document reasoning (>3.5K to 128K tokens).
6. **`CODE`**: Polyglot software synthesis (TypeScript, Python, React, SQL, Rust, Go).
7. **`REASONING`**: Multi-step mathematical proof, algorithm design, consensus protocols.
8. **`CREATIVE`**: System documentation, user guides, interface copywriting.
9. **`AGENTIC`**: Autonomous subagent swarm delegation and multi-role workflows.
10. **`TOOL_USE`**: MCP function calling, local terminal execution, filesystem editing.

---

## 🛡️ Resource-Aware Memory Safety Guard

Before selecting any local model, the router inspects:
- **GPU VRAM Capacity & Headroom**: Ensures model VRAM fits within the 6,144 MB hardware envelope.
- **Host RAM Availability**: Compares available system RAM against `AIRLLM_MIN_AVAILABLE_RAM_GB` (configurable, default 4.0 GB).
- **Graceful Escalation**: If host RAM is below threshold during a `LOCAL_LARGE` request, the router automatically refuses local AirLLM execution to avoid OOM lockup and escalates cleanly to the OpenRouter cloud mesh.

---

## 🔀 Capability-Based Smart Fallback Chains

Instead of blind static failovers, fallback priorities are matched to task capability:

- **`FAST_LOCAL`**: `Ollama (Primary)` → `OpenRouter (Secondary)` → `AirLLM (Tertiary)`
- **`LOCAL_LARGE`**: `AirLLM (Primary)` → `OpenRouter (Secondary)` → `Ollama (Tertiary)`
- **`CLOUD`**: `OpenRouter (Primary)` → `Ollama (Secondary)` → `AirLLM (Tertiary)`
- **`VISION`**: `Ollama minicpm-v (Primary)` → `OpenRouter (Secondary)` → `Google Gemini Pool (Tertiary)`
- **`LONG_CONTEXT`**: `AirLLM up to 16K (Primary)` → `OpenRouter up to 128K (Secondary)` → `Ollama (Tertiary)`

---

## 🎛️ User Routing Preferences

Users can customize inference priorities via `user_preference`:
- **`BALANCED`** *(Default)*: Smart adaptive routing optimizing latency, memory safety, and model capability.
- **`FAST`**: Prioritizes lowest latency (`qwen2.5-coder:7b` / fastest cached model).
- **`QUALITY`**: Prioritizes state-of-the-art architectures (AirLLM 32B / OpenRouter 120B).
- **`LOCAL_ONLY`**: Strictly restricts execution to local hardware (Ollama & AirLLM).
- **`CLOUD_ONLY`**: Strictly routes requests to cloud providers (zero local memory usage).
- **`CHEAPEST`**: Zero-cost tier prioritization ($0 token expenditure).

---

## 📊 Live Endpoints & Control Center

- **AI Routing Gateway**: `http://127.0.0.1:8080/v1/chat/completions`
- **Routing Decision Dry-Run**: `http://127.0.0.1:8080/api/routing/decision`
- **Routing Control Center Telemetry**: `http://127.0.0.1:8080/api/routing/control-center`
- **Dashboard Interface**: `http://127.0.0.1:8080/dashboard`
- **Direct Ollama**: `http://127.0.0.1:11434`
- **Direct AirLLM**: `http://127.0.0.1:8000`
