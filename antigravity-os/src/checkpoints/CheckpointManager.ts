/**
 * ANTIGRAVITY OS v5.3 — CHECKPOINT MANAGER
 * CheckpointManager: Captures atomic pre-mutation snapshots of files, databases, and mission state
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface SystemCheckpoint {
  id: string;
  missionId: string;
  timestamp: string;
  gitSha: string;
  fileSnapshots: Record<string, string>;
  databaseStateSnapshot: string;
  description: string;
}

export class CheckpointManager {
  private static instance: CheckpointManager;
  private readonly checkpoints: Map<string, SystemCheckpoint> = new Map();
  private readonly checkpointDir: string;

  private constructor() {
    this.checkpointDir = path.resolve(__dirname, "..", "..", "artifacts", "checkpoints");
    if (!fs.existsSync(this.checkpointDir)) {
      fs.mkdirSync(this.checkpointDir, { recursive: true });
    }
  }

  public static getInstance(): CheckpointManager {
    if (!CheckpointManager.instance) {
      CheckpointManager.instance = new CheckpointManager();
    }
    return CheckpointManager.instance;
  }

  public createCheckpoint(
    missionId: string,
    description: string,
    filePaths: string[],
    databaseSnapshot: string = ""
  ): SystemCheckpoint {
    const id = `chk_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const fileSnapshots: Record<string, string> = {};

    for (const fp of filePaths) {
      try {
        if (fs.existsSync(fp)) {
          fileSnapshots[fp] = fs.readFileSync(fp, "utf-8");
        }
      } catch {}
    }

    const checkpoint: SystemCheckpoint = {
      id,
      missionId,
      timestamp: new Date().toISOString(),
      gitSha: "HEAD",
      fileSnapshots,
      databaseStateSnapshot: databaseSnapshot,
      description
    };

    this.checkpoints.set(id, checkpoint);
    try {
      fs.writeFileSync(
        path.join(this.checkpointDir, `${id}.json`),
        JSON.stringify(checkpoint, null, 2),
        "utf-8"
      );
    } catch {}

    return checkpoint;
  }

  public getCheckpoint(id: string): SystemCheckpoint | undefined {
    return this.checkpoints.get(id);
  }

  public getAllCheckpoints(): SystemCheckpoint[] {
    return Array.from(this.checkpoints.values());
  }
}
