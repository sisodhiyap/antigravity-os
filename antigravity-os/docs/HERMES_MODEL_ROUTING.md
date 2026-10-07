# HERMES MULTI-MODEL ROUTING & CONSENSUS ENGINE

```text
================================================================================
           ANTIGRAVITY OS v7.0 — HERMES MODEL ROUTING SPECIFICATION
================================================================================
```

## 1. Capability-Based Routing

Hermes dynamically routes across 12 distinct capabilities:
- `VISION`: GPT-4o / Gemini 2.0 Flash / Local Multimodal
- `DOCUMENT`: Llama 3.3 70B / UIR AST Extractor
- `CODE`: Qwen 2.5 Coder 7B (Local GPU)
- `REASONING`: Llama 3.3 70B Instruct
- `PLANNING`: Llama 3.3 70B / Claude 3.5 Sonnet
- `OCR`: Gemini 2.0 Flash / Local OCR
- `PARSER`: Qwen 2.5 Coder
- `SECURITY`: Red-Team AST Auditor
- `TESTING`: Qwen 2.5 Coder / Playwright Harness
- `UI_UX`: GPT-4o / Claude 3.5 Sonnet
- `ARCHITECTURE`: Llama 3.3 70B / Claude 3.5 Sonnet
- `LOCAL_INFERENCE`: Qwen 2.5 Coder / Deterministic AST Fallback

## 2. Fallback Cascade

$$\text{PRIMARY (Local GPU)} \longrightarrow \text{SECONDARY} \longrightarrow \text{TERTIARY} \longrightarrow \text{LOCAL FALLBACK ENGINE} \longrightarrow \text{SAFE FAILURE}$$

If remote models are unreachable or rate-limited, Hermes falls back smoothly to local Ollama and local deterministic engines with 0 quality downgrade.

## 3. Multi-Model Consensus

For high-risk decisions (database migrations, schema modifications, security evaluations), Hermes queries 2+ models and computes agreement rate. A 2/3 supermajority is required to establish consensus; otherwise, the claim is marked `UNKNOWN` and flagged for additional verification.
