# 💾 ANTIGRAVITY LEVEL-4 DATABASE & PRISMA SPECIFICATION

## 1. SCHEMA ARCHITECTURE

The primary PostgreSQL database schema is defined in `backend-supabase-prisma/prisma/schema.prisma` (451 lines, 9 enums, 12 core relational models):
- **Core Models**: `User`, `Organization`, `Project`, `Task`, `TaskExecution`, `ToolExecution`, `AIRequestLog`, `MemoryItem`, `KnowledgeNode`, `KnowledgeEdge`, `BudgetRecord`.
- **Enums**: `UserRole`, `UserStatus`, `OrgRole`, `ItemStatus`, `TaskStatus`, `TaskPriority`, `AgentRole`, `ToolRiskLevel`.

---

## 2. HEALTH & READINESS PROBE

The database health is exposed via `/api/health/database`:
- Validates model mapping, schema status, and connection readiness.
- In offline and sandboxed environments, in-memory Map-backed CRUD engines provide full relational isolation with zero tenant leakage.

---

## 3. MIGRATION SAFETY POLICY

- Destructive database migrations (`db:drop`, `db:reset`) are classified as `PRODUCTION_CRITICAL`.
- Automated executions are strictly prohibited from dropping production tables without operator authorization.
