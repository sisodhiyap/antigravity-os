# 🔧 Antigravity OS v5.3 — Self-Healing Engine 2.0 Specification

> **Module**: Self-Repair 2.0 & Failure Knowledge Graph (`src/learning/FailureKnowledgeGraph.ts`)  
> **Diagnostic Pattern**: `ERROR` $\rightarrow$ `STACK TRACE` $\rightarrow$ `LOG ANALYSIS` $\rightarrow$ `GRAPH LOCALIZATION` $\rightarrow$ `FAILURE CLASSIFICATION` $\rightarrow$ `ROOT CAUSE HYPOTHESIS` $\rightarrow$ `PATCH SELECTION` $\rightarrow$ `APPLY` $\rightarrow$ `TEST` $\rightarrow$ `REGRESSION CHECK` $\rightarrow$ `ACCEPT / ROLLBACK`  

---

## 1. Structured Diagnostic Pipeline

```
1. DEFECT DETECTED
   │
2. FAILURE CLASSIFICATION
   ├─► TYPE_MISMATCH (TypeScript TS errors)
   ├─► VALIDATION_ERROR (Missing payload fields)
   ├─► PERSISTENCE_FAULT (Disk write / Windows file lock)
   ├─► TRAVERSAL / SECURITY_VIOLATION (Path escape attempts)
   ├─► ROUTING_ERROR (Unmatched sub-resource routes)
   └─► AI_OFFLINE (Model connection timeout)
   │
3. FAILURE KNOWLEDGE GRAPH LOOKUP
   │ (Matches signature against historical repair strategies)
   │
4. SURGICAL PATCH GENERATION
   │ (Smallest safe code modification)
   │
5. TARGETED RE-VERIFICATION
   │
6. ZERO-REGRESSION PASS
   └─► Patch Promoted & Experience Recorded
```

---

## 2. Checkpoint & Rollback Safety

Before every high-risk repair mutation:
1. **`CheckpointManager.createCheckpoint`** captures current files, database state, and Git HEAD.
2. If regression tests fail after applying the patch, **`RollbackEngine.rollbackToCheckpoint`** automatically restores the system to its pre-mutation state.
3. System logs anti-pattern to **`FailureMemory`** to ensure the unviable repair strategy is not repeated.
