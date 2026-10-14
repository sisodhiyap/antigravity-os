/**
 * ANTIGRAVITY OS — PERSONAL INTELLIGENCE V1
 * policy-gate.ts: Local-First Execution Enforcement & Bounded Autonomy Guard
 */

import { HermesPolicy } from "@/plugins/hermes/HermesPolicy";
import { PrivacyLevel, ActionType, TaskStatus } from "./types";
import { strandsDecider } from "../ai/strands-decider";

export interface PolicyEvaluation {
  allowed: boolean;
  requiresApproval: boolean;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  reason: string;
  enforcedMode: "LOCAL" | "CLOUD" | "OFFLINE_FALLBACK" | "BLOCKED";
}

export class IntelligencePolicyGate {
  private static instance: IntelligencePolicyGate;

  private constructor() {}

  public static getInstance(): IntelligencePolicyGate {
    if (!IntelligencePolicyGate.instance) {
      IntelligencePolicyGate.instance = new IntelligencePolicyGate();
    }
    return IntelligencePolicyGate.instance;
  }

  /**
   * Evaluates whether a proposed model invocation conforms to the user's PrivacyLevel
   */
  public evaluateModelPrivacy(
    privacyLevel: PrivacyLevel,
    isLocalModelAvailable: boolean
  ): {
    canUseCloud: boolean;
    mustUseLocal: boolean;
    requiresCloudApproval: boolean;
    executionMode: "LOCAL" | "CLOUD" | "OFFLINE_FALLBACK";
  } {
    switch (privacyLevel) {
      case "LOCAL_ONLY":
        return {
          canUseCloud: false,
          mustUseLocal: true,
          requiresCloudApproval: false,
          executionMode: isLocalModelAvailable ? "LOCAL" : "OFFLINE_FALLBACK",
        };

      case "LOCAL_PREFERRED":
        return {
          canUseCloud: !isLocalModelAvailable,
          mustUseLocal: isLocalModelAvailable,
          requiresCloudApproval: false,
          executionMode: isLocalModelAvailable ? "LOCAL" : "CLOUD",
        };

      case "ASK_EVERY_TIME":
        return {
          canUseCloud: isLocalModelAvailable ? false : false, // Needs approval before cloud
          mustUseLocal: isLocalModelAvailable,
          requiresCloudApproval: !isLocalModelAvailable,
          executionMode: isLocalModelAvailable ? "LOCAL" : "OFFLINE_FALLBACK",
        };

      case "CLOUD_PERMITTED":
      default:
        return {
          canUseCloud: true,
          mustUseLocal: false,
          requiresCloudApproval: false,
          executionMode: isLocalModelAvailable ? "LOCAL" : "CLOUD",
        };
    }
  }

  /**
   * Evaluates whether a task or tool action is pre-approved or requires operator sign-off
   */
  public async evaluateAction(
    actionType: ActionType,
    resource: string,
    payload?: any
  ): Promise<PolicyEvaluation> {
    // 1. Critical Invariant: Secret access is unconditionally blocked
    if (
      resource.toLowerCase().includes(".env") ||
      resource.toLowerCase().includes("secret") ||
      resource.toLowerCase().includes("credential")
    ) {
      return {
        allowed: false,
        requiresApproval: false,
        riskLevel: "CRITICAL",
        reason: "POLICY_VIOLATION: Direct access to credentials and .env secrets is unconditionally blocked.",
        enforcedMode: "BLOCKED",
      };
    }

    // 2. Pre-approved read-only operations
    if (actionType === "READ_ONLY") {
      return {
        allowed: true,
        requiresApproval: false,
        riskLevel: "LOW",
        reason: "AUTO_AUTHORIZED: Read-only inspection within bounded workspace.",
        enforcedMode: "LOCAL",
      };
    }

    // 3. Mutating operations: strictly require operator approval
    switch (actionType) {
      case "FILE_WRITE":
      case "CODE_PATCH":
        return {
          allowed: true,
          requiresApproval: true,
          riskLevel: "MEDIUM",
          reason: `APPROVAL_REQUIRED: Modification of project files on target '${resource}' requires operator signature.`,
          enforcedMode: "LOCAL",
        };

      case "SHELL_EXEC":
      case "PACKAGE_INSTALL":
        return {
          allowed: true,
          requiresApproval: true,
          riskLevel: "HIGH",
          reason: `APPROVAL_REQUIRED: Executing shell operations or package installs on target '${resource}' requires explicit authorization.`,
          enforcedMode: "LOCAL",
        };

      case "DB_MUTATION":
        return {
          allowed: true,
          requiresApproval: true,
          riskLevel: "HIGH",
          reason: `APPROVAL_REQUIRED: Database schema or state mutation on '${resource}' requires operator consent.`,
          enforcedMode: "LOCAL",
        };

      case "CLOUD_UPLOAD":
        return {
          allowed: true,
          requiresApproval: true,
          riskLevel: "HIGH",
          reason: `APPROVAL_REQUIRED: Uploading local artifacts or project context to external cloud requires operator consent.`,
          enforcedMode: "CLOUD",
        };

      default:
        return {
          allowed: false,
          requiresApproval: true,
          riskLevel: "HIGH",
          reason: `UNKNOWN_ACTION: Action type '${actionType}' is not pre-approved.`,
          enforcedMode: "BLOCKED",
        };
    }
  }

  /**
   * Sanitizes input text against prompt injection and returns safety classification
   */
  public sanitizeInput(text: string): {
    safeText: string;
    isSafe: boolean;
    threatsNeutralized: string[];
  } {
    const { safeText, injectionDetected, flags } = HermesPolicy.sanitizeExternalData(text);
    const { redactedText } = HermesPolicy.redactSecrets(safeText);

    return {
      safeText: redactedText,
      isSafe: !injectionDetected,
      threatsNeutralized: flags,
    };
  }
}

export const intelligencePolicyGate = IntelligencePolicyGate.getInstance();
