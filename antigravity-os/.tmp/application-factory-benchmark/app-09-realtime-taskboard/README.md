# Real-Time Collaborative Board

> **Application Class**: Real-Time Systems  
> **Synthesized By**: Antigravity OS v5.2 (Mission Controller Benchmark)  
> **Local Port**: `127.0.0.1:3109`  
> **Architecture**: Node.js + SQLite WAL Persistence + Glassmorphism UI + REST API  

## Features
- Multi-Session Sync
- Live Event Stream (SSE/Polling Sync)
- Concurrent Card Edits
- State Broadcast

## Entities & Database Tables
- `boards` (Indexed by `id`, `tenant_id`, `status`)
- `cards` (Indexed by `id`, `tenant_id`, `status`)
- `columns` (Indexed by `id`, `tenant_id`, `status`)
- `usersessions` (Indexed by `id`, `tenant_id`, `status`)
- `eventstreams` (Indexed by `id`, `tenant_id`, `status`)

## Security Architecture
- **Isolation Policy**: Session boundary isolation and broadcast event sanitization
- **Path Traversal Defense**: Strictly sandboxed to relative safe bounds.
- **Access Control**: Tenant token boundary enforcement.

## Run Locally
```bash
cd source
node server.js
```
