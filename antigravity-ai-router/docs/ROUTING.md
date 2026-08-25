# ROUTING STRATEGY & POLICY

## 3-Tier Routing Hierarchy
1. **Level 1 — Local Ollama Models**:
   - `qwen2.5-coder:14b`: Default for standard coding, refactoring, unit tests.
   - `deepseek-r1:7b`: Reasoning, math, and algorithmic bug fixing.
   - `qwen2.5-coder:7b`: Autocomplete and fast inline edits.
2. **Level 2 — OmniRoute Free Gateway**:
   - Routes to legitimately available free cloud endpoints when local compute is insufficient.
3. **Level 3 — Antigravity Native Access**:
   - Reserved strictly for high-level system architecture and major multi-file refactoring.
