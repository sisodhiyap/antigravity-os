# AI Chat Application

> **Application Class**: AI & LLM Integration  
> **Synthesized By**: Antigravity OS v5.2 (Mission Controller Benchmark)  
> **Local Port**: `127.0.0.1:3105`  
> **Architecture**: Node.js + SQLite WAL Persistence + Glassmorphism UI + REST API  

## Features
- Real Ollama Inference
- Conversation Persistence
- Model Switcher
- Prompt Presets
- Search

## Entities & Database Tables
- `conversations` (Indexed by `id`, `tenant_id`, `status`)
- `messages` (Indexed by `id`, `tenant_id`, `status`)
- `systemprompts` (Indexed by `id`, `tenant_id`, `status`)
- `modelconfigs` (Indexed by `id`, `tenant_id`, `status`)
- `searchindexs` (Indexed by `id`, `tenant_id`, `status`)

## Security Architecture
- **Isolation Policy**: Prompt injection mitigation and local AI gateway binding
- **Path Traversal Defense**: Strictly sandboxed to relative safe bounds.
- **Access Control**: Tenant token boundary enforcement.

## Run Locally
```bash
cd source
node server.js
```
