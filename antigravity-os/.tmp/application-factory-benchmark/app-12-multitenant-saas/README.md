# Multi-Tenant SaaS with Strict Isolation

> **Application Class**: Enterprise Multi-Tenancy  
> **Synthesized By**: Antigravity OS v5.2 (Mission Controller Benchmark)  
> **Local Port**: `127.0.0.1:3112`  
> **Architecture**: Node.js + SQLite WAL Persistence + Glassmorphism UI + REST API  

## Features
- Tenant Isolation
- Admin Member Management
- Role Assignment
- Cross-Tenant Attack Rejection

## Entities & Database Tables
- `tenants` (Indexed by `id`, `tenant_id`, `status`)
- `tenantusers` (Indexed by `id`, `tenant_id`, `status`)
- `tenantroles` (Indexed by `id`, `tenant_id`, `status`)
- `tenantprojects` (Indexed by `id`, `tenant_id`, `status`)
- `tenantdocuments` (Indexed by `id`, `tenant_id`, `status`)

## Security Architecture
- **Isolation Policy**: Strict IDOR rejection: Tenant A cannot access Tenant B (403/404 enforced)
- **Path Traversal Defense**: Strictly sandboxed to relative safe bounds.
- **Access Control**: Tenant token boundary enforcement.

## Run Locally
```bash
cd source
node server.js
```
