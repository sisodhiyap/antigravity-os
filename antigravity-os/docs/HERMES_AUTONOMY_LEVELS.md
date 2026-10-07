# HERMES AUTONOMY LEVELS SPECIFICATION

```text
================================================================================
           ANTIGRAVITY OS v7.0 — HERMES AUTONOMY LEVELS
================================================================================
```

## Autonomy Matrix

| Level | Name | Permissions | Sandbox | Production Access | Approval Required |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Level 0** | `OBSERVE` | Read-only inspection & parsing | No | None | No |
| **Level 1** | `PLAN` | Task DAG creation, architecture design | No | None | No |
| **Level 2** | `SANDBOX` *(Default)* | Write files & mutate state inside sandbox | Isolated Sandbox | None | No |
| **Level 3** | `EXECUTE` | Run test runners, build pipelines & browser QA | Isolated Sandbox | None | No |
| **Level 4** | `PROMOTION REQUEST` | Stage verified release candidate | Sandbox & Staging | None | No |
| **Level 5** | `OWNER APPROVAL` | Promote sandbox build to production | Staging / Production | **Read & Write** | **Yes (Owner Signature)** |

Hermes is strictly prohibited from escalating itself to Level 5.
Level 5 requires explicit human operator cryptographic confirmation.
