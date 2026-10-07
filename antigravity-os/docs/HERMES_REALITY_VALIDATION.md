# HERMES ZERO-TRUST REALITY VALIDATION

```text
================================================================================
           ANTIGRAVITY OS v7.0 — HERMES REALITY VALIDATION
================================================================================
```

## 1. Zero-Trust Reality Kernel Integration

Hermes integrates directly into the frozen V7 `RealityKernel` via `HermesRealityBridge`. Hermes never generates self-signed proofs or synthetic success claims.

## 2. 11-Question Zero-Trust Critic

Before a task is marked `PASSED`, `HermesCritic` validates:
1. Did the task actually execute?
2. Is the output observable?
3. Is the output correct?
4. Is the result reproducible?
5. Did the implementation introduce regressions?
6. Did security degrade?
7. Did visual fidelity degrade?
8. Did accessibility degrade?
9. Did performance degrade?
10. Is there raw evidence?
11. Is the claim independently verifiable?

## 3. Allowed Verdicts

- `PROVEN`: Verified by empirical execution and verifiable hash-chain entry.
- `CONTRADICTED`: Claim refuted by observable reality.
- `UNKNOWN`: Unproven claim with missing evidence.
- `BLOCKED`: Prevented by security invariant or emergency stop.

No "probably correct" or synthetic scores are accepted.
