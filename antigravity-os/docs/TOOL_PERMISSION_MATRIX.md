# OmniCraft Tool Permission Matrix

This matrix defines the security policies and role authorizations enforced by [`src/server/tools/tool-permission-engine.ts`](file:///c:/D%20drive/Antigravity/antigravity-os/src/server/tools/tool-permission-engine.ts) across the 15 MCP servers.

---

## Action-Based Permission Matrix

| Server | Category | Allowed Roles | Default Policy Constraints |
| :--- | :--- | :--- | :--- |
| **Context7** | `CODE` | `ADMIN`, `USER`, `SUPER_ADMIN` | `READ` ONLY |
| **Fetch/Web Research** | `RESEARCH` | `ADMIN`, `USER`, `SUPER_ADMIN` | `READ` ONLY |
| **Sentry** | `OBSERVABILITY` | `ADMIN`, `SUPER_ADMIN` (RESOLVE) | `READ + RESOLVE_ISSUE` |
| **Playwright** | `BROWSER` | `QA`, `BUILDER`, `ADMIN` | `EXECUTE_TEST` ONLY |
| **Chrome DevTools** | `DEBUGGING` | `BUILDER`, `ADMIN` | `READ + DEBUG` |
| **GitHub** | `DEVELOPMENT` | `BUILDER`, `ADMIN` | `READ + BRANCH + PR` |
| **StitchMCP** | `DESIGN` | `DESIGNER`, `BUILDER`, `ADMIN` | `CREATE_DESIGN` |
| **Blender** | `3D` | `ADMIN`, `SUPER_ADMIN` | `WORKSPACE_EXECUTE` |
| **Prisma Studio** | `DATABASE` | `ADMIN`, `SUPER_ADMIN` | `READ_ONLY` |
| **Notion** | `KNOWLEDGE` | `ADMIN`, `USER`, `SUPER_ADMIN` | `READ + CREATE` |
| **Linear** | `PROJECT_MANAGEMENT` | `ADMIN`, `USER`, `SUPER_ADMIN` | `READ + CREATE_ISSUE` |
| **n8n** | `AUTOMATION` | `ADMIN`, `SUPER_ADMIN` | `LIST + EXECUTE_APPROVED_WORKFLOW` |
| **Memory Graph** | `MEMORY` | `ADMIN`, `USER`, `SUPER_ADMIN` | `READ + WRITE_PROJECT_MEMORY` |
| **Puppeteer** | `BROWSER` | `QA`, `BUILDER`, `ADMIN` | `EXECUTE_TEST` ONLY |
| **Mobbin** | `DESIGN` | `DESIGNER`, `BUILDER`, `ADMIN` | `READ` ONLY |
| **Visualization** | `MEDIA` | `ADMIN`, `USER`, `SUPER_ADMIN` | `READ` ONLY |

---

## Critical Boundary Controls

1. **Production Infrastructure (RESTRICTED)**:
   * Any server with category `DEPLOYMENT` or `OBSERVABILITY` requires `ADMIN` or `SUPER_ADMIN` roles. Standard `USER` or `GUEST` execution is blocked.
2. **Production Destructive Operations (BLOCKED)**:
   * Tools containing keywords `drop`, `delete`, `wipe`, or `truncate` targeting the `DATABASE` or `DEPLOYMENT` workspace are **statically blocked** at runtime.
3. **Secret Access Safeguards (BLOCKED)**:
   * Direct reads/writes targeting `.env` or `key.env` file paths throw an immediate `AuthorizationError` to prevent sensitive credentials leakage.
