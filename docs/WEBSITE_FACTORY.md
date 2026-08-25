# Antigravity OS v5.1 — Website Factory

---

## What It Does

Takes a natural-language request and produces a fully-routed, code-synthesized website under Next.js — with real images, video, audio, AI chat, SEO, and deployment bindings.

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
