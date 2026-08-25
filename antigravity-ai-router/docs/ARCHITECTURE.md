# ANTIGRAVITY AI ROUTER ARCHITECTURE

```mermaid
graph TD
    Client[Antigravity IDE / Agent] -->|POST /v1/chat/completions| Gateway[Router Server (Port 8080)]
    Gateway --> Classifier[Task Classifier]
    Classifier --> Selector[Model Selector]
    Selector --> Fallback[Fallback Engine]
    
    Fallback -->|Level 1| Ollama[Local Ollama (Port 11434)]
    Fallback -->|Level 2| OmniRoute[OmniRoute Free Gateway (Port 3000)]
    Fallback -->|Level 3| Native[Antigravity Native Quota]

    Ollama -->|qwen2.5-coder:14b / deepseek-r1:7b| Resp1[Local Response]
    OmniRoute -->|341 Free Provider Pools| Resp2[Cloud Response]
    Native -->|Premium Quota| Resp3[Native Response]

    Resp1 --> Quality[Quality Verification & Repair Check]
    Resp2 --> Quality
    Resp3 --> Quality

    Quality -->|Pass| Client
    Quality -->|Fail| Fallback
```

## System Components
1. **Task Classifier (`classifier.ts`)**: Categorizes requests into EASY, MEDIUM, and HARD complexities.
2. **Model Selector (`selector.ts`)**: Picks the optimal model enforcing local-first priority.
3. **Fallback Engine (`fallback-engine.ts`)**: Recovers from 429 rate limits, timeouts, and quality failures with exponential backoff.
4. **Quota Manager (`quota-manager.ts`)**: Tracks request counts, token estimates, latencies, and provider health.
5. **Quality Checker (`quality-checker.ts`)**: Ensures syntax correctness and prevents unfulfilled placeholder code.
