# Antigravity OS v7 — IBM Granite 4.2 Dynamic Model Routing

**Subsystem**: `src/plugins/granite/GraniteModelRouter.ts`

---

## 1. Routing Decision Logic

The Model Router determines the optimal execution tier across 8 input dimensions:

1. **Task Specialization**: Architecture vs. Code vs. Story vs. Diagnostics.
2. **Reasoning Intensity**: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
3. **Context Length**: Context requirements up to 32,768 tokens.
4. **Tool Requirement**: Native tool-calling support.
5. **Latency Bounds**: Real-time interactive ($< 50\text{ms}$) vs. batch.
6. **VRAM / RAM Headroom**: Measured by `GraniteHardwareGovernor`.
7. **Privacy Policy**: `STRICT_LOCAL` vs. `PERMISSIVE`.
8. **User Overrides**: Explicit manual model selection.

---

## 2. Fallback Cascade Architecture

If any model tier encounters hardware constraints or timeouts, the router fails over automatically without disrupting project state:

```text
Tier 1: IBM Granite 4.2 (8B / 30B MoE)
   │
   ▼ (if unavailable / OOM risk)
Tier 2: IBM Granite 4.2 3B (Fast / Low Memory)
   │
   ▼ (if backend unavailable)
Tier 3: Ollama Primary Daemon (Qwen / Llama)
   │
   ▼ (if offline)
Tier 4: In-Process Deterministic AST Heuristic Engine
```
