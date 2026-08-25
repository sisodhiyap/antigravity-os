# OLLAMA INTEGRATION GUIDE

## Endpoint
`http://127.0.0.1:11434`

## Discovered Local Models
- `qwen2.5-coder:14b` (9.0 GB)
- `deepseek-r1:7b` (4.7 GB)
- `qwen2.5-coder:7b` (4.7 GB)
- `llama3.1:latest` (4.9 GB)
- `minicpm-v:latest` (5.5 GB)
- `nomic-embed-text:latest` (274 MB)

## Adding New Models
Whenever a new model is pulled (`ollama pull <model>`), the dynamic router automatically detects it on system sync.
