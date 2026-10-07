# 🔍 Antigravity OS v5.3 — Failure Knowledge Graph Specification

> **Module**: Failure Knowledge Graph (`src/learning/FailureKnowledgeGraph.ts`)  
> **Purpose**: Semantic catalog of defect signatures, root causes, and proven repair strategies  

---

## 1. Schema & Failure Record Definition

Each record contains:
- **`id`**: Unique identifier (e.g. `FKG_01`).
- **`category`**: `TYPE_MISMATCH`, `VALIDATION_ERROR`, `DATABASE_ERROR`, `UI_HYDRATION`, `ROUTING_ERROR`, `AUTH_EXCEPTION`, `PERSISTENCE_FAULT`, `AI_OFFLINE`.
- **`rootCause`**: Underlying architectural or code discrepancy.
- **`detectionSignal`**: Regex / keyword pattern extracted from compiler or test failure.
- **`repairStrategy`**: Actionable repair approach.
- **`patchPattern`**: AST or template modification pattern.
- **`verifiedTests`**: Test IDs that must pass before patch is accepted.
- **`successRate`**: Rolling historical success telemetry (0.0 to 1.0).
- **`timesEncountered`**: Frequency counter across missions.

---

## 2. Dynamic Update Cycle
When a new defect is diagnosed and repaired successfully:
1. `FailureKnowledgeGraph.recordExperience` records the new signature or updates the historical success rate of an existing pattern.
2. The repaired case is converted into a regression test candidate in `RegressionKnowledgeBase`.
