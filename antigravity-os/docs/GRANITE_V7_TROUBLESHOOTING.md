# Antigravity OS v7 — IBM Granite 4.2 Troubleshooting Guide

**Subsystem**: IBM Granite 4.2 Sovereign Model Fabric

---

## Common Diagnostic Scenarios

### 1. High Memory Pressure Detected
- **Symptom**: `GraniteHardwareGovernor` reports `HEAVY` or `CRITICAL` pressure.
- **Remediation**: The system automatically switches to `granite-4.2-3b` and bounds context to 4,096 tokens.

### 2. Ollama Daemon Inaccessible
- **Symptom**: Port 11434 is closed.
- **Remediation**: Granite automatically activates the in-process deterministic fallback engine without crashing.

### 3. Tool Permission Denied
- **Symptom**: Hermes rejects tool execution.
- **Remediation**: Verify operator autonomy level in `/settings` or `/hermes`.
