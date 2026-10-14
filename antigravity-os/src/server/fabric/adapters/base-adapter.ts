/**
 * ANTIGRAVITY OS — SOVEREIGN LOCAL AI FABRIC
 * base-adapter.ts: Common contract and interface for all 10 engine adapters.
 */

import { FabricEngineId, EngineStatus } from "../types";
import { localEngineRegistry } from "../engine-registry";
import { offlineEnforcer } from "../offline-enforcer";

export interface FabricAdapterExecutionResult {
  success: boolean;
  engineId: FabricEngineId;
  taskType: string;
  outputArtifacts: string[];
  executionTimeMs: number;
  metadata: Record<string, any>;
  errorMessage?: string;
}

export abstract class BaseEngineAdapter {
  public abstract readonly engineId: FabricEngineId;

  public async probe(): Promise<EngineStatus> {
    return localEngineRegistry.probeEngine(this.engineId);
  }

  public getOfflineReadiness(): { isReady: boolean; reason?: string } {
    const engine = localEngineRegistry.getEngine(this.engineId);
    if (!engine) {
      return { isReady: false, reason: "Engine not found in registry." };
    }

    if (offlineEnforcer.getMode() === "STRICT_OFFLINE" && !engine.isOfflineCapable) {
      return {
        isReady: false,
        reason: `Engine ${this.engineId} is internet-dependent and blocked in Strict Offline mode.`,
      };
    }

    if (!engine.isInstalled) {
      return { isReady: false, reason: "Engine software is not installed locally." };
    }

    if (engine.models.length > 0) {
      const missing = engine.models.some((m) => !m.isDownloaded);
      if (missing) {
        return { isReady: false, reason: "Required local model weights are missing." };
      }
    }

    return { isReady: true };
  }

  public abstract executeJob(taskType: string, payload: Record<string, any>): Promise<FabricAdapterExecutionResult>;
}
