# 🚀 ANTIGRAVITY OS — Production Next.js 15 Dark Futuristic Dashboard

**Antigravity OS** is a production-grade, dark futuristic, glassmorphic telemetry and operations dashboard designed for the **Antigravity v2.0 Autonomous AI Engineering Workstation**.

Built on **Next.js 15 (App Router)**, **React 19**, **TypeScript strict**, **Tailwind CSS**, **shadcn/ui-inspired tokens**, **Framer Motion**, **TanStack Query**, and **Zustand**.

---

## 🌟 Key Architecture & Features

### 🖥️ 11 Real-Time Dashboard Cards
1. **CPU Usage**: AMD Ryzen 9 (12C / 24T) live clock, temperature, load bar, and 12 individual core spark loads.
2. **GPU Usage**: NVIDIA GeForce RTX 3060 6GB VRAM allocation gauge, compute load, fan speed, power (W), and CUDA/Tensor offload indicators.
3. **System Memory (RAM)**: 16 GB DDR4/DDR5 allocation, cached memory, buffers, pagefile/swap metrics, and 32GB expansion readiness.
4. **Local Ollama Model Hub**: Active primary model (`qwen2.5-coder:7b`), speed (t/s), latency (ms), context length (32K), and local model table (`deepseek-r1:7b`, `gemma:3-4b`, `phi4-mini`).
5. **10-Role Autonomous Swarm Roster**: Product Manager, UX Designer, Architect, Builder, QA Engineer, Security Engineer, DevOps Engineer, Creative Director, Video Producer, and Stock Researcher with real-time mission status and progress bars.
6. **Docker Containers**: Active container metrics (`postgres`, `redis`, `ai-router`, `ollama-gpu`), ports, CPU%, and memory usage.
7. **Model Context Protocol (MCP) Health**: 6 MCP servers (`prisma-mcp-server`, `StitchMCP`, `blender`, `playwright`, `puppeteer`, `github`), tool counts (81+ tools), and latency telemetry.
8. **VCS & GitHub Status**: Active repository (`sisodhiyap/Antigravity`), main branch, last commit SHA, message, pending PRs, and open issue counts.
9. **Image Generation Queue**: Stable Diffusion XL / Flux render queue, ETA counters, resolutions, and progress.
10. **Video Generation Queue**: Remotion and Blender 3D video render pipelines, FPS, aspect ratio (16:9, 9:16), and progress.
11. **Persistent Vector & Graph Memory**: Vector embeddings count, knowledge graph entities & relations, cache hit rate (94.6%), and database footprint.

---

### ⚡ Built-in Subsystems
- **Collapsible Sidebar**: Compact / expanded navigation with live hardware badges.
- **Command Palette (`Cmd/Ctrl + K`)**: Instant keyboard search and quick action execution.
- **Interactive Kernel Terminal**: Real-time log stream, command history, and built-in shortcuts (`status`, `swarm`, `gpu`, `mcp`, `test`, `clear`).
- **Real-Time Live Streaming**: Zustand + Server-Sent Events / SSE stream with pause/resume and 1s/3s refresh toggles.
- **Glassmorphism Cyber Theme**: Backdrop blur, cyan/purple/neon border glows, and dark cyberpunk aesthetic.

---

## 🛠️ Quick Start & Setup Commands

### 1. Install Dependencies
```bash
cd antigravity-os
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build & Typecheck
```bash
npm run typecheck
npm run build
npm run start
```

---

## 📁 Directory Structure
```
antigravity-os/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with sidebar, header & command palette
│   │   ├── page.tsx                # Main 11-card dashboard overview
│   │   ├── globals.css             # Cyber glassmorphism tokens & glow effects
│   │   ├── agents/page.tsx         # Dedicated Swarm Agent hub
│   │   ├── mcp/page.tsx            # Dedicated MCP Tool Registry
│   │   ├── terminal/page.tsx       # Full-screen kernel terminal console
│   │   ├── settings/page.tsx       # Hardware & AI router settings
│   │   └── api/
│   │       ├── telemetry/route.ts  # Live telemetry JSON endpoint
│   │       └── ws/route.ts         # SSE real-time streaming endpoint
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── CommandPalette.tsx
│   │   ├── cards/                  # All 11 Dashboard Cards
│   │   ├── terminal/
│   │   │   └── TerminalWidget.tsx
│   │   ├── ui/                     # Card, Badge, ProgressBar, Button
│   │   └── providers/
│   │       └── QueryProvider.tsx
│   ├── stores/                     # Zustand system & terminal stores
│   ├── types/                      # TypeScript telemetry contracts
│   └── lib/                        # Formatting utilities & mock telemetry
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
└── next.config.ts
```
