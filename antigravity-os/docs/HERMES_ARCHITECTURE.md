# HERMES AUTONOMOUS AGENT — ARCHITECTURE SPECIFICATION

```text
================================================================================
           ANTIGRAVITY OS v7.0 — HERMES AGENT ARCHITECTURE
================================================================================
```

## 1. Overview & Positioning

Hermes is an autonomous software engineering agent layer built exclusively **above and beside** the frozen Antigravity OS v7.0 core.

```text
                       OWNER REQUEST
                             ↓
                     HERMES AGENT
                             ↓
                     TASK DECOMPOSITION
                             ↓
                     PRODUCT INTELLIGENCE
                             ↓
                     MULTI-MODEL ROUTER
                             ↓
                     SANDBOX EXECUTION
                             ↓
                     TOOL / MCP BUS
                             ↓
                     EXECUTION
                             ↓
                     REALITY KERNEL
                             ↓
                     SECURITY & RED-TEAM
                             ↓
                     REGRESSION CHECK
                             ↓
                     EVIDENCE LEDGER
                             ↓
                 INDEPENDENT VERIFICATION
                             ↓
                     OWNER APPROVAL
                             ↓
                         PROMOTION
```

## 2. Core Subsystems

1. **`HermesAgent` (`src/plugins/hermes/HermesAgent.ts`)**: Main autonomous controller orchestrating the Observe-Understand-Plan-Decompose-Route-Sandbox-Critic-Repair-Verify-Evidence-Reality loop.
2. **`HermesTaskGraph` (`src/plugins/hermes/HermesTaskGraph.ts`)**: Directed Acyclic Graph engine with Kahn's cycle detector, failure isolation, and dependency resolution.
3. **`HermesPlanner` (`src/plugins/hermes/HermesPlanner.ts`)**: Autonomous task decomposer compiling high-level goals into multi-stage execution DAGs.
4. **`HermesCritic` (`src/plugins/hermes/HermesCritic.ts`)**: 11-question zero-trust verification evaluator rejecting unproven claims.
5. **`HermesModelRouter` (`src/plugins/hermes/HermesModelRouter.ts`)**: 12-capability routing engine with multi-model consensus and offline deterministic fallback.
6. **`HermesToolRegistry` (`src/plugins/hermes/HermesToolRegistry.ts`)**: Capability-based tool bus enforcing sandboxes, schemas, and risk tiers.
7. **`HermesMCPBridge` (`src/plugins/hermes/HermesMCPBridge.ts`)**: Secure Model Context Protocol bridge with untrusted response containment.
8. **`HermesRealityBridge` (`src/plugins/hermes/HermesRealityBridge.ts`)**: Direct adapter to the V7 Reality Kernel and claim registry.
9. **`HermesEvidenceBridge` (`src/plugins/hermes/HermesEvidenceBridge.ts`)**: Append-only SHA-256 hash-chain evidence ledger.
10. **`HermesCheckpointManager` & `HermesRollbackManager`**: Cryptographic pre/post snapshots and zero-byte mutation rollback verification.
11. **`HermesPermissionManager` (`src/plugins/hermes/HermesPermissionManager.ts`)**: Levels 0–5 autonomy guardrails with emergency stop and Level 5 Owner Gate.
12. **`HermesApprovalGate` (`src/plugins/hermes/HermesApprovalGate.ts`)**: Cryptographic signature verification for production promotion.
13. **`HermesMemory` (`src/plugins/hermes/HermesMemory.ts`)**: 6-layer provenance-aware memory with active secret redaction.
14. **`HermesObservability` (`src/plugins/hermes/HermesObservability.ts`)**: Real-time telemetry, token meters, and microsecond latency metrics.
