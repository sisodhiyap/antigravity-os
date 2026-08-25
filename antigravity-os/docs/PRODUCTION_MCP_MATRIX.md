# OMNICRAFT PRODUCTION MCP GOVERNANCE MATRIX

## 1. Installed MCP Roster Status

All 8 workspace MCP servers are monitored by the `mcpRegistry`:

| MCP Server Name | Health Status | Primary Tool Scope | Workspace Permission |
| :--- | :--- | :--- | :--- |
| **StitchMCP** | 🟢 HEALTHY | Component variant generation | Read/Write (Scoped) |
| **Blender** | 🟢 HEALTHY | GLTF procedural rendering | Read/Write (Scoped) |
| **Playwright** | 🟢 HEALTHY | E2E browser viewport testing | Read/Write (Sandbox) |
| **Prisma-Studio** | 🟢 HEALTHY | Schema inspection & Studio | Read/Write (DB) |
| **Memory-Graph** | 🟢 HEALTHY | Concept relation mapping | Read/Write (Graph) |
| **Puppeteer** | 🟢 HEALTHY | Static HTML page extraction | Read/Write (Sandbox) |
| **Mobbin** | 🟢 HEALTHY | Design patterns search | Read-Only |
| **Visualization**| 🟢 HEALTHY | Chart rendering | Read-Only |

---

## 2. MCP Failure Degradation Rules
If a non-critical MCP becomes unavailable (e.g. `Blender` is disabled):
1. The kernel updates the registry status to `UNAVAILABLE`.
2. The UI switches the 3D model generator component to the `degraded` state.
3. A descriptive notification is shown: `"3D Engine currently offline. Local fallback mesh compiler active."`
4. The rest of the application remains fully responsive and functional.
