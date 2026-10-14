# ANTIGRAVITY OS — PERSONAL INTELLIGENCE V1 ARCHITECTURE DISCOVERY & SPECIFICATION

## 1. Executive Overview & Baseline State
- **Baseline Git Commit:** `834e4240918f6c7e00eeca222b133055de68f034` (`834e424`) on `main`
- **Working Tree:** Clean, verified immutable baseline
- **Frozen V7 Core:** Verified untouched and protected by Gate 60 invariant checks
- **Existing Orchestrator:** Hermes Agent (`src/plugins/hermes/`) with 60/60 passing verification gates
- **Existing Decider:** Strands Decider (`src/server/ai/strands-decider.ts`) providing sub-5ms System One decisions
- **Existing Router:** Central AI Router (`src/server/ai/router.ts`) supporting 8 registered providers (Ollama, OpenAI, Gemini, Groq, Nvidia, DeepSeek, OpenRouter, AirLLM)
- **Existing Tool Gateway:** `src/server/tools/tool-gateway.ts` & `mcp-registry.ts` with strict capability permissions and audit logging
- **Existing Persistence:** SQLite via Prisma (`prisma/schema.prisma` and `src/server/db.ts`) with `%APPDATA%/AntigravityOS/data/` persistent storage

## 2. Architectural Boundaries & Non-Negotiables
1. **No Duplicate Orchestrator:** Personal Intelligence delegates all agent tasks to Hermes (`HermesAgent`, `HermesPlanner`, `HermesToolRegistry`, `HermesApprovalGate`).
2. **No Parallel Provider Router:** All model completions and provider selections flow strictly through `CentralAIRouter.getInstance()`.
3. **No Secondary Tool Bus:** Tool discovery and invocation route through `mcpRegistry` and `toolGateway`.
4. **Local-First Enforcement:** Default routing evaluates local availability first (Ollama, AirLLM). Local-only privacy policy strictly forbids outbound cloud requests.
5. **Zero Secret Leakage:** All persisted memories, prompts, and audit records pass through `HermesPolicy.redactSecrets`.
6. **Bounded Autonomy:** Read-only tasks (project summaries, diagnostics, test runs) can run under auto-authorization; all mutating or high-risk tasks require explicit human approval via `HermesApprovalGate`.

## 3. Data Architecture & Schema Additions
Personal Intelligence introduces five complementary models into Prisma:
- `PersonalMemory`: Structured memory records with category, sensitivity, expiration, confidence, and provenance.
- `IntelligenceConversation`: Dedicated thread for Personal AI conversations.
- `IntelligenceMessage`: Chat messages with model provenance, provider attribution, and tool call traces.
- `IntelligenceTask`: Bounded autonomous task records tracking lifecycle and evidence.
- `IntelligenceApproval`: Pending or resolved approval requests for dangerous actions.

## 4. Route Map
- Frontend Workspace: `/intelligence` (Responsive Black-and-Gold Workspace)
- API Routes:
  - `GET/POST /api/intelligence/conversations`
  - `GET/DELETE /api/intelligence/conversations/[id]`
  - `POST /api/intelligence/conversations/[id]/messages`
  - `GET/POST /api/intelligence/memories`
  - `PATCH/DELETE /api/intelligence/memories/[id]`
  - `POST /api/intelligence/memories/search`
  - `POST /api/intelligence/memories/export`
  - `GET/POST /api/intelligence/tasks`
  - `GET /api/intelligence/tasks/[id]`
  - `POST /api/intelligence/tasks/[id]/cancel`
  - `GET /api/intelligence/approvals`
  - `POST /api/intelligence/approvals/[id]/decision`
  - `GET /api/intelligence/context`
  - `GET /api/intelligence/capabilities`
  - `GET /api/intelligence/health`

## 5. Security & Privacy Model
- **Local-Only:** Cloud calls are completely blocked. Returns local execution or truthful offline synthesis.
- **Local-Preferred:** Uses Ollama/AirLLM if healthy; falls back to cloud only if configured and permitted.
- **Cloud-Permitted:** Uses Central AI Router capability chain.
- **Ask-Every-Time:** Triggers interactive approval request before outbound cloud communication.
- **Zero-Trust Input Containment:** All memory text and external tool output treated as passive data; AST injection scan blocks prompt injection.
