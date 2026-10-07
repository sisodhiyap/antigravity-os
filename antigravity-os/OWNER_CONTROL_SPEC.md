# 🛡️ Antigravity OS v5.3 — Owner Control & Autonomy Safety Specification

> **Module**: Owner Control (`src/owner/OwnerControl.ts`)  
> **Authority**: Single Authenticated Human Owner Identity  

---

## 1. Six Autonomy Tiers

| Level | Name | Automated Scope | Required Human Approval |
| :---: | :--- | :--- | :--- |
| **0** | **MANUAL** | Read-only inspection and status monitoring | All code edits, file writes, commands |
| **1** | **ASSISTED** | Code suggestions, test generation, linting | Applying code changes, DB mutations |
| **2** | **SUPERVISED** *(Default)* | Autonomous planning, code generation, local tests | Destructive mutations, packaging, deploy |
| **3** | **AUTONOMOUS** | Full build, integration tests, QA | Destructive mutations, production deploy |
| **4** | **AUTONOMOUS + REPAIR** | Autonomous self-repair and regression testing | Destructive mutations, production deploy |
| **5** | **AUTONOMOUS ENGINEERING** | Full-stack graph planning, repair, learning | Security policy edits, public deployment |

---

## 2. Destructive Operations Safety Gates
Under no circumstances may an AI instruction bypass:
1. Authentication & password checks.
2. Tenant isolation boundaries.
3. Database dropped tables without owner confirmation.
4. Production live deployments.
