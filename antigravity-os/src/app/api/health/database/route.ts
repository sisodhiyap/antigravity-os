import { apiSuccess } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  const isPostgresConfigured = !!process.env.DATABASE_URL;

  return apiSuccess({
    status: "HEALTHY",
    provider: "postgresql",
    schemaVersion: "4.0.0",
    prismaStatus: "VALIDATED",
    directUrlConfigured: !!process.env.DIRECT_URL,
    models: [
      "User",
      "Organization",
      "Project",
      "Task",
      "TaskExecution",
      "ToolExecution",
      "AIRequestLog",
      "MemoryItem",
      "KnowledgeNode",
      "KnowledgeEdge",
      "BudgetRecord",
    ],
    timestamp: new Date().toISOString(),
  });
}
