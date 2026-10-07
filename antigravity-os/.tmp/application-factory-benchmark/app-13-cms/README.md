# Content Management System (CMS)

> **Application Class**: Publishing & CMS  
> **Synthesized By**: Antigravity OS v5.2 (Mission Controller Benchmark)  
> **Local Port**: `127.0.0.1:3113`  
> **Architecture**: Node.js + SQLite WAL Persistence + Glassmorphism UI + REST API  

## Features
- Draft/Publish Lifecycle
- Rich Content Editor
- Category Taxonomy
- Search Index
- Editorial Roles

## Entities & Database Tables
- `articles` (Indexed by `id`, `tenant_id`, `status`)
- `pages` (Indexed by `id`, `tenant_id`, `status`)
- `drafts` (Indexed by `id`, `tenant_id`, `status`)
- `categorys` (Indexed by `id`, `tenant_id`, `status`)
- `mediaassets` (Indexed by `id`, `tenant_id`, `status`)
- `editorialusers` (Indexed by `id`, `tenant_id`, `status`)

## Security Architecture
- **Isolation Policy**: HTML sanitization against XSS in draft/published content
- **Path Traversal Defense**: Strictly sandboxed to relative safe bounds.
- **Access Control**: Tenant token boundary enforcement.

## Run Locally
```bash
cd source
node server.js
```
