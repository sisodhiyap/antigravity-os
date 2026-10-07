# ANTIGRAVITY OS V7 — DESKTOP SECURITY SPECIFICATION

## 1. Security Architecture
1. **Context Isolation**: `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`.
2. **Content Security Policy (CSP)**: Strict origin validation allowing only local application resources and fonts.
3. **IPC Channel Allowlisting**: Enforced via `DesktopSecurityFabric`. Arbitrary shell commands and unallowlisted channels are rejected.
4. **Secret Redaction**: Automatic scrubbing of API keys, bearer tokens, and credentials from logs and diagnostic exports.
5. **Project Vault Isolation**: Filesystem access restricted to isolated paths within `workspaces/` preventing cross-project data leakage.
