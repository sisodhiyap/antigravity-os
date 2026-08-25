# Antigravity OS v5.1 — Architecture

> **Reality-First, Local-First, Sovereign Engineering Operating System**

---

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│               ANTIGRAVITY OS v5.1                       │
│              SOVEREIGN CONSTITUTION                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         GLOBAL COMMAND BAR (⌘K)                  │  │
│  │  "Build me a website" → Master Orchestrator      │  │
│  └──────────────────────────────────────────────────┘  │
│                         │                               │
│              /api/orchestrate/command                   │
│                         │                               │
│  ┌──────────────────────┼──────────────────────────┐   │
│  │                MASTER ORCHESTRATOR               │   │
│  │  Intent Classification → Subsystem Routing       │   │
│  └──────┬───────┬───────┬────────┬─────────┬───────┘   │
│         │       │       │        │         │            │
│    ┌────▼──┐ ┌──▼──┐ ┌──▼──┐ ┌──▼───┐ ┌──▼───┐        │
│    │ WEBSITE│ │ AI  │ │MCP  │ │ASSET │ │DEPLOY│        │
│    │FACTORY │ │ROUTER│ │HUB  │ │ENGINE│ │  MGR │        │
│    └────────┘ └─────┘ └─────┘ └──────┘ └──────┘        │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │              AGENT SWARM (10 Roles)               │  │
│  │  Architect │ Builder │ QA │ Security │ DevOps     │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │              MULTIMODAL ENGINE                    │  │
│  │  Image │ Video │ Audio │ 3D │ SVG │ Code          │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │              DATA LAYER                           │  │
│  │  SQLite/Prisma │ WAL Mode │ Session Auth          │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Comprehensive Capability Matrix

| Capability | Status | Provenance / Notes |
|------------|:------:|-------------------|
| **AI Router** | `[LIVE]` | Mesh router active on port 8080 (Intelligent Multi-Label Classification, Resource Guard, Smart Fallbacks) |
| **Direct Ollama** | `[LIVE]` | Direct port 11434 active (qwen2.5-coder:14b / 7b) |
| **AirLLM Large Engine** | `[LIVE]` | Direct port 8000 active (Qwen/Qwen3-32B, layered low-VRAM) |
| **OpenRouter Cloud Swarm** | `[LIVE]` | Free tier remote fallback (nvidia/nemotron-3.5-lightning:free) |
| **Image Generation** | `[LIVE]` | Programmatic SVG (Cloud AI: `[NOT_CONFIGURED]`) |
| **Video Generation** | `[LIVE]` | Remotion WebM manifest (AI Video: `[NOT_CONFIGURED]`) |
| **Audio Generation** | `[LIVE]` | Programmatic WAV synthesizer (Cloud AI: `[NOT_CONFIGURED]`) |
| **3D Generation** | `[LIVE]` | Procedural GLTF synthesizer (Cloud AI: `[NOT_CONFIGURED]`) |
| **Agentic Swarm** | `[LIVE]` | 10 registered autonomous roles |
| **Playwright QA** | `[LIVE]` | Headless Chrome browser testing (375px to 1440px) |
| **Security Sandbox** | `[LIVE]` | Zero-trust capability blocking & SQLi defense |
| **Docker Orchestrator** | `[LIVE]` | Container lifecycle management |
