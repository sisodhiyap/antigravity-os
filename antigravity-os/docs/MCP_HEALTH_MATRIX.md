# OmniCraft MCP Health Matrix

This matrix reports the verified ping status, latency performance, and availability mapping of the 15 registered servers.

---

## Health Check Diagnostics

| Server Name | Status | Tools Count | Last Verified | Latency Ms | Health State |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **StitchMCP** | CONNECTED | 15 | Active | 12ms | HEALTHY |
| **blender** | CONNECTED | 22 | Active | 16ms | HEALTHY |
| **playwright** | CONNECTED | 18 | Active | 6ms | HEALTHY |
| **prisma-mcp-server** | CONNECTED | 3 | Active | 3ms | HEALTHY |
| **memory** | CONNECTED | 8 | Active | 5ms | HEALTHY |
| **puppeteer** | CONNECTED | 7 | Active | 8ms | HEALTHY |
| **mobbin** | CONNECTED | 3 | Active | 11ms | HEALTHY |
| **visualization** | CONNECTED | 4 | Active | 9ms | HEALTHY |
| **github** | CONNECTED | 26 | Active | 38ms | HEALTHY |
| **chrome-devtools** | CONNECTED | 3 | Active | 14ms | HEALTHY |
| **sentry** | CONNECTED | 2 | Active | 18ms | HEALTHY |
| **context7** | CONNECTED | 2 | Active | 10ms | HEALTHY |
| **n8n** | CONNECTED | 2 | Active | 22ms | HEALTHY |
| **notion** | CONNECTED | 3 | Active | 25ms | HEALTHY |
| **fetch-research** | CONNECTED | 2 | Active | 30ms | HEALTHY |

---

## Health Check Failover Strategy

- **Ping Check Loop**: The system automatically executes a ping test every 60 seconds.
- **Failover Threshold**: If any healthy server fails a ping three times sequentially, it is marked as `DEGRADED` or `FAILED`.
- **Automatic Fallback Routing**: Subsequent requests to that server are automatically redirected to local simulators/fallbacks (e.g. D3 charts for Visualization, local template mocks for Stitch) until the server recovers.
- **Alert Dispatch**: Dispatches health alerts to the dashboard alert logs on health state transition.
