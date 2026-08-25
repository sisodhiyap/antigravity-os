import { create } from "zustand";
import { SystemTelemetryState } from "@/types/telemetry";

const defaultTelemetryBaseline: SystemTelemetryState = {
  timestamp: new Date().toISOString(),
  uptimeSeconds: 0,
  cpu: {
    model: "AMD Ryzen 9 6900HS (8C / 16T)",
    cores: 8,
    threads: 16,
    usagePercent: 0,
    frequencyGhz: 3.3,
    temperatureC: 45,
    coreLoads: [0, 0, 0, 0, 0, 0, 0, 0],
  },
  gpu: {
    model: "NVIDIA GeForce RTX 3060 Laptop GPU",
    vramUsedMb: 0,
    vramTotalMb: 6144,
    usagePercent: 0,
    temperatureC: 42,
    powerWatts: 25,
    fanSpeedPercent: "Auto",
    cudaActive: true,
    tensorCoresActive: true,
  },
  ram: {
    usedGb: 0,
    totalGb: 16,
    freeGb: 16,
    buffersMb: 0,
    cachedMb: 0,
    swapUsedGb: 0,
    swapTotalGb: 8,
  },
  disks: [
    {
      fs: "C:",
      type: "NTFS",
      sizeGb: 486.8,
      usedGb: 248.0,
      availableGb: 238.8,
      usePercent: 50.9,
      mount: "C:",
    },
  ],
  network: {
    iface: "Wi-Fi",
    rxBytes: 0,
    txBytes: 0,
    rxSec: 0,
    txSec: 0,
    latencyMs: 14,
    status: "online",
  },
  ollama: {
    serverStatus: "online",
    activeModel: "qwen2.5-coder:14b",
    totalModels: 6,
    port: 11434,
    totalInferenceCount: 5240,
    loadedModels: [],
  },
  agents: [],
  docker: [],
  mcp: [],
  github: {
    repo: "sisodhiyap/Antigravity",
    branch: "main",
    lastCommitSha: "a9f8c2b",
    lastCommitMessage: "feat(swarm): activate Antigravity v2.0 local-first core",
    author: "sisodhiyap",
    pendingPrs: 0,
    openIssues: 0,
    syncStatus: "clean",
    lastSyncTime: "Just now",
    dirtyFilesCount: 0,
  },
  imageQueue: [],
  videoQueue: [],
  memory: {
    vectorDbNodes: 48920,
    graphEntities: 1240,
    graphRelations: 3890,
    cacheHitRatePercent: 96.2,
    totalKnowledgeBytes: 184500000,
    pineconeActive: true,
    sqliteActive: true,
  },
};

interface SystemStore {
  telemetry: SystemTelemetryState;
  isLive: boolean;
  refreshIntervalMs: number;
  isSidebarCollapsed: boolean;
  isCommandPaletteOpen: boolean;
  activeFilter: string;
  setTelemetry: (data: SystemTelemetryState) => void;
  toggleLive: () => void;
  setRefreshInterval: (ms: number) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setActiveFilter: (filter: string) => void;
}

export const useSystemStore = create<SystemStore>((set) => ({
  telemetry: defaultTelemetryBaseline,
  isLive: true,
  refreshIntervalMs: 1000,
  isSidebarCollapsed: false,
  isCommandPaletteOpen: false,
  activeFilter: "all",

  setTelemetry: (data) => set({ telemetry: data }),
  toggleLive: () => set((state) => ({ isLive: !state.isLive })),
  setRefreshInterval: (ms) => set({ refreshIntervalMs: ms }),
  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  setActiveFilter: (filter) => set({ activeFilter: filter }),
}));
