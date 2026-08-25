# 👁️ ANTIGRAVITY LEVEL-4 PRODUCTION OBSERVABILITY SPECIFICATION

## 1. CORRELATION IDENTIFIERS

Every production event, metric, and log entry is linked across the 7-tier correlation envelope:
- `requestId`: Inbound request tracer
- `releaseId`: Release state machine release identifier
- `taskId`: Software factory task identifier
- `workspaceId`: Tenant workspace boundary identifier
- `projectId`: Application project identifier
- `agentId`: Autonomous agent worker identifier
- `executionId`: Tool or sandbox execution identifier

---

## 2. PRODUCTION LOGGING STANDARD

- Structured JSON output with severity levels: `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL`.
- All logs pass through `SecretRedactor.redactString()` before writing to stdout or file buffers.
- Zero credentials or tokens are printed in plaintext.
