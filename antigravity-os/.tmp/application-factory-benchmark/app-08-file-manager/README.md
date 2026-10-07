# Secure Document Manager

> **Application Class**: File Management & Security  
> **Synthesized By**: Antigravity OS v5.2 (Mission Controller Benchmark)  
> **Local Port**: `127.0.0.1:3108`  
> **Architecture**: Node.js + SQLite WAL Persistence + Glassmorphism UI + REST API  

## Features
- Folder Tree
- Upload Handling
- Search & Filters
- Preview Sandbox
- Path Traversal Defense

## Entities & Database Tables
- `folders` (Indexed by `id`, `tenant_id`, `status`)
- `filemetadatas` (Indexed by `id`, `tenant_id`, `status`)
- `userpermissions` (Indexed by `id`, `tenant_id`, `status`)
- `storagebuckets` (Indexed by `id`, `tenant_id`, `status`)
- `audittrails` (Indexed by `id`, `tenant_id`, `status`)

## Security Architecture
- **Isolation Policy**: Strict path traversal prevention (`../../`), file extension whitelisting, upload isolation
- **Path Traversal Defense**: Strictly sandboxed to relative safe bounds.
- **Access Control**: Tenant token boundary enforcement.

## Run Locally
```bash
cd source
node server.js
```
