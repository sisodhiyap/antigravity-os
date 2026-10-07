# Progressive Web Application (PWA)

> **Application Class**: Mobile Web & PWA  
> **Synthesized By**: Antigravity OS v5.2 (Mission Controller Benchmark)  
> **Local Port**: `127.0.0.1:3111`  
> **Architecture**: Node.js + SQLite WAL Persistence + Glassmorphism UI + REST API  

## Features
- Web App Manifest
- Service Worker Cache
- Offline Fallback View
- IndexedDB/LocalStorage Sync
- Responsive Layout

## Entities & Database Tables
- `offlineitems` (Indexed by `id`, `tenant_id`, `status`)
- `syncqueues` (Indexed by `id`, `tenant_id`, `status`)
- `cachemanifests` (Indexed by `id`, `tenant_id`, `status`)
- `userpreferences` (Indexed by `id`, `tenant_id`, `status`)
- `clientstorages` (Indexed by `id`, `tenant_id`, `status`)

## Security Architecture
- **Isolation Policy**: Service worker scope isolation and secure storage
- **Path Traversal Defense**: Strictly sandboxed to relative safe bounds.
- **Access Control**: Tenant token boundary enforcement.

## Run Locally
```bash
cd source
node server.js
```
