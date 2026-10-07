# HERMES OPERATOR GUIDE

```text
================================================================================
           ANTIGRAVITY OS v7.0 — HERMES OPERATOR RUNBOOK
================================================================================
```

## 1. Operator Console

Access the native Hermes workspace at `/hermes` in the Antigravity OS dashboard.

### Key Console Capabilities:
- **Autonomy Level Selector**: Switch dynamically between Level 0 (Observe) and Level 5 (Owner Approved).
- **Emergency Stop Button**: Instantly halts all active sandboxes, revokes tool access, and preserves cryptographic state.
- **Task DAG Visualizer**: Displays task dependencies, status (`PENDING`, `RUNNING`, `PASSED`, `REPAIRING`, `ROLLED_BACK`), models, and evidence hashes.
- **Live Timeline**: Microsecond execution timestamps across every agent phase.
- **Token & Cost Meter**: Real-time token usage, local vs. cloud split, and zero cost when running local GPU models.
- **Owner Promotion Gate**: Cryptographically signs promotion requests from sandbox to production.

## 2. Verification Commands

Run the full 60-gate automated verification suite:
```bash
npm run verify:hermes
```

Run the standalone independent auditor:
```bash
npm run verify:hermes:independent
```
