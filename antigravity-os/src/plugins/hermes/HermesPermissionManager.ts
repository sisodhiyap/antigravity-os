/**
 * ANTIGRAVITY OS v7.0 — HERMES AGENT SUBSYSTEM
 * HermesPermissionManager.ts: Capability-based permission control with escalation protection
 */

import { HermesAutonomyLevel } from "./HermesTypes";

export interface PermissionCheckResult {
  allowed: boolean;
  currentLevel: HermesAutonomyLevel;
  requiredLevel: HermesAutonomyLevel;
  reason?: string;
}

export class HermesPermissionManager {
  private currentAutonomyLevel: HermesAutonomyLevel = 2; // Default to Level 2 (Sandbox Write)
  private emergencyStopActive = false;

  public getAutonomyLevel(): HermesAutonomyLevel {
    return this.currentAutonomyLevel;
  }

  /**
   * Sets autonomy level. Level 5 requires explicit human operator confirmation.
   */
  public setAutonomyLevel(level: HermesAutonomyLevel, operatorConfirmed: boolean = false): boolean {
    if (level === 5 && !operatorConfirmed) {
      return false; // Cannot set level 5 without operator confirmation
    }
    this.currentAutonomyLevel = level;
    return true;
  }

  public triggerEmergencyStop(): void {
    this.emergencyStopActive = true;
    this.currentAutonomyLevel = 0;
  }

  public resumeFromEmergencyStop(operatorApproval: boolean): boolean {
    if (!operatorApproval) return false;
    this.emergencyStopActive = false;
    this.currentAutonomyLevel = 2;
    return true;
  }

  public isEmergencyStopped(): boolean {
    return this.emergencyStopActive;
  }

  /**
   * Evaluates if a given tool/action is permitted under the current autonomy level
   */
  public evaluatePermission(
    requiredLevel: HermesAutonomyLevel,
    isProductionMutation: boolean = false,
    ownerApprovedSignature?: string
  ): PermissionCheckResult {
    if (this.emergencyStopActive) {
      return {
        allowed: false,
        currentLevel: this.currentAutonomyLevel,
        requiredLevel,
        reason: "EMERGENCY_STOP_ACTIVE: All autonomous actions blocked"
      };
    }

    if (isProductionMutation) {
      if (!ownerApprovedSignature || ownerApprovedSignature.length < 16) {
        return {
          allowed: false,
          currentLevel: this.currentAutonomyLevel,
          requiredLevel: 5,
          reason: "PRODUCTION_IMMUTABILITY: Level 5 Owner Approval Signature required"
        };
      }
    }

    if (this.currentAutonomyLevel < requiredLevel) {
      return {
        allowed: false,
        currentLevel: this.currentAutonomyLevel,
        requiredLevel,
        reason: `AUTONOMY_LEVEL_INSUFFICIENT: Current Level ${this.currentAutonomyLevel} < Required Level ${requiredLevel}`
      };
    }

    return {
      allowed: true,
      currentLevel: this.currentAutonomyLevel,
      requiredLevel
    };
  }
}
