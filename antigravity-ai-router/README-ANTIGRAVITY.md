# ANTIGRAVITY IDE — OMNIROUTE + OLLAMA CODING ROUTER

Local-first, free-tier aware, automatic fallback, quota-safe, coding-optimized AI router workstation for Antigravity IDE.

---

## 🚀 Quick Start
```bash
cd antigravity-ai-router
npx tsx src/server.ts
```

- **Dashboard**: [http://127.0.0.1:8080/dashboard](http://127.0.0.1:8080/dashboard)
- **OpenAI-Compatible API**: `http://127.0.0.1:8080/v1`
- **Telemetry API**: `http://127.0.0.1:8080/api/stats`

---

## 🛠️ Architecture Highlights
1. **Local First**: Prioritizes local Ollama models (`qwen2.5-coder:14b`, `deepseek-r1:7b`) for zero cost and zero token limit.
2. **OmniRoute Integration**: Connects to OmniRoute gateway for free cloud provider pools.
3. **Antigravity Native Reserve**: Protects native premium quotas for complex architecture only.
4. **Automatic Fallback Engine**: Recovers seamlessly from HTTP 429 rate limits, network timeouts, and code quality check failures.
5. **Quality Verification**: Enforces syntax check and repair loops.
