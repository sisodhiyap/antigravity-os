# 🧠 Antigravity OS v5.3 — 5-Tier Persistent Engineering Memory Specification

> **Module**: Engineering Memory (`src/learning/EngineeringMemory.ts`)  
> **Persistence**: JSON State Snapshots in `artifacts/memory/engineering_memory.json`  

---

## 1. Five Persistent Memory Tiers

```
┌────────────────────────────────────────────────────────┐
│                   A. OWNER MEMORY                      │
│ (Autonomy Level, Local-Only Policy, Strict Types)      │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                  B. PROJECT MEMORY                     │
│ (Schemas, API Contracts, Design Tokens, Roadmap)       │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                  C. MISSION MEMORY                     │
│ (Prompts, DAG Graphs, Failure Logs, Reality Scores)    │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                D. ENGINEERING MEMORY                   │
│ (Reusable Architectural Patterns, Model Scorecards)    │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                  E. FAILURE MEMORY                     │
│ (Anti-Patterns, Failed Fixes, Prohibited Strategies)   │
└────────────────────────────────────────────────────────┘
```

---

## 2. Strict Memory Privacy Boundary
- **Zero Secret Ingestion**: Passwords, API tokens, session secrets, and sensitive credentials are never stored in persistent memory layers.
- **Project Isolation**: Memory namespaces prevent cross-tenant data contamination.
