# CRM Application

> **Application Class**: Enterprise CRM  
> **Synthesized By**: Antigravity OS v5.2 (Mission Controller Benchmark)  
> **Local Port**: `127.0.0.1:3103`  
> **Architecture**: Node.js + SQLite WAL Persistence + Glassmorphism UI + REST API  

## Features
- Contact Management
- Deal Pipeline Stages
- Activity Log
- Notes CRUD
- Lead Conversion
- Analytics

## Entities & Database Tables
- `contacts` (Indexed by `id`, `tenant_id`, `status`)
- `companys` (Indexed by `id`, `tenant_id`, `status`)
- `leads` (Indexed by `id`, `tenant_id`, `status`)
- `deals` (Indexed by `id`, `tenant_id`, `status`)
- `activitys` (Indexed by `id`, `tenant_id`, `status`)
- `notes` (Indexed by `id`, `tenant_id`, `status`)
- `users` (Indexed by `id`, `tenant_id`, `status`)

## Security Architecture
- **Isolation Policy**: Lead ownership verification and RBAC enforcement
- **Path Traversal Defense**: Strictly sandboxed to relative safe bounds.
- **Access Control**: Tenant token boundary enforcement.

## Run Locally
```bash
cd source
node server.js
```
