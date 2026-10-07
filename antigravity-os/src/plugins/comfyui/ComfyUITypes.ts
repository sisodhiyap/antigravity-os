/**
 * ANTIGRAVITY OS v7.0 — COMFYUI GENERATIVE MEDIA FABRIC
 * ComfyUITypes.ts: Type definitions for ComfyUI local media pipelines
 */

export type MediaModality = "IMAGE" | "VIDEO" | "AUDIO" | "3D" | "UPSCALE" | "CINEMATIC";

export type ResourceTier = "SAFE" | "NORMAL" | "HEAVY" | "CRITICAL";

export type GenerationJobStatus =
  | "QUEUED"
  | "LOADING"
  | "GENERATING"
  | "POST_PROCESSING"
  | "VALIDATING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "RETRYING"
  | "BLOCKED";

export type HardwareAccelerationType = "CUDA" | "ROCM" | "DIRECTML" | "MPS" | "CPU";

export interface ComfyUIHardwareProfile {
  os: "Windows" | "Linux" | "macOS" | "Unknown";
  gpuVendor: "NVIDIA" | "AMD" | "Intel" | "Apple" | "CPU_ONLY";
  acceleration: HardwareAccelerationType;
  vramTotalMb: number;
  vramAvailableMb: number;
  systemRamTotalMb: number;
  systemRamAvailableMb: number;
  diskFreeGb: number;
  serverUrl: string;
  isServerConnected: boolean;
  pythonInstalled: boolean;
}

export interface ComfyUIModelSpec {
  modelId: string;
  name: string;
  family: "Flux" | "SDXL" | "SD15" | "Wan" | "LTX" | "HunyuanVideo" | "SVD" | "Mochi" | "ACEStep" | "TripoSR" | "Other";
  modality: MediaModality;
  precision: "fp32" | "fp16" | "bf16" | "fp8_e4m3fn" | "fp8_e5m2" | "int8" | "gguf_q4_k";
  vramRequirementMb: number;
  isInstalled: boolean;
  license: string;
  capabilities: string[];
  recommendedSteps: number;
  recommendedCfg: number;
  resolutionDefault: { width: number; height: number };
}

export interface ComfyUIWorkflowMetadata {
  workflowId: string;
  name: string;
  version: string;
  modality: MediaModality;
  requiredModels: string[];
  requiredNodes: string[];
  requiredVramMb: number;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  license: string;
  author: string;
  hash: string;
  verified: boolean;
  lastTested: string;
}

export interface ComfyUIGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  modality: MediaModality;
  modelId?: string;
  workflowId?: string;
  width?: number;
  height?: number;
  frames?: number;
  fps?: number;
  durationSeconds?: number;
  seed?: number;
  steps?: number;
  cfgScale?: number;
  samplerName?: string;
  schedulerName?: string;
  referenceImage?: string;
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  sandboxDir?: string;
}

export interface ComfyUIGenerationJob {
  jobId: string;
  request: ComfyUIGenerationRequest;
  status: GenerationJobStatus;
  progressPercent: number;
  currentStep: number;
  totalSteps: number;
  outputUrls: string[];
  outputPath?: string;
  error?: string;
  evidenceId?: string;
  provenanceHash?: string;
  vramUsedMb: number;
  generationDurationMs: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface MediaProvenanceRecord {
  assetId: string;
  projectId: string;
  workflowId: string;
  modelId: string;
  modelVersion: string;
  seed: number;
  parameters: Record<string, unknown>;
  promptHash: string;
  inputHashes: string[];
  outputHash: string;
  generationTimeMs: number;
  hardware: string;
  localOrCloud: "LOCAL" | "CLOUD" | "HYBRID";
  license: string;
  verificationStatus: "VERIFIED" | "UNVERIFIED" | "TAMPERED";
  timestamp: string;
}

export interface ProjectMediaBible {
  projectId: string;
  characters: Array<{ name: string; visualDescription: string; referenceImage?: string; seed?: number }>;
  locations: Array<{ name: string; visualStyle: string; lighting: string }>;
  colorPalette: string[];
  cameraLanguage: string;
  lightingStyle: string;
  consistentSeed?: number;
  defaultNegativePrompt: string;
}
