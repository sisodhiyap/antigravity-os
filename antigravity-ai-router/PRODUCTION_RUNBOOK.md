# ANTIGRAVITY HARNESS — PRODUCTION RUNBOOK

This runbook guides operators on managing, monitoring, and operating the Antigravity Production Harness.

---

## 1. Operating Modes & Lifecycle

The Harness supports 7 explicit lifecycle modes:
- `shadow`: Predicts decisions without altering baseline router execution.
- `advisory`: Emits recommendations and logs baseline comparisons.
- `enforced_10`: Harness controls 10% of traffic (90% baseline control).
- `enforced_25`: Harness controls 25% of traffic (75% baseline control).
- `enforced_50`: Harness controls 50% of traffic (50% baseline control).
- `enforced_100`: Harness controls 100% of traffic with baseline fallback available.
- `production_locked`: 100% enforcement active; configuration frozen against unapproved mutations.

---

## 2. Inspecting Telemetry & Live Metrics

### Telemetry API Endpoint
```bash
GET /api/harness/stats
```

### Key Metrics to Monitor:
- **Quality Score**: Target $\ge 94/100$
- **Success Rate**: Target $\ge 98\%$
- **Cost / Success**: Target $\le \$0.0050$
- **Actual vs Estimated vs Unknown Cost**: Independently tracked
- **Prediction Accuracy**: Target $\ge 95\%$
- **Budget State**: `GREEN` (0-60%), `YELLOW` (60-80%), `ORANGE` (80-95%), `RED` (95-100%)

---

## 3. Global Emergency Kill Switch (`HARNESS_GLOBAL_DISABLE`)

To immediately disable Harness execution and route all traffic to the verified baseline router:

```typescript
import { killSwitchManager } from './src/harness/kill-switches.js';

// Activate emergency shutdown
killSwitchManager.setSwitch('harness', false);

// Re-enable when safe
killSwitchManager.setSwitch('harness', true);
```

---

## 4. Graduated Rollout Adjustments

```typescript
import { canaryController } from './src/harness/canary.js';

// Set canary percentage
canaryController.setCanaryPercentage(25); // 25% Harness, 75% Baseline
```

---

## 5. Unlocking Configuration in `PRODUCTION_LOCKED` State

```typescript
import { productionLockController } from './src/harness/production-lock.js';

// Unlock with operator confirmation token
productionLockController.unlock('CONFIRM_UNLOCK_OPERATOR');
```
