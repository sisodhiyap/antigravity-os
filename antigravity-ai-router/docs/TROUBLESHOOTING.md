# TROUBLESHOOTING GUIDE

## Common Issues & Solutions

### 1. PowerShell Script Execution Restrictions
- **Symptom**: `npm.ps1 cannot be loaded because running scripts is disabled on this system.`
- **Solution**: Execute npm / npx commands using `cmd /c "npm ..."` or `npx tsx ...`.

### 2. Ollama Endpoint Unreachable
- **Symptom**: `Connection refused at 127.0.0.1:11434`.
- **Solution**: Ensure Ollama is running in system tray or run `ollama serve` in terminal.

### 3. Rate Limit (429) Triggered
- **Solution**: The Fallback Engine automatically redirects requests to the next model in the chain (`qwen2.5-coder:14b` $\rightarrow$ `omniroute/free-coder` $\rightarrow$ `antigravity-native-premium`).
