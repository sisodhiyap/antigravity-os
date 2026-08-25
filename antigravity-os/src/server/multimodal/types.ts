import { z } from "zod";

export type ExecutionMode =
  | "LIVE"
  | "LOCAL"
  | "SIMULATION"
  | "FALLBACK"
  | "FAILED"
  | "CONFIG_REQUIRED"
  | "AUTH_REQUIRED"
  | "QUOTA_BLOCKED";

export type ProviderHealthState = "HEALTHY" | "DEGRADED" | "DOWN" | "UNKNOWN";

export type MediaType =
  | "IMAGE"
  | "AUDIO"
  | "VIDEO"
  | "MODEL_3D"
  | "DOCUMENT"
  | "SCREENSHOT"
  | "DESIGN"
  | "DATA";

export type AudioSynthesisMode =
  | "BROWSER_SYNTHESIS"
  | "LOCAL_AUDIO_FILE"
  | "CLOUD_GENERATION";

export interface ProvenanceMetadata {
  requestId: string;
  timestamp: string;
  initiatedBy: string; // role or user
  promptHash: string;
  sourceSeed?: number;
  engineVersion: string;
  checksumSha256: string;
  parentAssetIds?: string[];
  executionTimeMs: number;
}

export interface ProviderMetadata {
  provider: string;
  model: string;
  capability: string;
  executionMode: ExecutionMode;
  availability: boolean;
  authenticationState: "AUTHENTICATED" | "UNAUTHENTICATED" | "NOT_REQUIRED" | "TOKEN_EXPIRED";
  quotaState: "AVAILABLE" | "EXHAUSTED" | "RATE_LIMITED" | "UNKNOWN";
  healthState: ProviderHealthState;
  estimatedCostUsd: number;
  actualCostUsd: number;
  latencyMs: number;
  fallbackProvider?: string;
  requestId: string;
  timestamp: string;
  provenance: ProvenanceMetadata;
}

export interface AssetRecord {
  assetId: string;
  type: MediaType;
  path: string;
  mimeType: string;
  sizeBytes: number;
  hashSha256: string;
  provider: string;
  model: string;
  executionMode: ExecutionMode;
  promptHash: string;
  source: "USER" | "AI_GENERATED" | "SYSTEM" | "LOCAL_CACHE" | "EXTERNAL_IMPORT";
  createdAt: string;
  durationSeconds?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  status: "READY" | "PROCESSING" | "FAILED" | "CORRUPTED";
  validationStatus: "VERIFIED" | "PENDING" | "BROKEN";
  altText?: string;
  provenance: ProvenanceMetadata;
}

// -----------------------------------------------------------------------------
// Request Interfaces
// -----------------------------------------------------------------------------

export interface ImageGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:2";
  width?: number;
  height?: number;
  style?: "PHOTOREALISTIC" | "UI_MOCKUP" | "ILLUSTRATION" | "3D_RENDER" | "VECTOR";
  seed?: number;
  workspaceId?: string;
  preferredProvider?: string;
  enableFallback?: boolean;
}

export interface ImageGenerationResponse {
  asset: AssetRecord;
  providerMetadata: ProviderMetadata;
  thumbnailUrl?: string;
  altText: string;
}

export interface AudioGenerationRequest {
  text: string;
  voiceId?: string;
  voiceName?: string;
  speechRate?: number; // 0.5 to 2.0
  pitch?: number; // 0.5 to 1.5
  audioEffects?: string[];
  outputFormat?: "mp3" | "wav" | "ogg";
  workspaceId?: string;
  preferredMode?: AudioSynthesisMode;
}

export interface AudioGenerationResponse {
  asset: AssetRecord;
  synthesisMode: AudioSynthesisMode;
  durationSeconds: number;
  waveformPeaks?: number[];
  providerMetadata: ProviderMetadata;
}

export interface VideoScene {
  sceneId: string;
  durationSeconds: number;
  title: string;
  visualPrompt?: string;
  imageAssetId?: string;
  voiceoverText?: string;
  audioAssetId?: string;
  transition?: "FADE" | "SLIDE" | "ZOOM" | "NONE";
  caption?: string;
}

export interface VideoGenerationRequest {
  title: string;
  description: string;
  scenes: VideoScene[];
  resolution?: "1080p" | "720p" | "4k";
  aspectRatio?: "16:9" | "9:16" | "1:1";
  framerate?: number;
  workspaceId?: string;
}

export interface VideoGenerationResponse {
  asset: AssetRecord;
  scenes: VideoScene[];
  durationSeconds: number;
  thumbnailAssetId?: string;
  providerMetadata: ProviderMetadata;
  exportState?: "COMPOSITION_CREATED" | "PREVIEW_RENDERED" | "VIDEO_RENDERED" | "VIDEO_EXPORTED" | "EXPORT_FAILED" | "VIDEO_EXPORT_REQUIRES_ENCODER";
  videoFormat?: "WEBM" | "MP4";
}

export interface Mesh3DGenerationRequest {
  prompt: string;
  category?: "PROP" | "ENVIRONMENT" | "CHARACTER" | "UI_ASSET";
  format?: "gltf" | "obj" | "blend" | "fbx";
  includeLighting?: boolean;
  hdriEnvironment?: string;
  workspaceId?: string;
}

export interface Mesh3DGenerationResponse {
  asset: AssetRecord;
  previewImageAsset: AssetRecord;
  vertexCount: number;
  faceCount: number;
  materialNames: string[];
  providerMetadata: ProviderMetadata;
}
