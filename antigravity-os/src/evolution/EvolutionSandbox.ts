/**
 * ANTIGRAVITY OS — EVOLUTION SANDBOX
 * EvolutionSandbox: Isolated sandbox environment preventing candidate mutations from affecting production
 */

import fs from "fs";
import path from "path";

export interface SandboxEnvironment {
  sandboxId: string;
  candidateId: string;
  sandboxDir: string;
  dbPath: string;
  isolatedPort: number;
  isIsolated: boolean;
}

export class EvolutionSandbox {
  private static readonly activeSandboxes: Map<string, SandboxEnvironment> = new Map();

  public static createSandbox(candidateId: string, portOffset: number = 0): SandboxEnvironment {
    const sandboxId = `sbx_${candidateId}_${Date.now()}`;
    const sandboxDir = path.resolve(__dirname, "..", "..", "artifacts", "evolution-validation", "sandboxes", sandboxId);

    if (!fs.existsSync(sandboxDir)) {
      fs.mkdirSync(sandboxDir, { recursive: true });
    }

    const env: SandboxEnvironment = {
      sandboxId,
      candidateId,
      sandboxDir,
      dbPath: path.join(sandboxDir, "sandbox_db.sqlite"),
      isolatedPort: 3600 + portOffset,
      isIsolated: true
    };

    this.activeSandboxes.set(sandboxId, env);
    return env;
  }

  public static teardownSandbox(sandboxId: string): boolean {
    const env = this.activeSandboxes.get(sandboxId);
    if (!env) return false;
    this.activeSandboxes.delete(sandboxId);
    return true;
  }
}
