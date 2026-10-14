/**
 * ANTIGRAVITY OS — SOVEREIGN LOCAL AI FABRIC
 * types.ts: Authoritative data contracts, engine states, hardware models, and licensing matrices.
 */

export type FabricEngineId =
  | "voice-studio"
  | "invokeai"
  | "upscayl"
  | "ace-step"
  | "openshorts"
  | "vane"
  | "odysseus"
  | "dyad"
  | "openmanus"
  | "freellmapi";

export type EngineStatus =
  | "AVAILABLE_LOCAL"
  | "AVAILABLE_WITH_INTERNET"
  | "NOT_INSTALLED"
  | "MODEL_MISSING"
  | "DEPENDENCIES_MISSING"
  | "NOT_CONFIGURED"
  | "STARTING"
  | "RUNNING"
  | "DEGRADED"
  | "STOPPED"
  | "FAILED"
  | "NOT_SUPPORTED_ON_PLATFORM";

export type FabricExecutionMode = "STRICT_OFFLINE" | "HYBRID";

export type EngineCategory =
  | "SPEECH_AUDIO"
  | "IMAGE_GENERATION"
  | "IMAGE_UPSCALING"
  | "MUSIC_GENERATION"
  | "VIDEO_PROCESSING"
  | "RESEARCH_SEARCH"
  | "WORKSPACE_AGENT"
  | "APP_BUILDER"
  | "AUTONOMOUS_OPERATOR"
  | "API_GATEWAY";

export interface HardwareRequirementSpec {
  minCores: number;
  recommendedCores: number;
  minRamGb: number;
  recommendedRamGb: number;
  minVramGb: number;
  recommendedVramGb: number;
  cudaRecommended: boolean;
  directMlSupported: boolean;
  cpuFallbackSupported: boolean;
  diskSpaceRequiredGb: number;
}

export interface EngineLicenseMetadata {
  spdxId: string;
  isCopyleft: boolean;
  redistributionRisk: "LOW" | "MEDIUM" | "HIGH_COPYLEFT" | "PROPRIETARY_COMPONENTS";
  notes: string;
  upstreamRepoUrl: string;
  pinnedVersion: string;
  pinnedCommit: string;
}

export interface EngineModelSpec {
  modelId: string;
  name: string;
  sizeGb: number;
  sha256?: string;
  downloadUrl?: string;
  localPath: string;
  isDownloaded: boolean;
  license: string;
  isLocalOnlyCapable: boolean;
}

export interface LocalEngineMetadata {
  id: FabricEngineId;
  name: string;
  description: string;
  category: EngineCategory;
  upstreamRepo: string;
  pinnedVersion: string;
  pinnedCommit: string;
  license: EngineLicenseMetadata;
  status: EngineStatus;
  isInstalled: boolean;
  isConfigured: boolean;
  isRunning: boolean;
  isOfflineCapable: boolean;
  internetDependency: "NONE" | "OPTIONAL_WEB_RESEARCH" | "REQUIRED_INTERNET_GATEWAY";
  loopbackEndpoint?: string;
  port?: number;
  supportedCapabilities: string[];
  hardwareRequirements: HardwareRequirementSpec;
  models: EngineModelSpec[];
  selectedModel?: string;
  runtimeDependencies: {
    pythonRequired?: boolean;
    pythonMinVersion?: string;
    nodeRequired?: boolean;
    ffmpegRequired?: boolean;
    vulkanRequired?: boolean;
    dockerOptional?: boolean;
  };
  healthCheckMethod: "HTTP_PROBE" | "PROCESS_PID" | "CLI_EXEC" | "FILE_SOCKET";
  lastHealthCheckTimestamp?: string;
  lastErrorSanitized?: string;
  supportsStartStop: boolean;
  supportsCancellation: boolean;
}

export interface FabricJobRequest {
  id: string;
  engineId: FabricEngineId;
  taskType: string;
  inputPayload: Record<string, any>;
  priority: "LOW" | "NORMAL" | "HIGH";
  requiresGpu: boolean;
  estimatedVramMb: number;
  createdAt: string;
  status: "QUEUED" | "RUNNING" | "COMPLETED" | "CANCELLED" | "FAILED";
  progressPercent: number;
  errorMessage?: string;
  outputArtifacts?: string[];
}

export interface FabricDiagnosticsReport {
  timestamp: string;
  fabricMode: FabricExecutionMode;
  hostHardware: {
    cpu: string;
    ramGb: number;
    gpuRenderer: string;
    vramMb: number;
    cudaAvailable: boolean;
  };
  engines: Array<{
    id: FabricEngineId;
    name: string;
    status: EngineStatus;
    offlineCapable: boolean;
    installed: boolean;
    running: boolean;
    lastError?: string;
  }>;
  gpuScheduler: {
    activeJobsCount: number;
    queuedJobsCount: number;
    isGpuLocked: boolean;
    activeGpuEngine?: FabricEngineId;
  };
  networkSafetyAudit: {
    strictOfflineEnforced: boolean;
    blockedOutboundRequestsCount: number;
    quarantinedRemoteCallsCount: number;
  };
}
