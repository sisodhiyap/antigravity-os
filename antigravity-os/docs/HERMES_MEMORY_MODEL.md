# HERMES PROVENANCE-AWARE MEMORY MODEL

```text
================================================================================
           ANTIGRAVITY OS v7.0 — HERMES MEMORY SPECIFICATION
================================================================================
```

## 1. Multi-Layer Memory Architecture

Hermes maintains distinct, isolated memory spaces:

1. **Session Memory**: Ephemeral data for active objective execution.
2. **Task Memory**: Structured inputs, intermediate ASTs, and tool outputs.
3. **Project Memory**: Long-lived architectural contracts, endpoints, and schemas.
4. **Failure Memory**: Failure signatures, root causes, and verified repair candidates.
5. **Verified Experience**: Long-term memory strictly containing only `OBSERVED + EXECUTED + VERIFIED` outcomes.
6. **Model Performance**: Empirical tracking of latency, cost, and accuracy per model.

## 2. Zero-Secret Invariant

All write operations to any memory tier pass through `HermesPolicy.redactSecrets()`. API keys, tokens, JWTs, and passwords are permanently sanitized before entering storage.
