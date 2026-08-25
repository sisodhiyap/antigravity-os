import type {
  User,
  Profile,
  Organization,
  Membership,
  ResourceItem,
  Project,
  Task,
  TaskExecution,
  ToolExecution,
  AIRequestLog,
  MemoryItem,
  KnowledgeNode,
  KnowledgeEdge,
  BudgetRecord,
  AuditLog,
  UserRole,
  UserStatus,
  OrgRole,
  ItemStatus,
  TaskStatus,
  TaskPriority,
  AgentRole,
  ToolRiskLevel,
  AIProviderType,
} from '@prisma/client';

export type {
  User,
  Profile,
  Organization,
  Membership,
  ResourceItem,
  Project,
  Task,
  TaskExecution,
  ToolExecution,
  AIRequestLog,
  MemoryItem,
  KnowledgeNode,
  KnowledgeEdge,
  BudgetRecord,
  AuditLog,
  UserRole,
  UserStatus,
  OrgRole,
  ItemStatus,
  TaskStatus,
  TaskPriority,
  AgentRole,
  ToolRiskLevel,
  AIProviderType,
};

export type UserWithProfile = User & { profile: Profile | null };

export interface CreateUserInput {
  id?: string;
  email: string;
  role?: UserRole;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateUserInput {
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  priority?: TaskPriority;
  assignedAgent?: AgentRole;
  organizationId: string;
  projectId?: string;
  createdById: string;
  inputPayload?: Record<string, unknown>;
  maxIterations?: number;
  tokenBudget?: number;
}

export interface CreateAIRequestLogInput {
  provider: AIProviderType;
  modelName: string;
  promptTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
  latencyMs: number;
  status?: string;
  errorMessage?: string;
  fallbackChain?: string[];
  taskId?: string;
  userId?: string;
}
