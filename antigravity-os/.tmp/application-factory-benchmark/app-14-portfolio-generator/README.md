# Cinematic Portfolio Generator

> **Application Class**: Creative & Web Systems  
> **Synthesized By**: Antigravity OS v5.2 (Mission Controller Benchmark)  
> **Local Port**: `127.0.0.1:3114`  
> **Architecture**: Node.js + SQLite WAL Persistence + Glassmorphism UI + REST API  

## Features
- Cinematic Dark UI
- Project Showcase
- Case Study View
- Admin Studio Editor
- Contact Handler

## Entities & Database Tables
- `portfolioprojects` (Indexed by `id`, `tenant_id`, `status`)
- `casestudys` (Indexed by `id`, `tenant_id`, `status`)
- `skillbadges` (Indexed by `id`, `tenant_id`, `status`)
- `serviceofferings` (Indexed by `id`, `tenant_id`, `status`)
- `biographys` (Indexed by `id`, `tenant_id`, `status`)
- `contactsubmissions` (Indexed by `id`, `tenant_id`, `status`)

## Security Architecture
- **Isolation Policy**: Admin authentication barrier and contact form spam throttling
- **Path Traversal Defense**: Strictly sandboxed to relative safe bounds.
- **Access Control**: Tenant token boundary enforcement.

## Run Locally
```bash
cd source
node server.js
```
