/**
 * ANTIGRAVITY OS v7.0 — FINAL PRODUCT RELEASE & LONG-TERM GOVERNANCE
 * GovernanceTypes.ts: Type contracts for Capability, Model, ComfyUI, Ollama, Health Plane, Lifecycle, Approvals & Incidents
 */

// 1. Capability Categories & States
export type CapabilityCategory =
  | "CORE"
  | "AGENT"
  | "MODEL"
  | "VISION"
  | "CODE"
  | "DOCUMENT"
  | "IMAGE"
  | "VIDEO"
  | "AUDIO"
  | "3D"
  | "PARSER"
  | "DATABASE"
  | "BROWSER"
  | "PLUGIN"
  | "EXPORT"
  | "INTEGRATION";

export type CapabilityState =
  | "AVAILABLE"
  | "DEGRADED"
  | "UNAVAILABLE"
  | "UNKNOWN"
  | "QUARANTINED";

export interface RuntimeCapability {
  id: string;
  name: string;
  category: CapabilityCategory;
  version: string;
  provider: string;
  isLocal: boolean;
  requiredHardware: string;
  availability: CapabilityState;
  health: "HEALTHY" | "DEGRADED" | "UNHEALTHY" | "UNKNOWN";
  verificationStatus: "VERIFIED" | "UNPROVEN" | "CONTRADICTED";
  securityStatus: "SECURE" | "SUSPECT" | "QUARANTINED";
  lastVerified: number;
  evidenceRef: string;
}

// 2. Model Reality
export interface ModelRealityRecord {
  provider: string;
  model: string;
  version: string;
  isLocal: boolean;
  endpoint: string;
  capabilities: string[];
  contextLimit?: number;
  hardwareRequirement: string;
  vramRequirementMb?: number;
  latencyMs: number;
  lastSuccessfulExecution?: number;
  failureCount: number;
  fallbackPriority: number;
  status: "CONFIGURED" | "EXECUTABLE" | "UNAVAILABLE";
}

// 3. ComfyUI Reality Record
export interface ComfyUIRealityStatus {
  installationPath: string;
  version: string;
  serverStatus: "ONLINE" | "OFFLINE" | "UNREACHABLE";
  apiStatus: "AVAILABLE" | "DEGRADED" | "UNAVAILABLE";
  gpu: string;
  vramAvailableMb: number;
  loadedModels: string[];
  customNodes: string[];
  workflowAvailability: {
    image: boolean;
    video: boolean;
    audio: boolean;
    threeD: boolean;
  };
  queueState: {
    pending: number;
    running: number;
  };
  lastSuccessfulGeneration?: number;
}

// 4. Ollama Reality Record
export interface OllamaRealityStatus {
  installationPath: string;
  serverStatus: "ONLINE" | "OFFLINE";
  models: string[];
  gpuAvailable: boolean;
  ramFreeMb: number;
  testedLatencyMs: number;
  lastSuccessfulInference?: number;
}

// 5. Runtime Health Plane
export type HealthStatus =
  | "HEALTHY"
  | "DEGRADED"
  | "UNAVAILABLE"
  | "QUARANTINED"
  | "UNKNOWN";

export interface ComponentHealth {
  component: string;
  status: HealthStatus;
  evidence: string;
  lastCheck: number;
}

export interface RuntimeHealthReport {
  timestamp: number;
  overall: HealthStatus;
  components: Record<string, ComponentHealth>;
  metrics: {
    cpuPercent: number;
    ramUsedMb: number;
    ramTotalMb: number;
    vramUsedMb: number;
    vramTotalMb: number;
    diskFreeGb: number;
    p50LatencyMs: number;
    p95LatencyMs: number;
    p99LatencyMs: number;
  };
}

// 6. Project Lifecycle States (15 States)
export type ProjectState =
  | "NEW"
  | "IMPORTING"
  | "UNDERSTANDING"
  | "VERIFYING"
  | "PLANNING"
  | "BUILDING"
  | "TESTING"
  | "REVIEW"
  | "APPROVAL"
  | "EXPORTING"
  | "AUDITING"
  | "RELEASED"
  | "FAILED"
  | "ROLLED_BACK"
  | "ARCHIVED";

export interface ProjectStateTransition {
  projectId: string;
  fromState: ProjectState;
  toState: ProjectState;
  actor: string;
  reason: string;
  evidence: string;
  timestamp: number;
}

// 7. Owner Approval Record
export interface OwnerApprovalRequest {
  id: string;
  request: string;
  risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  scope: string;
  evidence: string;
  proposedAction: string;
  ownerSignature?: string;
  timestamp: number;
  decision: "PENDING" | "APPROVED" | "REJECTED";
}

// 8. Incident Classes & Lifecycle
export type IncidentClass =
  | "SECURITY"
  | "MODEL"
  | "PLUGIN"
  | "PARSER"
  | "MEDIA"
  | "DATABASE"
  | "NETWORK"
  | "AGENT"
  | "EVIDENCE"
  | "PERFORMANCE"
  | "RESOURCE";

export type IncidentStage =
  | "DETECTED"
  | "CLASSIFIED"
  | "CONTAINED"
  | "INVESTIGATED"
  | "RESOLVED"
  | "VERIFIED"
  | "CLOSED";

export interface GovernanceIncident {
  id: string;
  title: string;
  category: IncidentClass;
  stage: IncidentStage;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  detectedAt: number;
  updatedAt: number;
  rootCause?: string;
  mitigation: string;
  evidenceIds: string[];
}
