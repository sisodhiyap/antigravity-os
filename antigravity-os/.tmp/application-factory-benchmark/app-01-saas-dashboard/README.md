# SaaS Analytics Dashboard

> **Application Class**: SaaS & Analytics  
> **Synthesized By**: Antigravity OS v5.2 (Mission Controller Benchmark)  
> **Local Port**: `127.0.0.1:3101`  
> **Architecture**: Node.js + SQLite WAL Persistence + Glassmorphism UI + REST API  

## Features
- Auth
- RBAC
- Org Isolation
- KPI Charts
- Notifications
- Settings
- Dark/Light Mode

## Entities & Database Tables
- `users` (Indexed by `id`, `tenant_id`, `status`)
- `organizations` (Indexed by `id`, `tenant_id`, `status`)
- `roles` (Indexed by `id`, `tenant_id`, `status`)
- `metrics` (Indexed by `id`, `tenant_id`, `status`)
- `notifications` (Indexed by `id`, `tenant_id`, `status`)
- `settings` (Indexed by `id`, `tenant_id`, `status`)

## Security Architecture
- **Isolation Policy**: Role-based access control and tenant token validation
- **Path Traversal Defense**: Strictly sandboxed to relative safe bounds.
- **Access Control**: Tenant token boundary enforcement.

## Run Locally
```bash
cd source
node server.js
```
