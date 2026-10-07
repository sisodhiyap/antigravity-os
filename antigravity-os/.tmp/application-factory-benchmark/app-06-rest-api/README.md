# Production REST API

> **Application Class**: API & Backend  
> **Synthesized By**: Antigravity OS v5.2 (Mission Controller Benchmark)  
> **Local Port**: `127.0.0.1:3106`  
> **Architecture**: Node.js + SQLite WAL Persistence + Glassmorphism UI + REST API  

## Features
- GET/POST/PUT/PATCH/DELETE
- Bearer JWT Auth
- Pagination
- Zod Validation
- OpenAPI Docs

## Entities & Database Tables
- `apiusers` (Indexed by `id`, `tenant_id`, `status`)
- `apikeys` (Indexed by `id`, `tenant_id`, `status`)
- `projects` (Indexed by `id`, `tenant_id`, `status`)
- `tasks` (Indexed by `id`, `tenant_id`, `status`)
- `auditlogs` (Indexed by `id`, `tenant_id`, `status`)

## Security Architecture
- **Isolation Policy**: Input sanitization, pagination limits, and rate limiting
- **Path Traversal Defense**: Strictly sandboxed to relative safe bounds.
- **Access Control**: Tenant token boundary enforcement.

## Run Locally
```bash
cd source
node server.js
```
