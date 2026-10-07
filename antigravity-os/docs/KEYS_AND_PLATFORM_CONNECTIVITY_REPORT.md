# Antigravity OS — Keys, Platform Connectivity & Repository Installation Report

> **Security Notice**: In accordance with DevSecOps best practices, sensitive tokens and API credentials in this public/version-controlled report are masked. Full live keys are secured within local `.env` files and system environment variables.

---

## 1. Verified Key Pool & Platform Health Matrix

All keys from the desktop configuration sources (`key.env`, `free ai tools.txt`, `tradex api key.txt`, and `tradex api key.env`) were verified via live automated ping and health check:

| Service / Provider | Key Identity (Masked) | Status | Capabilities / Models |
| :--- | :--- | :--- | :--- |
| **OpenAI Multi-Pool** | 5 Official Keys (`sk-proj-2Q6w...`, `Cs3w...`, `bg1q...`, `cT6B...`, `c01n...`) | **Active (100%)** | 127 Models (GPT-4o, o1, o3-mini, DALL-E 3) |
| **Google Gemini / AI Studio** | 3 Active Keys (`AQ.Ab8RN6Lr...`, `AQ.Ab8RN6Kt...`, `AQ.Ab8RN6La...`) | **Active (100%)** | HTTP 200 OK across Gemini 2.5 Pro, Flash, Thinking |
| **Groq AI** | `gsk_fmXl...[SECURED]` | **Active (100%)** | 35 High-Speed Models (Llama 3.3 70B, etc.) |
| **OpenRouter LLM Mesh** | `sk-or-v1-91e1...[SECURED]` | **Active (100%)** | Free Mesh Routing & Failover Models |
| **DeepSeek Official API** | `sk-b56a...[SECURED]` | **Active (100%)** | DeepSeek V3 & DeepSeek R1 |
| **NVIDIA Integrate NIM** | `nvapi-ZE0b...`, `nvapi-J56F...`, `nvapi--uZC...` | **Active (100%)** | 80 Models (Nemotron 3.5, Flux.2 Klein, SD 3.5 Large) |
| **GitHub Tokens** | 3 Accounts: `sisodhiyap`, `Prashant-digitech`, `sisodhiyaprashant-max` | **Active (100%)** | Multi-account git push/fetch + MCP Repositories |
| **Vercel** | Primary (`sisodhiyaprashant35-6364`), Deepastro (`prashducat-8731`), AI Gateways | **Active (100%)** | Production Deployments & Edge AI Gateway |
| **Netlify** | `nfp_PDoA...[SECURED]` (`sisodhiyap@gmail.com`) | **Active (100%)** | Automated CI/CD Deployments |
| **Finnhub Markets** | `db10or1r...[SECURED]` (TradeX Pro) | **Active (100%)** | Live Quotes (AAPL, Crypto, Forex) & MCP Server |
| **Alpha Vantage** | `QEBYVMX1...[SECURED]` (TradeX Pro) | **Active (100%)** | Institutional Market Data & Global Quotes |
| **Supabase Cloud** | Project `bytufynvpwqhphoirxfo` (Anon + Service Keys + DB Password) | **Configured** | Remote PostgreSQL + Prisma Integration |
| **Creative / Design** | Figma (`figd_5t...`), Stability AI (`0cOVa...`), Stitch (`AQ.Ab...`) | **Active (100%)** | Design-to-code, diffusion images, UI generation |

---

## 2. Environment Files Synchronized & Installed

The live verified credentials are permanently synchronized across:

1. **Root Configuration**: `c:/D drive/Antigravity/.env`
2. **Next.js 15 Application**: `c:/D drive/Antigravity/antigravity-os/.env`
3. **OmniRoute AI Gateway**: `c:/D drive/Antigravity/antigravity-ai-router/.env`
4. **Backend Supabase / Prisma**: `c:/D drive/Antigravity/backend-supabase-prisma/.env`
5. **Global Antigravity Agent Configuration**: `C:/Users/sisod/.gemini/config/global.env`
6. **Key Rotation Pool**: `C:/Users/sisod/.gemini/config/key-pool.json`
7. **MCP Governance Server Config**: `C:/Users/sisod/.gemini/config/mcp_config.json`
8. **Windows Host Environment**: Persistently set in User Environment (`GITHUB_TOKEN`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, etc.)
9. **Media & Generative Tool Environments**:
   - `tools/Automated-Video-Generator/.env`
   - `tools/mcp-video-gen/.env`
   - `tools/open-webui/.env`
   - `tools/free-video-maker/.env`

---

## 3. Platform & Git Connectivity Verified

- **GitHub Remote Authentication**:
  - Remote authenticated URL: `https://github.com/sisodhiyap/antigravity-os.git`
  - Automated authentication via personal access token (`main -> origin/main`)
- **Antigravity OS TypeScript Status**:
  - Validated with `npx tsc --noEmit` on `antigravity-os` → **0 compilation errors**.

---

## 4. Repositories Installed

All 11 requested open-source engines and repositories from the desktop instructions are installed and prepared:

| Repository / Engine | Directory Path | Description |
| :--- | :--- | :--- |
| **blender_mcp** | `c:/blender_mcp` | Official Blender 3D MCP Server & Addon |
| **agency-agents** | `repositories/agency-agents` | AI Agency Autonomous Agents Suite |
| **claude-mem** | `repositories/claude-mem` | Persistent Memory & Context Engine |
| **meetily** | `repositories/meetily` | AI Meeting Notes, Audio & Transcription |
| **voicebox** | `repositories/voicebox` | Neural Voice & Audio Generation Studio |
| **OpenMontage** | `repositories/OpenMontage` | Open-Source AI Video Montage Editor |
| **AIComicBuilder** | `repositories/AIComicBuilder` | AI Comic Strip & Visual Narrative Creator |
| **e2e-tester-army** | `repositories/e2e-tester-army` | Autonomous End-to-End QA Testing Swarm |
| **career-ops** | `repositories/career-ops` | Career Operations Automation Suite |
| **firecrawl** | `repositories/firecrawl` | High-Performance Web Scraping for LLMs |
| **LTX-Desktop** | `repositories/LTX-Desktop` | Lightricks LTX Video Generation Desktop |
