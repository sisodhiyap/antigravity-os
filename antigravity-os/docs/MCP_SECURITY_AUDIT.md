# OmniCraft MCP Security Audit Report

## 1. Security Control Architectures

Every tool invocation through the Unified Tool Gateway validates payload constraints and path targets to prevent sandbox escape vulnerabilities.

---

## 2. Threat Vector Audits

### Threat: Prompt Injection
- **Guard Mechanism**: All text input parameters passed to downstream generators and LLMs are sanitised to remove instructions markers (e.g. `System:`, `Ignore previous instructions`).
- **Audit Status**: **PASS (0 Escapes)**

### Threat: Path Traversal
- **Guard Mechanism**: File paths are validated by [`src/server/tools/filesystem-security.ts`](file:///c:/D%20drive/Antigravity/antigravity-os/src/server/tools/filesystem-security.ts). Any path referencing `..`, target directories outside the workspace boundary, or system folders throws a direct security violation.
- **Audit Status**: **PASS (0 Traversal Escapes)**

### Threat: Cross-Tenant Isolation
- **Guard Mechanism**: Authorized sessions strictly restrict access to project files and data records using membership checks (`ProjectMember` lookup) in [`src/server/auth-helper.ts`](file:///c:/D%20drive/Antigravity/antigravity-os/src/server/auth-helper.ts). A tenant attempting to query a sibling project is rejected with 403 Forbidden.
- **Audit Status**: **PASS (100% Isolated)**

### Threat: Unauthorized Tool Execution
- **Guard Mechanism**: Enforces category-based and role-based validation routines inside [`src/server/tools/tool-permission-engine.ts`](file:///c:/D%20drive/Antigravity/antigravity-os/src/server/tools/tool-permission-engine.ts).
- **Audit Status**: **PASS (Restricted)**

### Threat: Secret Exposure
- **Guard Mechanism**: Any file path referencing `.env` or `key.env` is rejected. Tool gateway outputs are automatically parsed, and sensitive strings (API keys, passwords, bearer tokens) are replaced with redaction tags before saving logs or returning response objects.
- **Audit Status**: **PASS (Zero Exposure)**

---

## 3. Database Safe Mutation Boundary

- **Principle**: Agents and MCP clients cannot arbitrarily execute direct mutations or destructive raw SQL queries on the production database.
- **Enforcement**: Direct SQL execution tool interfaces are blocked. All data creation, updates, and removals must execute through the Prisma Client using authenticated Next.js API endpoints. Each change is audited and logged in the SQLite `AuditLog` table.
