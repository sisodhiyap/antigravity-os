# Antigravity OS v7.0 — Productization Specifications & Operator Guides

## 1. Operator Console Guide (`docs/V7_OPERATOR_GUIDE.md`)
> **Command Center Workspaces**: 18 Focused Views (Command Center, Projects, Import, Product Twin, Design Intelligence, Architecture, Compiler, Runtime, Reality, Security, Self-Healing, Evolution, Models, Integrations, Plugins, Evidence, Reports, Settings)  
> **Keybindings**: \`Ctrl+K\` (Command Palette), \`Ctrl+B\` (Build Plan), \`Ctrl+Shift+R\` (Reality Test)  

## 2. Plugin & Adapter Protocol (`docs/V7_PLUGIN_PROTOCOL.md`)
> **Lifecycle**: \`DISCOVER\` $\rightarrow$ \`REGISTER\` $\rightarrow$ \`ISOLATE\` $\rightarrow$ \`VALIDATE\` $\rightarrow$ \`SECURITY TEST\` $\rightarrow$ \`REALITY TEST\` $\rightarrow$ \`OWNER APPROVAL\` $\rightarrow$ \`PROMOTE\`  
> **Boundary Invariant**: Plugins run strictly in isolated sandboxes and cannot mutate the Frozen V7 Core.  

## 3. Multi-Model Routing Matrix (`docs/V7_MODEL_ROUTING.md`)
> **Model Hierarchy**: Vision (Ollama / Cloud) $\rightarrow$ Code (qwen2.5-coder:7b) $\rightarrow$ Reasoning $\rightarrow$ Document $\rightarrow$ Local Ollama GPU Fallback  
> **Failover Cascade**: 0 Context Lost, graceful degradation with deterministic error recording.  

## 4. Final Production Gate Checklist (`docs/V7_PRODUCTION_GATE.md`)
> **Mandatory Criteria**: 100% Tri-Layer State Consistency (UI $\leftrightarrow$ API $\leftrightarrow$ DB), 0 Security Vulnerabilities, 0 Mock Dependencies, Cryptographic Immutability (\`BEFORE == AFTER\`).  
