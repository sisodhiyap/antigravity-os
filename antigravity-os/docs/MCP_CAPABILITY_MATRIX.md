# ANTIGRAVITY MCP (MODEL CONTEXT PROTOCOL) CAPABILITY MATRIX

## 1. Verified Installed MCP Servers

| MCP Server | Domain | Tools Count | Transport | Status | Auth Required | Capabilities Verified |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **StitchMCP** | UI/UX & Design Systems | 15 | `STDIO` | `HEALTHY` | No | Screen generation, variant synthesis, DESIGN.md exports |
| **blender** | 3D & Procedural Meshes | 22 | `STDIO` | `HEALTHY` | No | Python 3D execution, Poly Haven HDRIs/materials, renders |
| **playwright** | Browser QA & E2E Testing | 18 | `STDIO` | `HEALTHY` | No | Chromium navigation, snapshot, screenshot, assertions |
| **prisma-mcp-server** | Database & ORM Modeling | 3 | `STDIO` | `HEALTHY` | No | Migration status, migrations, Prisma Studio UI |
| **github** | Version Control & CI/CD | 26 | `STDIO` | `HEALTHY` / `AUTH_REQUIRED` | Yes | PR creation, branch management, issue tracking |
| **memory** | Knowledge Graph Memory | 8 | `STDIO` | `HEALTHY` | No | Entity graph, observation creation, semantic node search |
| **puppeteer** | Headless Web Automation | 7 | `STDIO` | `HEALTHY` | No | Page navigation, screenshot capture, DOM evaluation |
| **mobbin & visualization** | UX Patterns & Charts | 4 | `STDIO` | `HEALTHY` | No | Screen flow inspection, multi-axis chart rendering |

---

## 2. MCP Ecosystem Architecture & Security Rules

### A. Filesystem Access
- Native Antigravity filesystem tools (`view_file`, `write_to_file`, `replace_file_content`, `grep_search`) execute directly with sub-millisecond latency.
- Hardened sandbox security actively denies any attempts to traverse outside designated workspace directories (`../../`) and blocks raw access to sensitive credential files (`.env`, `id_rsa`, `*.pem`).

### B. Figma Integration
- Configured with `figma-adapter.ts`.
- Extracts live design tokens (colors, typography scales, spacing, radii) and 1440px/375px frames.
- If `FIGMA_ACCESS_TOKEN` is not supplied, safely returns `AUTH_REQUIRED` and provides WCAG 2.2 AA calibrated fallback tokens.
