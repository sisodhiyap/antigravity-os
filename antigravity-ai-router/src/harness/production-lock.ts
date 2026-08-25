/**
 * Antigravity Production-Grade Adaptive Harness - Production Lock Controller
 * Freezes production settings, prevents accidental mutation, and protects safety invariants.
 */

export class ProductionLockController {
  private locked = false;
  private lockTimestamp?: number;
  private lockedBy?: string;

  public isLocked(): boolean {
    return this.locked;
  }

  public lock(operator: string = 'system_admin'): { success: boolean; reason: string } {
    this.locked = true;
    this.lockTimestamp = Date.now();
    this.lockedBy = operator;
    return { success: true, reason: `Harness successfully transitioned to PRODUCTION_LOCKED by ${operator}.` };
  }

  public unlock(operatorToken: string): { success: boolean; reason: string } {
    if (operatorToken !== 'CONFIRM_UNLOCK_OPERATOR') {
      return { success: false, reason: 'Invalid operator token. Unlock rejected.' };
    }
    this.locked = false;
    this.lockTimestamp = undefined;
    this.lockedBy = undefined;
    return { success: true, reason: 'Harness unlocked by operator.' };
  }

  public validateModification(targetField: string): { allowed: boolean; reason: string } {
    if (this.locked) {
      return {
        allowed: false,
        reason: `Modification of [${targetField}] blocked: System is in PRODUCTION_LOCKED state.`
      };
    }
    return { allowed: true, reason: 'Modification allowed.' };
  }
}

export const productionLockController = new ProductionLockController();
