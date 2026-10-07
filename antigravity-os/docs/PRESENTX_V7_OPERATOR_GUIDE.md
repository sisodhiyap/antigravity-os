# PRESENTX STUDIO — OPERATOR & DEVELOPER GUIDE

**Platform**: Antigravity OS V7.0  
**Application**: PresentX Studio  
**Target Audience**: Systems Engineers, DevOps, AI Operators  

---

## 1. Development & Runtime Commands

### Run Local Development Server
```powershell
npm run dev
# Open http://localhost:3000/presentx
```

### Typecheck Entire Codebase
```powershell
npm run typecheck
```

### Production Build
```powershell
npm run build
```

### Execute Master PresentX Verification Suite
```powershell
npm run verify:presentx
# or
npx tsx scripts/verify-presentx-v7.ts
```

### Execute Independent PresentX Raw-Evidence Verifier
```powershell
npm run verify:presentx:independent
# or
npx tsx scripts/independent-presentx-v7.ts
```

### Execute Full OS Master Reality Suite
```powershell
npm run verify:v7:master
```

---

## 2. API Endpoints Reference

| Route | Method | Purpose | Payload Example |
| :--- | :---: | :--- | :--- |
| `/api/presentx/projects` | `GET` | List all saved presentations or fetch by `?id=...` | Query param `id` |
| `/api/presentx/projects` | `POST` | Create / Update presentation project | `{ project: PresentationProject }` |
| `/api/presentx/projects` | `DELETE`| Remove presentation from disk vault | Query param `id` |
| `/api/presentx/generate` | `POST` | Autonomous generation pipeline | `{ rawIdea: string, visualDirection?: string, slideCount?: number }` |
| `/api/presentx/ai` | `POST` | Execute slide-level AI transformations | `{ project: PresentationProject, request: AiSlideCommandRequest }` |
| `/api/presentx/export` | `POST` | Multi-format exporter (`HTML`, `PPTX`, `JSON`) | `{ project: PresentationProject, format: "PPTX" }` |
| `/api/presentx/audit` | `POST` | Real-time WCAG 2.2 AA and quality score | `{ project: PresentationProject }` |
| `/api/presentx/templates`| `GET` | Fetch 6 built-in pro templates | N/A |

---

## 3. Storage & Vault Layout
Presentations are stored locally in the isolated workspace vault:
`workspaces/presentx-vault/[project-id].json`

Each file contains complete slide architecture, design tokens, story graph, media bible, and SHA-256 cryptographic provenance signatures.
