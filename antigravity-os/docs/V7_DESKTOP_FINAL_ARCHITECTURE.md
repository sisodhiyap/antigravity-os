# ANTIGRAVITY OS V7 — NATIVE DESKTOP SHELL FINAL ARCHITECTURE
**Sovereign Desktop Product Runtime & Unified Operator Architecture**

---

## 1. Architectural Constitution

Antigravity OS Desktop is a sovereign, standalone desktop product that executes directly on the operator's host operating system without requiring Antigravity IDE, VS Code, external browsers, or manual terminal commands.

```
┌─────────────────────────────────────────────────────────────────┐
│                    ANTIGRAVITY OS V7 DESKTOP                    │
│      Dedicated Native Window • Custom Titlebar • Standalone     │
├─────────────────────────────────────────────────────────────────┤
│  DESKTOP SHELL (Electron / Main Process & Secure Context Bridge) │
│  - Window Lifecycle ($1440 \times 900$)                         │
│  - Secure IPC Allowlist (`DesktopSecurityFabric`)               │
│  - Content Security Policy (Strict Local Origin)                │
│  - System Tray & Emergency Stop Hooks                           │
├─────────────────────────────────────────────────────────────────┤
│  LOCAL SERVICE SUPERVISOR (src/desktop/supervisor.ts)           │
│  - V7 Core Runtime (Port 3000)                                  │
│  - Hermes Autonomous Agent (PID / DAG Engine)                   │
│  - ComfyUI Media Pipeline (Port 8188)                           │
│  - Ollama Local LLM Workstation (Port 11434)                    │
│  - SQLite Enterprise Vault & Evidence Ledger                    │
├─────────────────────────────────────────────────────────────────┤
│  COMMAND CENTER UI (src/app/desktop/page.tsx)                   │
│  - Hardware Startup Diagnostic Splash Sequence                  │
│  - First-Class "Create from Idea" Workflow                      │
│  - PresentX Studio 21 Layout Engine                             │
│  - Real Hardware & VRAM Telemetry                               │
│  - Multi-Format Export Factory (PPTX, PDF, HTML, JSON)          │
├─────────────────────────────────────────────────────────────────┤
│  V7 FROZEN CORE (src/kernel/**, src/reality/**, Trust)          │
│  - 99 Immutable Baseline Units (0 Core Mutations)               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Subsystems

1. **Hardware & Capability Reality Detector (`src/desktop/hardware.ts`)**:
   - Inspects CPU, RAM, GPU, VRAM, Disk, Node, Python, ComfyUI, Ollama, and V7 Subsystems.
   - Strictly reports honest states: `AVAILABLE`, `DEGRADED`, `UNAVAILABLE`, `UNKNOWN`, `QUARANTINED`.
2. **Local Service Supervisor (`src/desktop/supervisor.ts`)**:
   - Manages and monitors local processes with PID tracking, port mapping, and automated crash recovery.
3. **Hardened Context Isolation (`src/desktop/security.ts` & `preload.ts`)**:
   - Strict `contextIsolation: true`, `nodeIntegration: false`, IPC channel allowlisting, secret redaction, and project vault isolation (`workspaces/`).
4. **PresentX Studio First-Class Integration**:
   - Direct desktop generation from topic prompt to 12-slide verified presentation with OpenXML PPTX, single-file HTML, and signed JSON evidence bundles.
