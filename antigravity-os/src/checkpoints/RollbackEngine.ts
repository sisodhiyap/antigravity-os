/**
 * ANTIGRAVITY OS v5.3 — ROLLBACK ENGINE
 * RollbackEngine: Restores system files and database states from checkpoints on regression
 */

import fs from "fs";
import { CheckpointManager, SystemCheckpoint } from "./CheckpointManager";

export interface RollbackResult {
  checkpointId: string;
  success: boolean;
  restoredFiles: string[];
  timestamp: string;
  error?: string;
}

export class RollbackEngine {
  public static rollbackToCheckpoint(checkpointId: string): RollbackResult {
    const manager = CheckpointManager.getInstance();
    const chk = manager.getCheckpoint(checkpointId);

    if (!chk) {
      return {
        checkpointId,
        success: false,
        restoredFiles: [],
        timestamp: new Date().toISOString(),
        error: `Checkpoint ${checkpointId} not found`
      };
    }

    const restored: string[] = [];
    try {
      for (const [fp, content] of Object.entries(chk.fileSnapshots)) {
        fs.writeFileSync(fp, content, "utf-8");
        restored.push(fp);
      }

      return {
        checkpointId,
        success: true,
        restoredFiles: restored,
        timestamp: new Date().toISOString()
      };
    } catch (err: any) {
      return {
        checkpointId,
        success: false,
        restoredFiles: restored,
        timestamp: new Date().toISOString(),
        error: err?.message || String(err)
      };
    }
  }
}
