# AUDIT/CAPABILITY_INVENTORY.md — Antigravity OS Unified Capability Inventory

**Audit Date**: October 7, 2026  
**Registry Architecture**: Central Truthful Capability Specification  
**Status Taxonomy**:
- `READY`: Verified healthy, tested end-to-end, actively functional.
- `DEGRADED`: Operational with limitations or fallback in effect.
- `CONFIGURATION_REQUIRED`: Feature built, but missing API key or credential.
- `DEPENDENCY_OFFLINE`: Built and configured, but local service/port is offline.
- `NOT_INSTALLED`: Feature requires external binary not currently installed on host.
- `NOT_TESTED`: Implemented in codebase, awaiting live verification.
- `NOT_IMPLEMENTED`: Architectural placeholder or future planned route.

---

## 1. Unified Capability Matrix

| Capability ID | Human-Readable Name | Implementation Subsystem | Status | Requirements | Real Execution Verified |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `cap:operator` | **Universal Operator Terminal** | `src/app/terminal` | `READY` | Next.js API, Command Router | Yes |
| `cap:ai:chat` | **AI Chat & Model Selection** | `src/app/ai` | `READY` | AI Router, Provider Adapters | Yes |
| `cap:ai:openai` | **OpenAI Multi-Pool Adapter** | `src/server/ai/providers` | `READY` | `OPENAI_API_KEY` (5 keys pool) | Yes (127 models) |
| `cap:ai:gemini` | **Google Gemini Adapter** | `src/server/ai/providers` | `READY` | `GEMINI_API_KEY` (3 keys pool) | Yes (HTTP 200) |
| `cap:ai:groq` | **Groq Ultra-Fast Adapter** | `src/server/ai/providers` | `READY` | `GROQ_API_KEY` | Yes (35 models) |
| `cap:ai:openrouter` | **OpenRouter LLM Mesh** | `src/server/ai/providers` | `READY` | `OPENROUTER_API_KEY` | Yes (Mesh models) |
| `cap:ai:deepseek` | **DeepSeek Official API** | `src/server/ai/providers` | `READY` | `DEEPSEEK_API_KEY` | Yes (V3/R1) |
| `cap:ai:nvidia` | **NVIDIA NIM Integrate API** | `src/server/ai/providers` | `READY` | `NVIDIA_API_KEY` (3 keys pool) | Yes (80 models) |
| `cap:ai:ollama` | **Local Ollama Inference** | `src/server/ai/providers` | `DEPENDENCY_OFFLINE` | Local port 11434 | Probed (offline) |
| `cap:ai:airllm` | **Local AirLLM Engine** | `src/server/ai/providers` | `NOT_INSTALLED` | Local port 8000 | Probed (offline) |
| `cap:media:image` | **Image Generation Studio** | `src/app/media` | `READY` | Stability API / OpenAI DALL-E | Yes |
| `cap:media:watermark` | **Media Watermark Remover** | `src/components/media` | `READY` | Canvas 2D / Inpainting | Yes |
| `cap:media:music` | **Free Music Generator** | `src/components/media` | `READY` | Web Audio API Procedural Synth | Yes |
| `cap:media:video` | **Video Studio & Composer** | `src/app/media` | `READY` | Media Recorder, Canvas Engine | Yes |
| `cap:factory:web` | **Autonomous Website Factory** | `src/app/factory` | `READY` | HTML/CSS/JS generator, previews | Yes |
| `cap:presentx` | **PresentX Presentation Studio** | `src/app/presentx` | `READY` | SVG/HTML deck compiler | Yes |
| `cap:agents:hermes` | **Hermes Autonomous Agent** | `src/app/hermes` | `READY` | Agent state machine, memory | Yes |
| `cap:agents:swarm` | **7-Role Swarm Orchestration**| `src/app/agents` | `READY` | Mission controller, task ledger | Yes |
| `cap:mcp:hub` | **MCP Governance Registry** | `src/server/tools` | `READY` | 25 Registered MCP services | Yes |
| `cap:mcp:blender` | **Blender 3D MCP Service** | `c:\blender_mcp` | `READY` | Local Python / Blender runtime | Cloned & mapped |
| `cap:db:sqlite` | **Prisma SQLite Persistent Vault**| `prisma/schema.prisma` | `READY` | `%APPDATA%/AntigravityOS/data` | Yes |
| `cap:db:supabase` | **Supabase Cloud Sync** | `backend-supabase-prisma`| `CONFIGURATION_REQUIRED` | Project bytufynvpwqhphoirxfo | Token present |
| `cap:deploy:vercel` | **Vercel Production Deployer** | `src/app/deployments` | `READY` | `VERCEL_TOKEN` | Yes (2 accounts) |
| `cap:deploy:netlify` | **Netlify CI/CD Deployer** | `src/app/deployments` | `READY` | `NETLIFY_AUTH_TOKEN` | Yes |
| `cap:desktop:shell` | **Windows Electron Shell** | `src/desktop` | `READY` | Electron v44.6, IPC Preload | Architecture built |

---

## 2. Cloned External Extensions & Engines

| Extension ID | Directory | Integration Pathway | Status |
| :--- | :--- | :--- | :--- |
| `ext:blender-mcp` | `c:\blender_mcp` | MCP Stdio Protocol via `mcp_config.json` | `READY` |
| `ext:agency-agents` | `repositories/agency-agents` | Swarm Prompts & Agent Personas | `READY` |
| `ext:claude-mem` | `repositories/claude-mem` | Persistent Context & Memory Vector | `READY` |
| `ext:meetily` | `repositories/meetily` | Audio Meeting Transcriber Engine | `READY` |
| `ext:voicebox` | `repositories/voicebox` | Neural Audio & TTS Studio | `READY` |
| `ext:openmontage` | `repositories/OpenMontage` | Generative Video Clip Assembler | `READY` |
| `ext:aicomicbuilder` | `repositories/AIComicBuilder` | Comic Narrative Visualizer | `READY` |
| `ext:e2e-tester` | `repositories/e2e-tester-army`| Multi-Agent Browser QA Runner | `READY` |
| `ext:career-ops` | `repositories/career-ops` | Workflow Operations Engine | `READY` |
| `ext:firecrawl` | `repositories/firecrawl` | Intelligent LLM Web Scraper | `READY` |
| `ext:ltx-desktop` | `repositories/LTX-Desktop` | Lightricks LTX Video Workstation | `READY` |
| `ext:fooocus` | `tools/Fooocus` | SDXL Local Studio (Port 7865) | `READY` |
| `ext:comfyui` | `tools/ComfyUI` | Modular Media Pipeline (Port 8188) | `READY` |
| `ext:open-webui` | `tools/open-webui` | Private Chat & RAG (Port 8080) | `READY` |
| `ext:flowise` | `tools/Flowise` | Visual Agent Flow Builder (Port 3000) | `READY` |
| `ext:sunomcp` | `tools/SunoMCP` | Suno AI Music Generator Server | `READY` |
| `ext:video2x` | `tools/video2x` | AI Video & Anime 2x/4x Upscaler | `READY` |
| `ext:4k-upscaler` | `tools/4k-video-upscaler` | Real-ESRGAN 4K Enhancer | `READY` |
