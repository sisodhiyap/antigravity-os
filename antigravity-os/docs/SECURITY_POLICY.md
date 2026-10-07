# Antigravity OS V7 — Security & Threat Mitigation Policy

## 1. Threat Defense Matrix

### A. Prompt Injection Defense (Direct & Indirect)
- External content (PDF, DOCX, PPTX, XLSX, SVG, HTML, code comments, metadata, workflow JSON) is treated as **UNTRUSTED DATA**.
- Autonomous pattern detection filters system prompt overrides, delimiter injections, and exfiltration commands.

### B. Secret Protection & Cloud DLP
- Automatic scanning detects OpenAI keys, GitHub tokens, AWS keys, JWTs, private keys, and passwords.
- Secrets are redacted and replaced with `[REDACTED_SECRET:sha256]` before LLM transmission, logs, or exports.
- **Classification Routing**:
  - `SECRET`: Local runtime only. Never sent to cloud.
  - `SENSITIVE`: Local by default; requires explicit owner authorization.
  - `CONFIDENTIAL`: Governed by owner policy.
  - `PUBLIC`: Configurable egress.

### C. PII Guard
- Automatic detection of emails, phone numbers, government IDs, and credit cards with configurable masking, redaction, or local-only boundaries.

### D. Tool Execution Guard & Least Privilege
- Every tool execution undergoes:
  `TASK POLICY -> TOOL PERMISSION -> INPUT VALIDATION -> SECURITY CHECK -> RESOURCE CHECK -> EXECUTION -> OUTPUT VALIDATION -> EVIDENCE`.
- Any security violation immediately blocks execution and generates an audit log entry.
