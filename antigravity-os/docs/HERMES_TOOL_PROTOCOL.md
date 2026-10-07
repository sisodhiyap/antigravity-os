# HERMES CAPABILITY-BASED TOOL PROTOCOL

```text
================================================================================
           ANTIGRAVITY OS v7.0 — HERMES TOOL SPECIFICATION
================================================================================
```

## 1. Tool Bus Categories

Hermes defines capability-based tools across 17 structured categories:
- `FILESYSTEM`
- `GIT`
- `TERMINAL`
- `BROWSER`
- `HTTP`
- `DATABASE`
- `DOCKER`
- `PARSER`
- `FIGMA`
- `DOCUMENT`
- `IMAGE`
- `VISION`
- `CODE`
- `TEST`
- `SECURITY`
- `MCP`
- `EXPORT`
- `EVIDENCE`

## 2. Risk Tiers & Permission Mapping

| Risk Tier | Required Autonomy Level | Sandbox Required | Approval Required | Examples |
| :--- | :--- | :--- | :--- | :--- |
| `READ_ONLY` | Level 0 | No | No | `hermes_fs_read`, `hermes_security_scan` |
| `LOW` | Level 2 | Yes | No | `hermes_fs_write`, `hermes_test_runner` |
| `MEDIUM` | Level 3 | Yes | No | `hermes_browser_qa` |
| `HIGH` | Level 4 | Yes | No | Candidate Evolution Experimentation |
| `CRITICAL` | Level 5 | No | **Yes (Owner Gate)** | `hermes_production_promote` |
