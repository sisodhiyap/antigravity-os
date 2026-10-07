# Antigravity OS v5.2 — Mission Control Design System & Architecture

> **Document Status**: CURRENT — v5.2 (Local-First · Docker-Ready · Private Workstation)  
> **Classification**: Technical Design Specification & Design Tokens  
> **Last Updated**: August 2026

---

## 1. Executive Summary

Antigravity OS v5.2 is designed as a **mission-grade AI command center** engineered specifically for local-first execution on private developer workstations. The interface marries futuristic visual aesthetics (deep charcoal backgrounds, living gold radial glow hover states, illuminated active strokes) with strict software engineering discipline: zero fabricated telemetry, real Ollama/AirLLM hardware inspection, and full WCAG 2.1 AA accessibility compliance.

---

## 2. Color System & Design Tokens

### Primary Palette (Dark Mode - Default)

| Token | Hex / Value | Semantic Role |
| :--- | :--- | :--- |
| `--ag-bg` | `#080808` | Deepest root canvas |
| `--ag-bg-deep` | `#0D0D0F` | Sidebar and shell chrome |
| `--ag-surface` | `#121212` | Base component background |
| `--ag-elevated` | `#181818` | Elevated panels & inputs |
| `--ag-card` | `#151518` | Living interactive card surface |
| `--ag-border` | `#222225` | Structured border stroke |
| `--ag-gold` | `#D4AF37` | Primary mission accent & indicators |
| `--ag-gold-bright` | `#F0C75E` | Active interactive state |
| `--ag-gold-soft` | `rgba(212, 175, 55, 0.14)` | Radial glow pointer illumination |
| `--ag-text` | `#F5F5F5` | Primary typographic hierarchy |
| `--ag-text-sec` | `#B8B8B8` | Secondary labels & telemetry |
| `--ag-muted` | `#777777` | Metadata & inactive states |
| `--ag-success` | `#39D98A` | Healthy services & validated tests |
| `--ag-warning` | `#F5B942` | Memory safety cascade & offline fallbacks |
| `--ag-error` | `#FF5C5C` | Faults & red team injection |
| `--ag-info` | `#63B3FF` | Cloud swarm & ready states |

### Light Mode Palette (Soft Ivory / Charcoal)

| Token | Hex / Value | Semantic Role |
| :--- | :--- | :--- |
| `--ag-bg` | `#F4F3EF` | Soft ivory foundation |
| `--ag-bg-deep` | `#ECEAE4` | Sidebar chrome |
| `--ag-surface` | `#FFFFFF` | Card & container surfaces |
| `--ag-border` | `rgba(0, 0, 0, 0.10)` | Crisp subtle separation |
| `--ag-gold` | `#B18A24` | Calibrated golden accent for light contrast |
| `--ag-text` | `#171717` | High contrast charcoal typography |

---

## 3. Interaction Mechanics & Key Components

### 1. Pointer-Following Radial Glow (`MissionCard`)

Interactive cards dynamically track mouse coordinates (`--mouse-x`, `--mouse-y`) to render a soft, pointer-following golden halo:

```css
.mission-card::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(
    600px circle at var(--mouse-x, -999px) var(--mouse-y, -999px),
    var(--ag-gold-soft),
    transparent 42%
  );
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
  z-index: 1;
}

.mission-card:hover::before {
  opacity: 1;
}
```

### 2. Animated Navigation Stroke (`mc-nav-item`)

Active routes in the **Mission Navigator** feature a vertical 2px golden accent stroke that expands vertically upon selection (180–250ms ease-out) accompanied by deep gold box shadow:

```css
.mc-nav-item.active {
  color: var(--ag-text);
  background: linear-gradient(90deg, var(--ag-gold-alpha) 0%, transparent 100%);
  border-left: 2px solid var(--ag-gold);
  box-shadow: -4px 0 18px rgba(212, 175, 55, 0.25);
}
```

---

## 4. Information Architecture & Navigation

The navigation is structured into 4 functional mission domains:

1. **COMMAND**
   - **Mission Control** (`/`): Executive deck with Universal Command input, AI compute visualizer, system status matrix, live operations, and telemetry bars.
   - **Command Center** (`/terminal`): Direct kernel REPL and terminal execution.
2. **INTELLIGENCE**
   - **AI Control** (`/ai`): Multi-tier LLM mesh configuration, prompt debugging, and token metrics.
   - **Agents** (`/agents`): 7-role engineering swarm status and execution.
   - **MCP Hub** (`/mcp`): Model Context Protocol tool registry (15 connected servers).
3. **CREATION**
   - **Website Factory** (`/factory`): 8-stage automated website synthesis pipeline (`UNDERSTAND` -> `BLUEPRINT` -> `DESIGN` -> `ASSETS` -> `CODE` -> `PREVIEW` -> `QA` -> `DEPLOY`).
   - **Media Studio** (`/media`): Multi-modal studio (IMAGE, VIDEO, AUDIO, 3D, SVG) with explicit provider provenance.
   - **Projects** (`/projects`): Local workspace repository and file manager.
4. **SYSTEM**
   - **Health Center** (`/health-center`): Live hardware sensors (CPU, GPU VRAM, RAM, NVMe).
   - **Certification** (`/certification`): 19-phase automated test runner and audit report.
   - **Settings** (`/settings`): Workspace security, keys, and theme settings.

---

## 5. Reality-First Verification & Accessibility

- **Zero Mock Telemetry**: System status cards and hardware bars query real endpoints (`/api/telemetry`, `/api/health`, `/api/tasks`).
- **Graceful Memory Fallbacks**: Safe fallback cascades when AirLLM RAM floor (<4.0 GB) is breached.
- **WCAG 2.1 AA Certified**: All text-to-background contrast ratios exceed `4.5:1` for normal text and `3:1` for large headers in both Dark and Light modes.
