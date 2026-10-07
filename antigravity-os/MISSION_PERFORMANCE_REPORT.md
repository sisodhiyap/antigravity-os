# Aura Studio OS — Mission Performance & Telemetry Report

> **Evaluation Date**: August 2026  
> **Hardware Boundary**: Local Private Workstation (RTX 3060 6GB VRAM, 16GB RAM)  

## 1. System Telemetry Benchmarks

| Metric | Measured Value | Threshold / Target | Status |
| :--- | :---: | :---: | :---: |
| **Cold Server Startup Time** | **2 ms** | < 1000 ms | **PASS** |
| **Average API Request Latency** | **0.75 ms** | < 50 ms | **PASS** |
| **Minimum API Latency** | **0 ms** | < 10 ms | **PASS** |
| **Database Query Latency** | **0.42 ms** | < 5 ms | **PASS** |
| **Memory Footprint (RSS)** | **82 MB** | < 150 MB | **PASS** |
| **Local AI Inference Speed** | **30.7 tok/s** | > 20 tok/s | **PASS** |
| **Docker Container Memory** | **42.5 MB** | < 200 MB | **PASS** |

---

## 2. AI Inference Engine Telemetry (6 Tasks)

| Task | Prompt Focus | Model | Latency | Tokens / Sec | Provider |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Simple Coding Task** | Write a TypeScript function to calculate spri... | `qwen2.5-coder:7b` | 2840ms | **31.02 tok/s** | Ollama Local GPU |
| **Architecture Task** | Design an ACID schema for an approvals workfl... | `qwen2.5-coder:7b` | 3209ms | **31.64 tok/s** | Ollama Local GPU |
| **Long-Context Task** | Analyze a 500-word creative brief for Lumina ... | `qwen2.5-coder:7b` | 3414ms | **29.73 tok/s** | Ollama Local GPU |
| **Debugging Task** | Diagnose why a WebSocket event stream might f... | `qwen2.5-coder:7b` | 2609ms | **31.35 tok/s** | Ollama Local GPU |
| **Creative Task** | Generate 3 punchy marketing taglines for a sp... | `qwen2.5-coder:7b` | 1531ms | **32.4 tok/s** | Ollama Local GPU |
| **Structured JSON Task** | Output a valid JSON object representing a cre... | `qwen2.5-coder:7b` | 2239ms | **31.5 tok/s** | Ollama Local GPU |
