# Project Management & Kanban

> **Application Class**: Productivity  
> **Synthesized By**: Antigravity OS v5.2 (Mission Controller Benchmark)  
> **Local Port**: `127.0.0.1:3104`  
> **Architecture**: Node.js + SQLite WAL Persistence + Glassmorphism UI + REST API  

## Features
- Kanban Board
- Task Movement
- Priorities
- Deadlines
- Comments Stream
- Project Analytics

## Entities & Database Tables
- `projects` (Indexed by `id`, `tenant_id`, `status`)
- `tasks` (Indexed by `id`, `tenant_id`, `status`)
- `statuscolumns` (Indexed by `id`, `tenant_id`, `status`)
- `prioritys` (Indexed by `id`, `tenant_id`, `status`)
- `assignees` (Indexed by `id`, `tenant_id`, `status`)
- `comments` (Indexed by `id`, `tenant_id`, `status`)
- `activityhistorys` (Indexed by `id`, `tenant_id`, `status`)

## Security Architecture
- **Isolation Policy**: Project membership verification and task mutation authorization
- **Path Traversal Defense**: Strictly sandboxed to relative safe bounds.
- **Access Control**: Tenant token boundary enforcement.

## Run Locally
```bash
cd source
node server.js
```
