# External API Integration Gateway

> **Application Class**: Integration & Resilience  
> **Synthesized By**: Antigravity OS v5.2 (Mission Controller Benchmark)  
> **Local Port**: `127.0.0.1:3110`  
> **Architecture**: Node.js + SQLite WAL Persistence + Glassmorphism UI + REST API  

## Features
- Server-Side API Proxy
- Response Normalization
- In-Memory/DB Cache
- Timeout & Retry Guard
- State Views

## Entities & Database Tables
- `apisources` (Indexed by `id`, `tenant_id`, `status`)
- `cachedresponses` (Indexed by `id`, `tenant_id`, `status`)
- `normalizedrecords` (Indexed by `id`, `tenant_id`, `status`)
- `synclogs` (Indexed by `id`, `tenant_id`, `status`)
- `metriccounters` (Indexed by `id`, `tenant_id`, `status`)

## Security Architecture
- **Isolation Policy**: Server-side credential concealment and SSRF defense
- **Path Traversal Defense**: Strictly sandboxed to relative safe bounds.
- **Access Control**: Tenant token boundary enforcement.

## Run Locally
```bash
cd source
node server.js
```
