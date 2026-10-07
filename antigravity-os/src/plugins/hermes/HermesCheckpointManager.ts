/**
 * ANTIGRAVITY OS v7.0 — HERMES AGENT SUBSYSTEM
 * HermesCheckpointManager.ts: Cryptographic sandbox state snapshot management
 */

import { EvolutionCheckpoint, EvolutionSnapshot } from "../../evolution/EvolutionCheckpoint";
import crypto from "crypto";

export interface HermesCheckpoint {
  checkpointId: string;
  sessionId: string;
  taskId: string;
  timestamp: string;
  snapshot: EvolutionSnapshot;
  sandboxDir: string;
  stateHash: string;
}

export class HermesCheckpointManager {
  private static readonly checkpoints: Map<string, HermesCheckpoint> = new Map();

  public static createCheckpoint(
    sessionId: string,
    taskId: string,
    sandboxDir: string,
    stateSummary: string
  ): HermesCheckpoint {
    const checkpointId = `chk_${sessionId}_${taskId}_${Date.now()}`;
    const snapshot = EvolutionCheckpoint.createSnapshot(checkpointId, stateSummary);
    const stateHash = crypto.createHash("sha256").update(stateSummary).digest("hex");

    const chk: HermesCheckpoint = {
      checkpointId,
      sessionId,
      taskId,
      timestamp: new Date().toISOString(),
      snapshot,
      sandboxDir,
      stateHash
    };

    this.checkpoints.set(checkpointId, chk);
    return chk;
  }

  public static getCheckpoint(checkpointId: string): HermesCheckpoint | undefined {
    return this.checkpoints.get(checkpointId);
  }

  public static getAllCheckpoints(): HermesCheckpoint[] {
    return Array.from(this.checkpoints.values());
  }
}
