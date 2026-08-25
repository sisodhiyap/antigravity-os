# ANTIGRAVITY API & EXTERNAL PROVIDER MATRIX

## 1. Provider Health & Authentication Status

All external APIs and providers are registered with non-fabricated execution modes and explicit fallback pathways:

| Provider | Capability | Environment Key | Execution Mode | Health State | Auth State | Quota Governance | Fallback Route |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Antigravity Local Engine** | Image / Audio / Video / 3D | None (Built-in) | `LOCAL` | `HEALTHY` | `NOT_REQUIRED` | Unlimited | None (Primary Local) |
| **Ollama Local Engine** | LLM Code / Reasoning | `OLLAMA_BASE_URL` | `LOCAL` | `HEALTHY` | `NOT_REQUIRED` | Unlimited ($0 USD) | DeepSeek / OpenRouter |
| **DeepSeek API** | Deep Reasoning / Coding | `DEEPSEEK_API_KEY` | `LIVE` / `LOCAL` | `HEALTHY` | `AUTHENTICATED` | Monitored | Ollama / OpenRouter |
| **OpenRouter Mesh** | Fallback Mesh / Free Models | `OPENROUTER_API_KEY` | `LIVE` | `HEALTHY` | `AUTHENTICATED` | Monitored | Ollama Local |
| **Google Cloud BigQuery** | 1 TB/mo SQL Analytics | ADC / GCP Project | `LIVE` | `HEALTHY` | `AUTHENTICATED` | 1 TB Quota Guard | Local SQLite / Postgres |
| **Google Cloud Storage** | 5 GB Standard Storage | ADC / GCP Project | `LIVE` | `HEALTHY` | `AUTHENTICATED` | 5 GB Quota Guard | Local Public Storage |
| **OpenAI DALL-E 3** | High-Res Cloud Image Gen | `OPENAI_API_KEY` | `CONFIG_REQUIRED` | `UNKNOWN` | `UNAUTHENTICATED` | Per-Request Budget | Antigravity Native Image |
| **ElevenLabs** | Cloud Neural TTS | `ELEVENLABS_API_KEY` | `AUTH_REQUIRED` | `UNKNOWN` | `UNAUTHENTICATED` | Per-Character Budget| Antigravity Edge Audio |
| **Figma REST API** | Design Tokens & Frames | `FIGMA_ACCESS_TOKEN` | `AUTH_REQUIRED` | `UNKNOWN` | `UNAUTHENTICATED` | API Rate Limiter | StitchMCP / Semantic Tokens |

---

## 2. Circuit Breaker & Fault Tolerance Rules

1. **Failure Threshold**: 3 consecutive errors trip the circuit breaker.
2. **Cooldown Period**: 30-second automated backoff.
3. **Graceful Fallback**: Failure seamlessly transitions to local offline synthesis without bubbling unhandled exceptions to the client interface.
