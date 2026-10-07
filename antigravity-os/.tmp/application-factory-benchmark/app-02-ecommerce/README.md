# E-Commerce Platform

> **Application Class**: E-Commerce  
> **Synthesized By**: Antigravity OS v5.2 (Mission Controller Benchmark)  
> **Local Port**: `127.0.0.1:3102`  
> **Architecture**: Node.js + SQLite WAL Persistence + Glassmorphism UI + REST API  

## Features
- Catalog
- Search & Filter
- Product Details
- Cart Management
- Checkout Simulation
- Admin CRUD

## Entities & Database Tables
- `users` (Indexed by `id`, `tenant_id`, `status`)
- `products` (Indexed by `id`, `tenant_id`, `status`)
- `categorys` (Indexed by `id`, `tenant_id`, `status`)
- `cartitems` (Indexed by `id`, `tenant_id`, `status`)
- `orders` (Indexed by `id`, `tenant_id`, `status`)
- `orderitems` (Indexed by `id`, `tenant_id`, `status`)

## Security Architecture
- **Isolation Policy**: Price tamper protection and order authorization
- **Path Traversal Defense**: Strictly sandboxed to relative safe bounds.
- **Access Control**: Tenant token boundary enforcement.

## Run Locally
```bash
cd source
node server.js
```
