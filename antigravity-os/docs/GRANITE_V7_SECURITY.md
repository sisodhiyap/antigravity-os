# Antigravity OS v7 — IBM Granite 4.2 Security Architecture

**Subsystem**: `src/plugins/granite/GraniteTrustBridge.ts` & `src/plugins/granite/GraniteEngine.ts`

---

## 1. Supply-Chain & Artifact Security

- **Checksum Verification**: Model metadata entries require SHA-256 validation before activation.
- **Sandboxed Loading**: Models are registered as sandboxed entities inside `PluginAdapterManager`.
- **Consent Gate**: The system strictly prevents silent downloads of multi-gigabyte weights.

---

## 2. Zero-Trust Output Governance

Granite outputs are subjected to the complete V7 Trust Fabric:

1. **No Self-Certification**: A model statement claiming *"This is verified"* remains tagged as `GENERATED`.
2. **Contradiction Filter**: Unverified financial and absolute claims are quarantined.
3. **Tool Sandboxing**: Tool calls emitted by Granite are routed through Hermes permission checks and sandbox execution boundaries.
