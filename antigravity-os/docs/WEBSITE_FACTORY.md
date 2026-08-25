# Antigravity OS v5.1 — Website Factory

---

## What It Does

Takes a natural-language request and produces a fully-routed, code-synthesized website under Next.js — with real images, video, audio, AI chat, SEO, and deployment bindings.

---

## One-Shot Command

Via the Command Bar (⌘K):
```
Build me a futuristic AI portfolio website
```

Or via API:
```bash
POST /api/factory/build
Authorization: Bearer <token>

{
  "name": "my-portfolio",
  "type": "portfolio",
  "prompt": "Futuristic AI portfolio for a senior UI/UX designer",
  "theme": "cyber"
}
```

---

## Full Pipeline

```
1.  ANALYZE REQUEST
    → Extract: name, type, theme, prompt

2.  CREATE BLUEPRINT (.antigravity/projects/[name]/project.json)
    → pages, components, features, designSystem, assets

3.  GENERATE DESIGN TOKENS
    → primaryColor, secondaryColor, accentColor, bgGradient, fontFamily

4.  GENERATE IMAGE (via UnifiedImageService)
    → Programmatic SVG (active default) or cloud AI model
    → Registered in asset-registry with provenance

5.  GENERATE VIDEO (via VideoService)
    → Remotion WebM timeline manifest (local)
    → AI video: [NOT_CONFIGURED]

6.  GENERATE AUDIO (via AudioService)
    → Local WAV synthesis

7.  SYNTHESIZE CODE (WebsiteCodeSynthesizer)
    → Full TSX page with: Nav, Hero, Video, Features, Gallery, AI Chat, Footer
    → String-safe template rendering (JSX expressions, no unescaped quotes)

8.  WRITE TO ROUTE
    → src/app/generated/[project-name]/page.tsx
    → Instantly accessible at /generated/[project-name]

9.  WRITE BLUEPRINT
    → .antigravity/projects/[name]/project.json

10. LOG ASSET IN DATABASE
    → prisma.asset.create (CODE/TSX type)

11. DEPLOY (POST /api/factory/deploy)
    → Vercel / Netlify live deployment bindings verified
```

---

## API Reference

### Build Website
```
POST /api/factory/build
```
**Body:**
```json
{
  "name": "string (required)",
  "prompt": "string (required)",
  "type": "portfolio | landing | agency | studio",
  "theme": "cyber | ocean | aurora | fire"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "projectName": "my-portfolio",
    "url": "/generated/my-portfolio",
    "codePath": "src/app/generated/my-portfolio/page.tsx",
    "imageUrl": "/generated-assets/images/img_*.svg",
    "videoUrl": "/generated-assets/video/vid_*.webm",
    "timestamp": "2026-08-25T..."
  }
}
```

### List Projects
```
GET /api/factory/projects
```

### Deploy Project
```
POST /api/factory/deploy
Body: { "projectName": "my-portfolio", "provider": "Vercel" }
```

---

## Themes

| Theme | Primary | Secondary | Gradient |
|-------|---------|-----------|----------|
| `cyber` | Cyan `#00f0ff` | Purple `#7000ff` | cyan → purple |
| `ocean` | Blue `#0ea5e9` | Cyan `#06b6d4` | blue → cyan |
| `aurora` | Emerald `#10b981` | Teal `#14b8a6` | emerald → teal |
| `fire` | Orange `#f97316` | Yellow `#eab308` | orange → yellow |

---

## Website Types

| Type | Description |
|------|-------------|
| `portfolio` | Personal work showcase with gallery, case studies |
| `landing` | Single-page marketing with CTA, features, pricing |
| `agency` | Multi-section agency with team, services, portfolio |
| `studio` | Creative studio with media showcase, process |

---

## Generated Website Features

Every generated website includes:
- ✅ Sticky navigation header
- ✅ Hero section with gradient heading + CTA
- ✅ Video showcase (WebM with playback controls)
- ✅ Feature cards grid
- ✅ Image gallery (AI-generated or Programmatic SVG)
- ✅ AI Chat panel (backed by `/api/todo-notes/ai` → Central AI Router)
- ✅ Footer with year + project name
- ✅ Fully responsive (Tailwind CSS, audited 375px–1440px)
- ✅ Dark mode by default
- ✅ Glass-morphism aesthetic

---

## Capability Status & Provenance

| Feature | Status | Notes |
|---------|:------:|-------|
| Programmatic SVG Images | `[LIVE]` | Deterministic vector synthesis |
| Cloud AI Images (DALL-E) | `[NOT_CONFIGURED]` | Needs active OpenAI billing/key |
| Remotion Video Manifests | `[LIVE]` | Client WebM compositor |
| AI Video Models (Runway) | `[NOT_CONFIGURED]` | Needs video provider API key |
| Vercel Deployment | `[LIVE]` | Token verified (`sisodhiyaprashant35-6364`) |
| GitHub Repository Push | `[LIVE]` | Token verified (`sisodhiyap`) |
| Netlify Deployment | `[LIVE]` | Token verified (`Prashant sisodhiya`) |
| GitHub Pages | `[NOT_SUPPORTED]` | Dynamic Next.js SSR/API routes incompatible |
