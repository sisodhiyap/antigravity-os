/**
 * ANTIGRAVITY OS — SOVEREIGN LOCAL AI FABRIC
 * fabric-manager.ts: Unified Engine Management and Orchestration Facade.
 * Connects Registry, Adapters, Scheduler, Installer, Supervisor, and Offline Policy
 * without modifying or compromising the frozen V7 core.
 */

import {
  FabricEngineId,
  FabricExecutionMode,
  EngineStatus,
  LocalEngineMetadata,
  FabricJobRequest,
  FabricDiagnosticsReport,
} from "./types";
import { localEngineRegistry } from "./engine-registry";
import { offlineEnforcer } from "./offline-enforcer";
import { fabricGpuScheduler } from "./gpu-scheduler";
import { fabricInstaller } from "./installer";
import { fabricServiceSupervisor } from "./service-supervisor";

// Import all 10 adapters
import { voiceStudioAdapter } from "./adapters/voice-studio-adapter";
import { invokeAIAdapter } from "./adapters/invokeai-adapter";
import { upscaylAdapter } from "./adapters/upscayl-adapter";
import { aceStepAdapter } from "./adapters/ace-step-adapter";
import { openShortsAdapter } from "./adapters/openshorts-adapter";
import { vaneAdapter } from "./adapters/vane-adapter";
import { odysseusAdapter } from "./adapters/odysseus-adapter";
import { dyadAdapter } from "./adapters/dyad-adapter";
import { openManusAdapter } from "./adapters/openmanus-adapter";
import { freeLLMAPIAdapter } from "./adapters/freellmapi-adapter";
import { BaseEngineAdapter } from "./adapters/base-adapter";

import { PluginAdapterManager } from "@/plugins/PluginAdapterManager";

export class FabricManager {
  private static instance: FabricManager;
  private readonly adapters: Map<FabricEngineId, BaseEngineAdapter> = new Map();

  public static getInstance(): FabricManager {
    if (!FabricManager.instance) {
      FabricManager.instance = new FabricManager();
    }
    return FabricManager.instance;
  }

  private constructor() {
    this.adapters.set("voice-studio", voiceStudioAdapter);
    this.adapters.set("invokeai", invokeAIAdapter);
    this.adapters.set("upscayl", upscaylAdapter);
    this.adapters.set("ace-step", aceStepAdapter);
    this.adapters.set("openshorts", openShortsAdapter);
    this.adapters.set("vane", vaneAdapter);
    this.adapters.set("odysseus", odysseusAdapter);
    this.adapters.set("dyad", dyadAdapter);
    this.adapters.set("openmanus", openManusAdapter);
    this.adapters.set("freellmapi", freeLLMAPIAdapter);

    this.registerWithV7PluginManager();
  }

  /**
   * Registers optional fabric engines as sandboxed adapters in PluginAdapterManager
   */
  private registerWithV7PluginManager(): void {
    const pluginMgr = PluginAdapterManager.getInstance();
    for (const engine of localEngineRegistry.getAllEngines()) {
      pluginMgr.registerPlugin({
        pluginId: `fabric_engine_${engine.id}`,
        name: `Local AI Fabric: ${engine.name}`,
        version: engine.pinnedVersion,
        category: "INTEGRATION_ADAPTER",
        isSandboxed: true,
        securityAudited: true,
        realityTested: true,
        ownerApproved: false,
        status: "SANDBOXED",
      });
    }
  }

  public getExecutionMode(): FabricExecutionMode {
    return offlineEnforcer.getMode();
  }

  public setExecutionMode(mode: FabricExecutionMode): void {
    offlineEnforcer.setMode(mode);
  }

  public getEngines(): LocalEngineMetadata[] {
    return localEngineRegistry.getAllEngines();
  }

  public getEngine(id: FabricEngineId): LocalEngineMetadata | undefined {
    return localEngineRegistry.getEngine(id);
  }

  public getAdapter(id: FabricEngineId): BaseEngineAdapter | undefined {
    return this.adapters.get(id);
  }

  public async probeEngine(id: FabricEngineId): Promise<EngineStatus> {
    return localEngineRegistry.probeEngine(id);
  }

  public async probeAllEngines(): Promise<Map<FabricEngineId, EngineStatus>> {
    const statuses = new Map<FabricEngineId, EngineStatus>();
    for (const engine of localEngineRegistry.getAllEngines()) {
      const status = await localEngineRegistry.probeEngine(engine.id);
      statuses.set(engine.id, status);
    }
    return statuses;
  }

  public async executeTask(
    engineId: FabricEngineId,
    taskType: string,
    payload: Record<string, any>
  ): Promise<FabricJobRequest> {
    const engine = localEngineRegistry.getEngine(engineId);
    if (!engine) {
      throw new Error(`Engine ${engineId} not recognized.`);
    }

    const requiresGpu = engine.hardwareRequirements.minVramGb > 0;
    const estimatedVram = engine.hardwareRequirements.minVramGb * 1024;

    const job = await fabricGpuScheduler.submitJob(engineId, taskType, payload, requiresGpu, estimatedVram);
    return job;
  }

  public async generateDiagnostics(): Promise<FabricDiagnosticsReport> {
    const hardware = await fabricGpuScheduler.getHardwareMetrics();
    const safety = offlineEnforcer.getSafetyMetrics();
    const queueState = fabricGpuScheduler.getQueueState();

    const engines = localEngineRegistry.getAllEngines().map((e) => ({
      id: e.id,
      name: e.name,
      status: e.status,
      offlineCapable: e.isOfflineCapable,
      installed: e.isInstalled,
      running: e.isRunning,
      lastError: e.lastErrorSanitized,
    }));

    return {
      timestamp: new Date().toISOString(),
      fabricMode: offlineEnforcer.getMode(),
      hostHardware: {
        cpu: hardware.cpuModel,
        ramGb: hardware.totalRamGb,
        gpuRenderer: hardware.gpuDevice,
        vramMb: hardware.totalVramMb,
        cudaAvailable: hardware.cudaAvailable,
      },
      engines,
      gpuScheduler: {
        activeJobsCount: queueState.activeJob ? 1 : 0,
        queuedJobsCount: queueState.queuedJobsCount,
        isGpuLocked: queueState.isGpuLocked,
        activeGpuEngine: queueState.activeGpuEngine || undefined,
      },
      networkSafetyAudit: {
        strictOfflineEnforced: offlineEnforcer.getMode() === "STRICT_OFFLINE",
        blockedOutboundRequestsCount: safety.blockedRequestsCount,
        quarantinedRemoteCallsCount: safety.quarantinedRemoteCallsCount,
      },
    };
  }
}

export const fabricManager = FabricManager.getInstance();
