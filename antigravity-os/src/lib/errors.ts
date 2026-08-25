/**
 * Centralized, typed, traceable error hierarchy for the Antigravity platform.
 */

export type ErrorCode =
  | "AUTH_REQUIRED"
  | "FORBIDDEN"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "PROVIDER_TIMEOUT"
  | "PROVIDER_UNAVAILABLE"
  | "BUDGET_EXCEEDED"
  | "DATABASE_ERROR"
  | "TOOL_EXECUTION_ERROR"
  | "TASK_TIMEOUT"
  | "TASK_CANCELLED"
  | "ITERATION_LIMIT_EXCEEDED"
  | "INTERNAL_ERROR";

export interface AppErrorDetails {
  code: ErrorCode;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
  requestId?: string;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;
  public readonly requestId?: string;

  constructor(code: ErrorCode, message: string, statusCode = 500, details?: Record<string, unknown>, requestId?: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.requestId = requestId;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public toJSON(): AppErrorDetails {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      requestId: this.requestId,
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>, requestId?: string) {
    super("VALIDATION_ERROR", message, 400, details, requestId);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required", details?: Record<string, unknown>, requestId?: string) {
    super("AUTH_REQUIRED", message, 401, details, requestId);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Access forbidden", details?: Record<string, unknown>, requestId?: string) {
    super("FORBIDDEN", message, 403, details, requestId);
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string, requestId?: string) {
    super("NOT_FOUND", `${resource}${id ? ` (${id})` : ""} was not found`, 404, { resource, id }, requestId);
    this.name = "NotFoundError";
  }
}

export class AIProviderError extends AppError {
  constructor(provider: string, message: string, code: ErrorCode = "PROVIDER_UNAVAILABLE", details?: Record<string, unknown>, requestId?: string) {
    super(code, `AI Provider [${provider}] Error: ${message}`, 502, { provider, ...details }, requestId);
    this.name = "AIProviderError";
  }
}

export class BudgetExceededError extends AppError {
  constructor(currentSpend: number, limit: number, scope: string, requestId?: string) {
    super(
      "BUDGET_EXCEEDED",
      `Budget exceeded for ${scope}: spend $${currentSpend.toFixed(4)} exceeds limit $${limit.toFixed(4)}`,
      429,
      { currentSpend, limit, scope },
      requestId
    );
    this.name = "BudgetExceededError";
  }
}

export class ToolExecutionError extends AppError {
  constructor(toolName: string, message: string, details?: Record<string, unknown>, requestId?: string) {
    super("TOOL_EXECUTION_ERROR", `Tool [${toolName}] failed: ${message}`, 500, { toolName, ...details }, requestId);
    this.name = "ToolExecutionError";
  }
}

export class TaskTimeoutError extends AppError {
  constructor(taskId: string, timeoutMs: number, requestId?: string) {
    super("TASK_TIMEOUT", `Task [${taskId}] timed out after ${timeoutMs}ms`, 408, { taskId, timeoutMs }, requestId);
    this.name = "TaskTimeoutError";
  }
}
