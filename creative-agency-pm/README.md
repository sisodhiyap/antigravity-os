# ✨ AURA STUDIO OS — Creative Agency Project Management SaaS

> **Autonomous Build**: Antigravity OS v5.2 (Master Swarm Architecture)  
> **Target Class**: Professional Creative Agency SaaS  
> **Deployment Architecture**: Local-First • Docker-Ready • Private Workstation  
> **Default Port**: `127.0.0.1:3400`  

---

## 🌟 Key Features

1. **Clients & CRM**: Manage enterprise client retainers, contacts, project counts, and tier badges.
2. **Projects Hub**: Complete creative briefs, budget consumption tracking, deadline milestones, and design token integration.
3. **Sprint Kanban**: Dynamic 5-column task board (`Backlog`, `In Design`, `Client Review`, `Approved`, `Completed`) with real-time status transitions.
4. **Approvals & Client Sign-Offs**: Formal executive and client sign-off stream with audit timestamps and change request cycles.
5. **Asset Vault**: Sandboxed storage for 3D renders, brand guidelines, and vector files with strict path traversal prevention.
6. **Comments & Context Threads**: Real-time discussions linked to tasks, deliverables, and approvals.
7. **System Notifications**: Live alerts for assigned tasks, approval requests, and feedback mentions.
8. **Executive Analytics & Dashboards**: Real-time SVG velocity sprint charts, budget consumption, and profit margin telemetry.
9. **Role-Based Access Control (RBAC)**: Hierarchical permissions for `admin`, `director`, `lead`, `designer`, `copywriter`, and `client`.
10. **Activity History & Audit Trail**: Chronological event stream logging all agency operations.
11. **Global Search**: High-speed search with instant keyboard shortcut (`/`) across all entities.
12. **Dark / Light Mode**: Seamless theme switching with high contrast and zero layout shifts.

---

## 🚀 Quickstart

### 1. Run with Node / TypeScript
```bash
cd "c:\D drive\Antigravity\creative-agency-pm"
npx tsx src/server.ts
```
Open browser at: `http://127.0.0.1:3400`

### 2. Run All Tests (Unit, API, Security Attacks, Self-Repair)
```bash
npx tsx tests/run-all-qa.ts
```

### 3. Run with Docker
```bash
docker compose up --build -d
```

---

## 🔒 Security Architecture
- **Cryptographic Auth**: `PBKDF2-SHA512` with 100,000 iterations and 32-byte cryptographic salt.
- **Timing-Safe HMAC JWT**: Timing-safe verification prevents side-channel timing attacks.
- **Vault Sandbox**: Path traversal (`../../etc/passwd`) blocked with HTTP 403.
- **Zero Exposed Secrets**: 100% environment-driven configuration.
