# 🔒 ANTIGRAVITY LEVEL-4 SECURITY & GOVERNANCE SPECIFICATION

## 1. SECRET GOVERNANCE & REDACTION

`SecretRedactor` actively scans and sanitizes all inputs, outputs, logs, artifacts, and error messages before persistence or network dispatch:
- **Redacted Tokens**: OpenAI keys (`sk-proj-*`), DeepSeek keys (`sk-*`), OpenRouter keys (`sk-or-v1-*`), GitHub tokens (`ghp_*`), Vercel tokens (`vcp_*`), Netlify tokens (`nfp_*`), database connection passwords, Bearer tokens, and generic private key definitions.
- **Deep Object Sanitization**: Recursive key/value inspection for JSON object graphs.

---

## 2. SANDBOX & PATH TRAVERSAL DEFENSE

`SandboxManager` isolates every task inside dedicated subdirectories (`workspaces/${workspaceId}/${projectId}/${taskId}`):
- **Path Traversal Defense**: All relative paths (`../`, `..\`), encoded escapes (`%2e%2e/`), and absolute host paths (`C:\Windows`) are rejected with `ToolExecutionError`.
- **Command Blacklist**: Destructive commands (`rm -rf /`, `format c:`, `shutdown /s`, `:(){ :|:& };:`) are blocked prior to execution.
- **Cross-Tenant Isolation**: Sibling workspace directories cannot be read or modified by other sandboxes.

---

## 3. HUMAN APPROVAL GATES

All `PRODUCTION_CRITICAL` operations (`deploy:prod`, `secret:modify`, `db:destructive`) are intercepted by `PolicyEngine`:
- Suspends autonomous execution and generates a pending approval record.
- Requires explicit operator review with an immutable decision audit log.
- Approvals expire automatically after their timeout window.
