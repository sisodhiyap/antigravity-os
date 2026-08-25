# ANTIGRAVITY HARNESS — INCIDENT RUNBOOK

This incident runbook outlines procedures for diagnosing and mitigating operational incidents.

---

## Incident Response Procedures

### 1. Quality Regression Alert (> 1% Quality Drop)
1. **Automated Action**: Policy experiment or Canary controller automatically reverts to baseline/0%.
2. **Operator Action**:
   - Inspect `/api/harness/stats` to identify affected category.
   - Run diagnostics: `antigravityHarness.getDiagnostics()`.
   - Verify if model provider output format changed.

---

### 2. Provider Rate Limit (HTTP 429) or Outage
1. **Automated Action**:
   - Provider state transitions to `RATE_LIMITED` or `NETWORK_FAILURE`.
   - 30-second cooldown timer begins.
   - Fallback Engine automatically routes traffic to next healthy provider in pool.
2. **Operator Action**:
   - Check key pool rotation balance in `.env`.
   - Inspect provider health via `providerStateMachine.getAllStatuses()`.

---

### 3. Budget Invariant or Oversubscription Anomaly
1. **Automated Action**:
   - Atomic reservation blocks any transaction exceeding available balance.
   - Task falls back safely to cheap solo mode or baseline execution.
2. **Operator Action**:
   - Check `CreditGovernor.verifyBudgetInvariant()`.
   - Ensure delta is 0.

---

### 4. Immediate Incident Mitigation Matrix

| Symptom | Primary Mitigation | Secondary Action |
| :--- | :--- | :--- |
| Elevated error rate ($>3\%$) | `canaryController.rollbackCanary('Incident alert')` | Inspect provider logs |
| Telemetry loss / corruption | `killSwitchManager.setSwitch('harness', false)` | Restart router process |
| Cloud provider outage | Router auto-fallbacks to Local Ollama | Check network connectivity |
| Unexpected billing spike | `killSwitchManager.setSwitch('premiumEscalation', false)` | Review ROI threshold |
