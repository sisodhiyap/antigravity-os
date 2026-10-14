/**
 * ANTIGRAVITY OS — PERSONAL INTELLIGENCE V1
 * types.ts: Core interfaces for Personal AI Companion, Memory Fabric, and Bounded Autonomy
 */

export type MemoryCategory =
  | "PREFERENCE"
  | "PROJECT"
  | "TECHNICAL"
  | "DECISION"
  | "WORKFLOW"
  | "TEMPORARY";

export type MemorySourceType =
  | "USER_EXPLICIT"
  | "AGENT_OBSERVED"
  | "TASK_RESULT"
  | "TOOL_OUTPUT";

export type SensitivityLevel =
  | "PUBLIC"
  | "INTERNAL"
  | "PRIVATE"
  | "RESTRICTED";

export type PrivacyLevel =
  | "LOCAL_ONLY"
  | "LOCAL_PREFERRED"
  | "CLOUD_PERMITTED"
  | "ASK_EVERY_TIME";

export type TaskStatus =
  | "PROPOSED"
  | "AWAITING_APPROVAL"
  | "APPROVED"
  | "RUNNING"
  | "VERIFYING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type ActionType =
  | "FILE_WRITE"
  | "CODE_PATCH"
  | "SHELL_EXEC"
  | "DB_MUTATION"
  | "CLOUD_UPLOAD"
  | "PACKAGE_INSTALL"
  | "READ_ONLY";

export interface PersonalMemoryRecord {
  id: string;
  userId: string;
  category: MemoryCategory;
  content: string;
  summary: string;
  sourceType: MemorySourceType;
  sourceReference?: string | null;
  confidence: number;
  importance: number;
  pinned: boolean;
  userConfirmed: boolean;
  sensitivity: SensitivityLevel;
  expiresAt?: string | null;
  lastAccessedAt: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface IntelligenceConversationRecord {
  id: string;
  userId: string;
  title: string;
  projectId?: string | null;
  privacyLevel: PrivacyLevel;
  createdAt: string;
  updatedAt: string;
}

export interface IntelligenceMessageRecord {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  provider?: string | null;
  model?: string | null;
  latencyMs?: number | null;
  isLocal: boolean;
  isFallback: boolean;
  fallbackReason?: string | null;
  toolCallsJson?: string | null;
  evidenceIdsJson?: string | null;
  createdAt: string;
}

export interface IntelligenceTaskRecord {
  id: string;
  conversationId?: string | null;
  userId: string;
  title: string;
  description: string;
  status: TaskStatus;
  autonomyLevel: number;
  privacyLevel: PrivacyLevel;
  planJson?: string | null;
  toolsCalledJson?: string | null;
  evidenceHash?: string | null;
  error?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IntelligenceApprovalRecord {
  id: string;
  taskId: string;
  userId: string;
  actionType: ActionType;
  targetResource: string;
  description: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  decisionBy?: string | null;
  decisionAt?: string | null;
  createdAt: string;
}

export interface ContextBundle {
  userId: string;
  activeProject?: {
    id: string;
    name: string;
    description: string;
    brief?: string;
  } | null;
  relevantMemories: PersonalMemoryRecord[];
  gitState: {
    headCommit: string;
    branch: string;
    isClean: boolean;
  };
  providerHealth: Array<{
    name: string;
    available: boolean;
    error?: string;
  }>;
  availableTools: Array<{
    serverName: string;
    toolsCount: number;
    status: string;
    capabilities: string[];
  }>;
  privacyLevel: PrivacyLevel;
}
