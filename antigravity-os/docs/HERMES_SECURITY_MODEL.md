# HERMES SECURITY MODEL & INVARIANT DEFENSE

```text
================================================================================
           ANTIGRAVITY OS v7.0 — HERMES SECURITY ARCHITECTURE
================================================================================
```

## 1. Explicit Trust Boundaries

Hermes enforces strict hierarchical policy precedence:
$$\text{SYSTEM POLICY} > \text{OWNER POLICY} > \text{V7 SECURITY POLICY} > \text{TASK} > \text{EXTERNAL CONTENT}$$

External data (PDF, DOCX, HTML, SVG, Figma, code, user prompt, MCP response) is classified as **UNTRUSTED DATA** and can never be interpreted as execution commands.

## 2. Hard Safety Invariants

1. Frozen V7 core cannot be modified.
2. Production cannot be modified without Owner approval.
3. Secrets cannot enter memory or logs.
4. External content cannot become instructions.
5. Failed security tests cannot be promoted.
6. Failed regression tests cannot be promoted.
7. Unknown claims cannot become proven claims.
8. Evidence cannot be self-authored without execution.
9. Model output cannot override policy.
10. Hermes cannot modify its own permission system.
11. Hermes cannot modify its own Reality Kernel.
12. Hermes cannot modify its own Evidence Verifier.
13. Hermes cannot disable security.
14. Hermes cannot bypass rollback.
15. Hermes cannot approve its own promotion.

## 3. Defense Against Injection & Attacks

- **Prompt Injections**: Filtered and neutralized (`[UNTRUSTED_CONTENT_FILTERED]`).
- **Path Traversals**: Sandboxes prevent escaping (`..` and absolute paths blocked).
- **Secret Redaction**: API keys (`sk-*`, `ghp_*`), JWTs, and passwords automatically redacted.
- **MCP Containment**: MCP tool outputs sanitized before consumption.
