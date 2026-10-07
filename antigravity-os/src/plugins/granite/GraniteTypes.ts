/**
 * ANTIGRAVITY OS v7.0 — IBM GRANITE 4.2 SOVEREIGN MODEL FABRIC
 * src/plugins/granite/GraniteTypes.ts
 * 
 * Strict type definitions for IBM Granite 4.2 family integration,
 * hardware profiling, thinking modes, tool calling, routing, and trust verification.
 */

export type GraniteModelId =
  | "granite-4.2-3b"
  | "granite-4.2-8b"
  | "granite-4.2-30b"
  | "granite-4.2:3b-instruct-q4_K_M"
  | "granite-4.2:8b-instruct-q4_K_M"
  | "granite-4.2:30b-instruct-q4_K_M"
  | "granite-4.2:latest";

export type GraniteModelStatus =
  | "DISCOVERED"
  | "INSTALLED"
  | "LOADED"
  | "EXECUTABLE"
  | "HEALTHY"
  | "DEGRADED"
  | "UNAVAILABLE"
  | "QUARANTINED"
  | "UNKNOWN";

export type GraniteThinkingMode =
  | "FAST"
  | "LOW_EFFORT"
  | "THINKING"
  | "DEEP_REASONING";

export type GraniteTaskSpecialization =
  | "REASONING"
  | "PLANNING"
  | "CODE"
  | "CODE_REVIEW"
  | "TOOL_CALLING"
  | "STRUCTURED_OUTPUT"
  | "DOCUMENT_ANALYSIS"
  | "DECK_STRUCTURE"
  | "STORY_DEVELOPMENT"
  | "QUALITY_ANALYSIS"
  | "ERROR_ANALYSIS"
  | "SELF_REPAIR_PLANNING"
  | "UX_ANALYSIS"
  | "PRODUCT_ARCHITECTURE"
  | "TEST_GENERATION"
  | "TEST_FAILURE_ANALYSIS";

export type GraniteBackend =
  | "OLLAMA_LOCAL"
  | "GGUF_DIRECT"
  | "AIRLLM_SEQUENTIAL"
  | "VLLM_SERVER"
  | "FALLBACK_DETERMINISTIC"
  | "APPROVED_CLOUD";

export interface GraniteHardwareProfile {
  cpuCores: number;
  cpuModel: string;
  totalRamGb: number;
  availableRamGb: number;
  gpuName: string;
  gpuVendor: "NVIDIA" | "AMD" | "INTEL" | "APPLE" | "NONE" | "UNKNOWN";
  vramGb: number;
  cudaAvailable: boolean;
  directMlAvailable: boolean;
  rocmAvailable: boolean;
  diskFreeGb: number;
  quantizationSupported: string[];
  recommendedModel: GraniteModelId;
  maximumSafeContext: number;
  estimatedLatencyMs: number;
  estimatedMemoryUsageGb: number;
  confidence: number;
  measuredAt: string;
}

export interface GraniteModelMetadata {
  modelId: GraniteModelId;
  name: string;
  provider: "IBM_Granite" | "Local_Ollama" | "InProcess_Fallback";
  version: "4.2";
  parameterSize: "3B" | "8B" | "30B";
  format: "GGUF" | "SAFEtensors" | "OLLAMA_BLOB" | "IN_PROCESS";
  quantization: "FP16" | "Q8_0" | "Q4_K_M" | "Q4_0" | "FP4" | "NATIVE";
  license: "Apache-2.0";
  source: string;
  checksum: string;
  installed: boolean;
  loaded: boolean;
  backend: GraniteBackend;
  contextLimit: number;
  reasoningSupport: boolean;
  toolCallSupport: boolean;
  supportedLanguages: string[];
  hardwareRequirements: {
    minRamGb: number;
    recommendedVramGb: number;
    recommendedCpuCores: number;
  };
  measuredLatencyMs: number;
  lastVerified: string;
  verificationStatus: GraniteModelStatus;
}

export interface GraniteToolCallSpec {
  toolName: string;
  arguments: Record<string, unknown>;
  argumentsHash: string;
  permissionRequired: "READ_ONLY" | "LOW_RISK_WRITE" | "HIGH_RISK_WRITE" | "PRODUCTION_CRITICAL";
  sandboxIsolated: boolean;
  timestamp: string;
  evidenceId: string;
}

export interface GraniteToolExecutionResult {
  toolName: string;
  success: boolean;
  result: unknown;
  error?: string;
  evidenceId: string;
  durationMs: number;
  permissionApproved: boolean;
}

export interface GraniteInferenceRequest {
  prompt: string;
  systemPrompt?: string;
  taskType: GraniteTaskSpecialization;
  thinkingMode?: GraniteThinkingMode;
  contextLength?: number;
  toolsAvailable?: string[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  requireStructuredJson?: boolean;
  jsonSchema?: Record<string, unknown>;
  preferredModel?: GraniteModelId;
  localOnly?: boolean;
}

export interface GraniteInferenceResponse {
  success: boolean;
  modelUsed: GraniteModelId;
  backendUsed: GraniteBackend;
  thinkingMode: GraniteThinkingMode;
  content: string;
  parsedJson?: unknown;
  toolCalls?: GraniteToolCallSpec[];
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    thinkingTokens?: number;
  };
  durationMs: number;
  provenance: {
    claimIds: string[];
    evidenceStatus: "GENERATED" | "INFERRED" | "UNVERIFIED";
    hash: string;
    signature: string;
    modelSelfClaimIgnored: true;
  };
  error?: string;
}

export interface GraniteRoutingDecision {
  selectedModel: GraniteModelId;
  backend: GraniteBackend;
  reasoningMode: GraniteThinkingMode;
  fallbackChain: Array<{ model: string; backend: GraniteBackend; reason: string }>;
  selectionReason: string;
  hardwareFitScore: number;
  estimatedMemoryGb: number;
  privacyEnforced: boolean;
}

export interface GraniteOwnerSettings {
  graniteEnabled: boolean;
  autoModelSelection: boolean;
  preferredGraniteSize: "3B" | "8B" | "30B" | "AUTO";
  defaultThinkingMode: GraniteThinkingMode;
  maxContextLength: number;
  maxVramAllocationGb: number;
  maxRamAllocationGb: number;
  allowModelDownload: boolean;
  allowToolCalling: boolean;
  allowWebResearch: boolean;
  allowCloudFallback: boolean;
  strictLocalMode: boolean;
  benchmarkMode: boolean;
  debugTraceEnabled: boolean;
  tokenLoggingEnabled: boolean;
}
