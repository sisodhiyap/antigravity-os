# Analytics Platform

> **Application Class**: Data Analytics  
> **Synthesized By**: Antigravity OS v5.2 (Mission Controller Benchmark)  
> **Local Port**: `127.0.0.1:3107`  
> **Architecture**: Node.js + SQLite WAL Persistence + Glassmorphism UI + REST API  

## Features
- CSV/JSON Ingestion
- KPI Computation
- SVG Charts
- Date/Category Filtering
- Export CSV/JSON

## Entities & Database Tables
- `datasets` (Indexed by `id`, `tenant_id`, `status`)
- `datarecords` (Indexed by `id`, `tenant_id`, `status`)
- `kpidefinitions` (Indexed by `id`, `tenant_id`, `status`)
- `categorymetrics` (Indexed by `id`, `tenant_id`, `status`)
- `exportjobs` (Indexed by `id`, `tenant_id`, `status`)

## Security Architecture
- **Isolation Policy**: File size limit and CSV injection defense
- **Path Traversal Defense**: Strictly sandboxed to relative safe bounds.
- **Access Control**: Tenant token boundary enforcement.

## Run Locally
```bash
cd source
node server.js
```
