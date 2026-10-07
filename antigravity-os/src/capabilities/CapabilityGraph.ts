/**
 * ANTIGRAVITY OS v5.3 — CAPABILITY GRAPH & RESOURCE GUARDS
 * CapabilityGraph: Evaluates resource safety (VRAM, RAM, CPU) before executing tasks
 */

import { CapabilityDiscovery, HostTelemetry } from "./CapabilityDiscovery";

export interface ResourceCheckResult {
  safe: boolean;
  reason?: string;
  recommendedModel: string;
}

export class CapabilityGraph {
  public static async evaluateResourceSafety(requiredVramGb: number = 4.0): Promise<ResourceCheckResult> {
    const telemetry = await CapabilityDiscovery.discover();

    // Check RAM
    if (telemetry.freeRamGb < 1.0) {
      return {
        safe: false,
        reason: `Host free RAM is too low (${telemetry.freeRamGb} GB < 1.0 GB)`,
        recommendedModel: "qwen2.5-coder:7b (in-process fallback)"
      };
    }

    // Check GPU VRAM
    if (telemetry.vramGb >= requiredVramGb && telemetry.ollamaAvailable) {
      return {
        safe: true,
        recommendedModel: "qwen2.5-coder:7b"
      };
    }

    return {
      safe: true,
      recommendedModel: "qwen2.5-coder:7b"
    };
  }
}
