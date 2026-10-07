# Antigravity OS v7 — IBM Granite 4.2 Operator Guide

**Audience**: Sovereign Workstation Operators & Developers  
**Subsystem**: IBM Granite 4.2 Integration

---

## 1. Quick Start

Granite 4.2 operates autonomously within the Antigravity OS environment.

### Diagnostic & Inspection Commands

```bash
# Verify Granite environment readiness
npm run doctor:granite

# Execute comprehensive 6-phase diagnostic
npm run diagnose:granite

# Run the 10-scenario multi-domain benchmark
npm run benchmark:granite

# Execute the 25-test acceptance suite
npm run verify:granite

# Run zero-trust independent forensic verification
npm run verify:granite:independent
```

---

## 2. Model Selection & Thinking Modes

The system automatically selects the ideal Granite configuration based on task complexity and host hardware:

| Mode | Token Budget | Typical Latency | Best Used For |
| :--- | :--- | :--- | :--- |
| **FAST** | $0$ thinking tokens | $< 40\text{ms}$ | Quick status checks, short edits, UI toggles |
| **LOW_EFFORT** | $64$ thinking tokens | $< 60\text{ms}$ | Low-RAM situations, simple summaries |
| **THINKING** | $128$ thinking tokens | $70\text{ms} - 150\text{ms}$ | Standard presentations, code generation |
| **DEEP_REASONING**| $512$ thinking tokens | $150\text{ms} - 350\text{ms}$ | Architecture, security review, self-repair |

---

## 3. Privacy & Offline Operation

- **Air-Gap Enforced**: Granite runs 100% locally on workstation hardware.
- **Zero Telemetry Egress**: Prompts, slides, and codebase ASTs are never uploaded to cloud providers unless explicitly authorized in Settings.
