export type LifecycleState =
  | "UNINITIALIZED"
  | "BOOTING"
  | "INITIALIZING"
  | "READY"
  | "RUNNING"
  | "DEGRADED"
  | "SHUTTING_DOWN"
  | "TERMINATED"
  | "ERROR";

export type ServiceStatus =
  | "REGISTERED"
  | "STARTING"
  | "HEALTHY"
  | "DEGRADED"
  | "STOPPING"
  | "STOPPED"
  | "FAILED";

export type PermissionAction =
  | "READ"
  | "WRITE"
  | "EXECUTE"
  | "SPAWN_PROCESS"
  | "DATABASE_MUTATE"
  | "MCP_INVOKE"
  | "DEPLOY"
  | "SECRET_ACCESS"
  | "ADMIN";

export interface ServiceDefinition {
  name: string;
  version: string;
  description: string;
  dependencies: string[];
  requiredPermissions: PermissionAction[];
  autoStart: boolean;
  restartOnFailure: boolean;
  maxRestarts?: number;
  healthCheckIntervalMs?: number;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  healthCheck?: () => Promise<{ healthy: boolean; details?: Record<string, any> }>;
}

export interface ServiceRuntimeInfo {
  definition: ServiceDefinition;
  status: ServiceStatus;
  startedAt?: Date;
  stoppedAt?: Date;
  lastHealthCheck?: Date;
  healthDetails?: Record<string, any>;
  restartCount: number;
  error?: string;
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  entryPoint: string;
  permissions: PermissionAction[];
  dependencies: string[];
  enabled: boolean;
}

export interface KernelPlugin {
  manifest: PluginManifest;
  initialize: (kernel: any) => Promise<void>;
  shutdown: () => Promise<void>;
}

export interface KernelEvent<T = any> {
  id: string;
  topic: string;
  source: string;
  timestamp: string;
  payload: T;
}

export type EventHandler<T = any> = (event: KernelEvent<T>) => void | Promise<void>;

export interface KernelTelemetrySnapshot {
  kernelId: string;
  version: string;
  state: LifecycleState;
  uptimeSeconds: number;
  bootTimestamp: string;
  services: {
    total: number;
    healthy: number;
    degraded: number;
    stopped: number;
    failed: number;
  };
  plugins: {
    total: number;
    enabled: number;
  };
  events: {
    totalBroadcasted: number;
    activeSubscribers: number;
  };
  supervisor: {
    activeMonitors: number;
    totalRestarts: number;
  };
}
