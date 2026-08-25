# ANTIGRAVITY IDE — SYSTEM DIAGNOSTIC REPORT

**Generated At**: 2026-08-19 11:10:00 IST  
**Environment**: Antigravity IDE Autonomous Engineering Workstation

---

## 1. Hardware Specification
- **System**: ASUS ROG Zephyrus G15 GA503RM_GA503RM
- **OS**: Microsoft Windows 11 Home (Version 10.0.26200)
- **CPU**: AMD Ryzen 9 6900HS with Radeon Graphics (8 Cores, 16 Logical Processors)
- **RAM**: 16 GB Physical Memory (16,366 MB)
- **GPU 1**: NVIDIA GeForce RTX 3060 Laptop GPU (6 GB VRAM, Driver 32.0.15.9200)
- **GPU 2**: AMD Radeon(TM) Graphics (512 MB VRAM)
- **CUDA Runtime**: Supported via `nvidia-smi` at `C:\Windows\System32\nvidia-smi.exe`

---

## 2. Installed Software & Tooling
- **Node.js**: v24.16.0 (`C:\Program Files\nodejs\node.exe`)
- **npm**: v11.x (Execution policy bypassed using `cmd /c` / native node runner)
- **Python**: Python 3.13.14 (`C:\Python313\python.exe`)
- **Git**: git version 2.55.0.windows.4 (`C:\Program Files\Git\cmd\git.exe`)
- **Ollama**: v0.32.14 (`C:\Users\sisod\AppData\Local\Programs\Ollama\ollama.exe`)
- **Docker**: Not installed / Not in PATH $\rightarrow$ *Native Node.js execution selected for maximum performance*
- **OmniRoute**: v3.8.50 cloned at `c:\D drive\Antigravity\antigravity-ai-router\OmniRoute`

---

## 3. Ollama Status & Discovered Local Models
- **Status**: Running locally on `http://127.0.0.1:11434`
- **Installed Models**:
  1. `qwen2.5-coder:14b` (9.0 GB) — **Primary Local Coding Model**
  2. `deepseek-r1:7b` (4.7 GB) — **Reasoning & Math Engine**
  3. `qwen2.5-coder:7b` (4.7 GB) — **Fast Autocomplete & Fixes**
  4. `llama3.1:latest` (4.9 GB) — **General Text & Analysis**
  5. `minicpm-v:latest` (5.5 GB) — **Vision & Layout Model**
  6. `nomic-embed-text:latest` (274 MB) — **Local Embeddings Engine**

---

## 4. Active Network Ports
- `11434`: Bound to Ollama (`http://127.0.0.1:11434`)
- `3000`: Bound to 9Router Local Web Server
- `8080`: Assigned to **Antigravity AI Router API Gateway & Dashboard**

---

## 5. Recommended Routing Strategy
1. **Level 1 (Local First)**: Route all low-level, routine, and code generation tasks directly to local Ollama `qwen2.5-coder:14b` and `deepseek-r1:7b`.
2. **Level 2 (OmniRoute Free Providers)**: Route medium-to-large context or secondary tasks to free cloud endpoints via OmniRoute.
3. **Level 3 (Antigravity Native)**: Reserve native premium quotas strictly for high-level architecture, complex multi-file refactoring, or when local/free quality checks fail.
