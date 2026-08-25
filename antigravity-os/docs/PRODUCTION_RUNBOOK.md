# ANTIGRAVITY PRODUCTION RUNBOOK & OPERATIONS GUIDE

## 1. Quickstart & Verification Commands

To run and verify the entire autonomous platform and multimodal pipeline locally:

```bash
# 1. Typecheck strict TypeScript codebase (0 errors)
npm.cmd run typecheck

# 2. Run Multimodal Pipeline Validation (Image, Audio, Video, 3D)
npx.cmd tsx scripts/multimodal-validation.ts

# 3. Run MCP, Figma & Filesystem Security Hardening Suite
npx.cmd tsx scripts/mcp-figma-validation.ts

# 4. Run UI/UX Case Study, Accessibility & Link Integrity Suite
npx.cmd tsx scripts/ui-ux-accessibility-validation.ts

# 5. Run Full 15-Stage Master Production Certification
npx.cmd tsx scripts/certify-master-production.ts
```

---

## 2. Environment Variables Configuration

| Variable | Description | Default / Fallback |
| :--- | :--- | :--- |
| `OLLAMA_BASE_URL` | Local GPU LLM endpoint | `http://localhost:11434` (Free / Local) |
| `DEEPSEEK_API_KEY` | DeepSeek AI API Key | Fallback to Ollama if absent |
| `OPENROUTER_API_KEY` | OpenRouter Mesh Router | Fallback to Ollama if absent |
| `FIGMA_ACCESS_TOKEN` | Figma REST API Access Token | Returns `AUTH_REQUIRED` + semantic tokens |
| `DATABASE_URL` | Supabase / PostgreSQL URI | Local Prisma SQLite / Memory |
| `GCP_PROJECT_ID` | Google Cloud Project ID | `project-90782244-871c-4a41-9a2` |

---

## 3. Incident Management & Disaster Recovery

* **Circuit Breaker Reset**: In the event of temporary cloud provider outages, circuit breakers automatically attempt recovery after 30 seconds.
* **Canary Deployment Rollback**: If an error rate exceeds 2% in canary traffic progression (5% -> 25% -> 50% -> 100%), the `CanaryOrchestrator` triggers immediate automatic rollback.
