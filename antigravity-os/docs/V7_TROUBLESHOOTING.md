# Antigravity OS V7.0 — Troubleshooting & Incident Recovery

## 1. Incident Classification
- `SECURITY`: Unauthorized prompt injection, unredacted secrets, or supply chain tampering.
- `RESOURCE`: GPU VRAM exhaustion, host RAM limits, or disk space starvation.
- `MODEL`: Model unreachable, high latency timeout, or inference format mismatch.

## 2. Emergency Recovery Steps
```bash
# 1. Inspect active incident in Command Center
npm run verify:v7:release

# 2. If emergency stopped, release with owner key
# Execute via OwnerApprovalCenter API
```
