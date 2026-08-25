export interface CpuMetric {
  model: string;
  cores: number;
  threads: number;
  usagePercent: number;
  frequencyGhz: number;
  temperatureC: number;
  coreLoads: number[];
}

export interface GpuMetric {
  model: string;
  vramUsedMb: number;
  vramTotalMb: number;
  usagePercent: number;
  temperatureC: number;
  powerWatts: number;
  fanSpeedPercent: number | string;
  cudaActive: boolean;
  tensorCoresActive: boolean;
}

export interface RamMetric {
  usedGb: number;
  totalGb: number;
  freeGb: number;
  buffersMb: number;
  cachedMb: number;
  swapUsedGb: number;
  swapTotalGb: number;
}

export interface DiskMetric {
  fs: string;
  type: string;
  sizeGb: number;
  usedGb: number;
  availableGb: number;
  usePercent: number;
  mount: string;
}

export interface NetworkMetric {
  iface: string;
  rxBytes: number;
  txBytes: number;
  rxSec: number;
  txSec: number;
  latencyMs: number;
  status: "online" | "offline";
}

export interface OllamaModelInfo {
  name: string;
  tag: string;
  sizeGb: number;
  quantization: string;
  vramMb: number;
  status: "active" | "standby" | "unloaded";
  contextLength: number;
  parameterSize?: string;
  family?: string;
}

export interface OllamaMetric {
  activeModel: string;
  totalModels: number;
  loadedModels: OllamaModelInfo[];
  serverStatus: "online" | "degraded" | "offline";
  port: number;
  totalInferenceCount: number;
}

export type SwarmRoleType =
  | "Product Manager"
  | "UX Designer"
  | "Architect"
  | "Builder"
  | "QA Engineer"
  | "Security Engineer"
  | "DevOps Engineer"
  | "Creative Director"
  | "Video Producer"
  | "Stock Researcher";

export interface AgentMetric {
  id: string;
  role: SwarmRoleType;
  status: "idle" | "running" | "evaluating" | "completed" | "error";
  currentTask: string;
  progressPercent: number;
  tokensConsumed: number;
  activeModel: string;
  lastActive: string;
}

export interface DockerContainerMetric {
  id: string;
  name: string;
  image: string;
  status: "running" | "paused" | "exited" | "not_installed";
  ports: string;
  cpuPercent: number;
  memoryMb: number;
  uptime: string;
}

export interface McpServerMetric {
  name: string;
  mode: "Eager" | "Lazy";
  status: "connected" | "standby" | "error";
  toolCount: number;
  latencyMs: number;
  lastPing: string;
}

export interface GitHubMetric {
  repo: string;
  branch: string;
  lastCommitSha: string;
  lastCommitMessage: string;
  author: string;
  pendingPrs: number;
  openIssues: number;
  syncStatus: "clean" | "dirty" | "ahead" | "behind";
  lastSyncTime: string;
  dirtyFilesCount: number;
}

export interface ImageQueueItem {
  id: string;
  prompt: string;
  model: "SDXL" | "Flux" | "Stability API";
  resolution: string;
  status: "pending" | "processing" | "completed" | "failed";
  progressPercent: number;
  etaSeconds: number;
  thumbnailUrl?: string;
}

export interface VideoQueueItem {
  id: string;
  title: string;
  engine: "Remotion" | "Blender 3D" | "HTML-to-MP4";
  aspectRatio: "16:9" | "9:16" | "1:1";
  durationSeconds: number;
  status: "queued" | "rendering" | "encoding" | "finished";
  progressPercent: number;
  fps: number;
}

export interface MemoryMetric {
  vectorDbNodes: number;
  graphEntities: number;
  graphRelations: number;
  cacheHitRatePercent: number;
  totalKnowledgeBytes: number;
  pineconeActive: boolean;
  sqliteActive: boolean;
}

export interface TerminalLog {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "success" | "command";
  sender: string;
  message: string;
}

export interface SystemTelemetryState {
  cpu: CpuMetric;
  gpu: GpuMetric;
  ram: RamMetric;
  disks: DiskMetric[];
  network: NetworkMetric;
  ollama: OllamaMetric;
  agents: AgentMetric[];
  docker: DockerContainerMetric[];
  mcp: McpServerMetric[];
  github: GitHubMetric;
  imageQueue: ImageQueueItem[];
  videoQueue: VideoQueueItem[];
  memory: MemoryMetric;
  uptimeSeconds: number;
  timestamp: string;
}
