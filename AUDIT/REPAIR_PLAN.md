# AUDIT/REPAIR_PLAN.md — Antigravity OS Desktop Productization & Repair Plan

**Plan Date**: October 7, 2026  
**Execution Strategy**: Systematic, Phased, Non-Destructive Remediation  
**Target Outcome**: Production-grade, standalone Windows 10/11 installable desktop application.

---

## Phase 1: Electron Desktop Shell Implementation (Mission 2)
1. **Dependency Installation**:
   - Add `electron` and `electron-builder` to `antigravity-os/package.json` `devDependencies`.
   - Add `concurrently` and `wait-on` for clean local supervisor orchestration.
2. **Main Process (`src/desktop/main.ts`)**:
   - Implement real Electron lifecycle: `app.whenReady()`, `BrowserWindow` creation, window state preservation, min dimensions (`1280x800`).
   - Implement graceful shutdown hook stopping all supervised local processes on `window-all-closed` / `before-quit`.
   - Enforce security flags: `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`.
3. **Preload Script (`src/desktop/preload.ts`)**:
   - Implement secure `contextBridge.exposeInMainWorld("antigravityDesktop", ...)` API.
   - Validate and sanitize all IPC arguments before forwarding to main process.
4. **Local Service Supervisor (`src/desktop/supervisor.ts`)**:
   - Replace fabricated uptime/memory values with real process metrics.
   - Implement port probing (`127.0.0.1`) and graceful startup/shutdown for auxiliary tools.
5. **Security Fabric (`src/desktop/security.ts`)**:
   - Enforce restrictive Content Security Policy (CSP).
   - Sanitize all outbound logs and prevent secrets from crossing the renderer boundary.

---

## Phase 2: Database & Persistent Storage Setup (Mission 8)
1. **Path Resolution**:
   - Configure SQLite database location to resolve to `%APPDATA%/AntigravityOS/data/production.db` in packaged production mode, falling back to `./prisma/production.db` in development mode.
2. **Prisma Generation & Migration**:
   - Execute `npx prisma generate` to ensure client types are synchronized.
   - Ensure initial database file and tables are initialized without data destruction.

---

## Phase 3: Truthful Capability & Provider Registry (Missions 3 & 4)
1. **Central AI Providers**:
   - Implement `OpenAIProviderAdapter`, `GeminiProviderAdapter`, `GroqProviderAdapter`, and `NvidiaProviderAdapter` in `src/server/ai/providers.ts`.
   - Register all 7 providers in `CentralAIRouter`.
2. **Truthful API Endpoints**:
   - Refactor `src/app/api/providers/route.ts` to inspect real environment configuration and return truthful statuses.
   - Refactor `src/app/api/models/route.ts` to list actual models available from configured providers.
   - Refactor `src/capabilities/CapabilityDiscovery.ts` to inspect real host CPU/GPU/RAM via `systeminformation` instead of hardcoded strings.
3. **Diagnostics & Testing Actions**:
   - Provide non-destructive connection and test-inference verification endpoints.

---

## Phase 4: Capability & External Repository Connectors (Missions 5 & 6)
1. **Ollama Integration**:
   - Implement graceful fallback when Ollama is offline, with clear download/setup instructions in the UI.
2. **External Extension Registry**:
   - Wire cloned repositories (`repositories/*`) and tools into the unified extension registry.
   - Add status badges reflecting their real installation state.

---

## Phase 5: Build, Packaging & Launch Verification (Missions 10 & 11)
1. **Next.js Production Build**:
   - Validate compilation with `npm run build` (`prisma generate && next build`).
2. **Electron Packaging**:
   - Compile desktop TypeScript (`src/desktop/*.ts`) to `dist/desktop`.
   - Run `electron-builder` to package the Windows desktop application and create the standalone installer.
3. **Verification**:
   - Launch test of the compiled desktop application.
   - Verify persistence, shutdown, and clean process exit.

---

## Phase 6: Final Engineering Report (Mission 13)
- Document complete verification evidence, test results, commit references, and user instructions in `AUDIT/FINAL_RELEASE_REPORT.md`.
