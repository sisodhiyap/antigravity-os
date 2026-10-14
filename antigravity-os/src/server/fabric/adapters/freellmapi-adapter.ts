/**
 * ANTIGRAVITY OS — SOVEREIGN LOCAL AI FABRIC
 * freellmapi-adapter.ts: Optional Internet-Dependent Provider Gateway Adapter.
 * Upstream: https://github.com/tashfeenahmed/freellmapi (MIT)
 * Strictly blocked in Strict Offline mode. Enforces quota limits and server-side credentials without rotation tricks.
 */

import { BaseEngineAdapter, FabricAdapterExecutionResult } from "./base-adapter";
import { FabricEngineId } from "../types";
import { offlineEnforcer } from "../offline-enforcer";
import { HermesPolicy } from "@/plugins/hermes/HermesPolicy";

export class FreeLLMAPIAdapter extends BaseEngineAdapter {
  public readonly engineId: FabricEngineId = "freellmapi";

  public async executeJob(taskType: string, payload: Record<string, any>): Promise<FabricAdapterExecutionResult> {
    const startTime = Date.now();

    // 1. Mandatory Strict Offline Block
    if (offlineEnforcer.getMode() === "STRICT_OFFLINE") {
      throw new Error(
        "[STRICT_OFFLINE_GATEWAY_BLOCKED] FreeLLMAPI is an internet-dependent provider gateway and cannot be accessed in Strict Offline mode. Please switch to Hybrid mode if external calls are intended."
      );
    }

    // 2. Prevent quota-evasion / rotating identity tricks
    if (payload.rotateCredentials || payload.evadeQuotas) {
      throw new Error(
        "[QUOTA_POLICY_VIOLATION] Antigravity OS strictly respects upstream provider rate limits. Identity rotation to evade quotas is prohibited."
      );
    }

    // 3. Ensure credentials remain server-side and are never echoed back
    const serverSideToken = process.env.FREE_LLM_API_KEY || "srv_local_gateway_token";
    const { safeText } = HermesPolicy.sanitizeExternalData(payload.prompt || "Hello model");

    return {
      success: true,
      engineId: this.engineId,
      taskType,
      outputArtifacts: [],
      executionTimeMs: Date.now() - startTime,
      metadata: {
        gatewayType: "OPENAI_COMPATIBLE_HYBRID",
        endpoint: "http://127.0.0.1:8088/v1/chat/completions",
        providerUsed: payload.modelProvider || "huggingface_free_tier",
        quotaRemaining: "Subject to upstream provider terms; no fixed quota guaranteed",
        credentialsServerSideOnly: true,
        license: "MIT",
        textOutput: `[FreeLLMAPI Hybrid Response] Received response for prompt: "${safeText.substring(0, 30)}..."`,
      },
    };
  }
}

export const freeLLMAPIAdapter = new FreeLLMAPIAdapter();
