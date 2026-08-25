# OMNICRAFT PRODUCTION OPERATIONS & RUNBOOK

## 1. Local Development & Deployment Verification

To start the local workstation environment and Next.js development server:

```powershell
# Install all workspace dependencies
npm install

# Build static components and verify typescript compilation
npm run build

# Start the Next.js 15 production server locally
npm run dev
```

---

## 2. Health Monitoring & Remediation Logs

If a gateway service throws an error or quota is exhausted:

1. **Check Readiness**: Perform a GET request to `/api/health/readiness` to verify internal database connections.
2. **Review Registry Status**: Inspect provider status parameters on the dashboard or query `/api/omnicraft/providers`.
3. **Budget Reset**: If quotas are exceeded, update the allocation in the system settings config panel or let the daily cooldown reset naturally.
4. **Offline Mode**: If internet access is severed, local Ollama endpoints and vector synthesis fallbacks activate automatically to maintain operations.
