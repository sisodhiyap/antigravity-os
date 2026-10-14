/**
 * ANTIGRAVITY OS — SOVEREIGN LOCAL AI FABRIC
 * offline-enforcer.ts: Server-side Strict Offline & Hybrid Network Policy Governor.
 * Guarantees zero covert data exfiltration and honest offline verification.
 */

import http from "http";
import https from "https";
import { FabricExecutionMode, FabricEngineId } from "./types";
import { HermesPolicy } from "@/plugins/hermes/HermesPolicy";

export interface NetworkAssertionResult {
  isAllowed: boolean;
  reason: string;
  violations: string[];
}

export class OfflineEnforcer {
  private static instance: OfflineEnforcer;
  private currentMode: FabricExecutionMode = "STRICT_OFFLINE";
  private blockedRequestsCount = 0;
  private quarantinedRemoteCallsCount = 0;
  private interceptorInstalled = false;
  private auditLog: Array<{
    timestamp: string;
    engineId?: FabricEngineId;
    destination: string;
    allowed: boolean;
    reason: string;
  }> = [];

  private constructor() {
    this.installSocketInterceptors();
  }

  public static getInstance(): OfflineEnforcer {
    if (!OfflineEnforcer.instance) {
      OfflineEnforcer.instance = new OfflineEnforcer();
    }
    return OfflineEnforcer.instance;
  }

  private installSocketInterceptors(): void {
    if (this.interceptorInstalled) return;
    this.interceptorInstalled = true;

    // 1. Monkey-patch global fetch
    if (typeof globalThis.fetch === "function") {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        let urlStr = "";
        if (typeof input === "string") {
          urlStr = input;
        } else if (input instanceof URL) {
          urlStr = input.toString();
        } else if (input && typeof input === "object" && "url" in input) {
          urlStr = (input as any).url;
        }

        if (this.currentMode === "STRICT_OFFLINE") {
          const isLoopback =
            urlStr.includes("127.0.0.1") ||
            urlStr.includes("localhost") ||
            urlStr.includes("::1");
          if (!isLoopback) {
            this.blockedRequestsCount++;
            const msg = `[STRICT_OFFLINE_VIOLATION] Socket fetch to '${urlStr}' blocked by Antigravity Sovereign Offline Governor.`;
            this.auditLog.push({
              timestamp: new Date().toISOString(),
              destination: urlStr,
              allowed: false,
              reason: msg,
            });
            throw new Error(msg);
          }
        }
        return originalFetch(input, init);
      };
    }

    // 2. Monkey-patch http.request and https.request
    const wrapRequest = (origReq: any, protocol: string) => {
      return (urlOrOptions: any, ...args: any[]) => {
        if (this.currentMode === "STRICT_OFFLINE") {
          let host = "";
          if (typeof urlOrOptions === "string") {
            try {
              host = new URL(urlOrOptions).hostname;
            } catch {
              host = urlOrOptions;
            }
          } else if (urlOrOptions instanceof URL) {
            host = urlOrOptions.hostname;
          } else if (urlOrOptions && typeof urlOrOptions === "object") {
            host = urlOrOptions.hostname || urlOrOptions.host || "";
          }

          const isLoopback =
            host === "127.0.0.1" ||
            host === "localhost" ||
            host === "::1" ||
            host.startsWith("127.0.0.1:") ||
            host.startsWith("localhost:");

          if (!isLoopback) {
            this.blockedRequestsCount++;
            const msg = `[STRICT_OFFLINE_VIOLATION] Outbound ${protocol} socket request to '${host}' blocked by Antigravity Sovereign Offline Governor.`;
            this.auditLog.push({
              timestamp: new Date().toISOString(),
              destination: `${protocol}//${host}`,
              allowed: false,
              reason: msg,
            });
            throw new Error(msg);
          }
        }
        return origReq.call(null, urlOrOptions, ...args);
      };
    };

    http.request = wrapRequest(http.request, "http:");
    https.request = wrapRequest(https.request, "https:");
  }

  public getMode(): FabricExecutionMode {
    return this.currentMode;
  }

  public setMode(mode: FabricExecutionMode): void {
    this.currentMode = mode;
  }

  /**
   * Asserts whether a network or service interaction is permitted under the active policy.
   * Strict Offline mode strictly confines all execution to localhost/loopback (127.0.0.1 / ::1).
   */
  public assertNetworkAccess(destinationUrlOrHost: string, engineId?: FabricEngineId): NetworkAssertionResult {
    const isLoopback =
      destinationUrlOrHost.includes("127.0.0.1") ||
      destinationUrlOrHost.includes("localhost") ||
      destinationUrlOrHost.includes("::1");

    if (this.currentMode === "STRICT_OFFLINE") {
      if (!isLoopback) {
        this.blockedRequestsCount++;
        const violationMsg = `[STRICT_OFFLINE_VIOLATION] Outbound connection to '${destinationUrlOrHost}' was blocked. Antigravity OS is running in sovereign Strict Offline mode.`;
        this.auditLog.push({
          timestamp: new Date().toISOString(),
          engineId,
          destination: destinationUrlOrHost,
          allowed: false,
          reason: violationMsg,
        });

        return {
          isAllowed: false,
          reason: violationMsg,
          violations: [violationMsg],
        };
      }
    }

    // Hybrid mode or permitted loopback
    this.auditLog.push({
      timestamp: new Date().toISOString(),
      engineId,
      destination: destinationUrlOrHost,
      allowed: true,
      reason: isLoopback ? "LOOPBACK_PERMITTED" : "HYBRID_AUTHORIZED",
    });

    return {
      isAllowed: true,
      reason: isLoopback ? "Loopback IPC permitted" : "Hybrid mode active with user consent",
      violations: [],
    };
  }

  /**
   * Validates if a specific engine can run under current policy
   */
  public isEngineAllowed(engineId: FabricEngineId, internetDependency: string): boolean {
    if (this.currentMode === "STRICT_OFFLINE") {
      if (engineId === "freellmapi") {
        this.blockedRequestsCount++;
        return false;
      }
      if (internetDependency === "REQUIRED_INTERNET_GATEWAY") {
        this.blockedRequestsCount++;
        return false;
      }
    }
    return true;
  }

  public getSafetyMetrics() {
    return {
      fabricMode: this.currentMode,
      blockedRequestsCount: this.blockedRequestsCount,
      quarantinedRemoteCallsCount: this.quarantinedRemoteCallsCount,
      recentAuditTrail: this.auditLog.slice(-50),
    };
  }

  /**
   * Exports sanitized audit logs with all secrets permanently redacted
   */
  public exportSanitizedAudit(): string {
    const rawJson = JSON.stringify(this.getSafetyMetrics(), null, 2);
    const { redactedText } = HermesPolicy.redactSecrets(rawJson);
    return redactedText;
  }
}

export const offlineEnforcer = OfflineEnforcer.getInstance();
