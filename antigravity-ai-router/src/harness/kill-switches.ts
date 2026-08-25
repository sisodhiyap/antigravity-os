/**
 * Antigravity Production-Grade Adaptive Harness - Kill Switch Controller
 * Allows independently disabling any Harness subsystem instantly without restarting or breaking the system.
 */

import { KillSwitches } from './types.js';

export class KillSwitchManager {
  private switches: KillSwitches = {
    harness: true,
    parallelism: true,
    supervisor: true,
    premiumEscalation: true,
    automaticRetry: true,
    toolCaching: true,
    contextCompression: true,
    adaptiveRouting: true
  };

  public isEnabled(subsystem: keyof KillSwitches): boolean {
    if (!this.switches.harness) {
      return false; // Global kill switch overrides everything
    }
    return this.switches[subsystem];
  }

  public setSwitch(subsystem: keyof KillSwitches, enabled: boolean) {
    this.switches[subsystem] = enabled;
  }

  public getSwitches(): Readonly<KillSwitches> {
    return { ...this.switches };
  }

  public resetAll() {
    this.switches = {
      harness: true,
      parallelism: true,
      supervisor: true,
      premiumEscalation: true,
      automaticRetry: true,
      toolCaching: true,
      contextCompression: true,
      adaptiveRouting: true
    };
  }
}

export const killSwitchManager = new KillSwitchManager();
