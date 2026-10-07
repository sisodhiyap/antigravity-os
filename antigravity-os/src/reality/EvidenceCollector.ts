/**
 * ANTIGRAVITY OS — HASH-CHAIN EVIDENCE COLLECTOR
 * EvidenceCollector: Append-only immutable hash-chained evidence ledger
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";

export interface EvidenceLedgerEvent {
  eventId: string;
  index: number;
  timestamp: string;
  missionId: string;
  operation: string;
  command: string;
  exitCode: number;
  stdoutHash: string;
  stderrHash: string;
  durationMs: number;
  previousHash: string;
  currentHash: string;
}

export class EvidenceCollector {
  private static readonly ledger: EvidenceLedgerEvent[] = [];
  private static previousHash = "0000000000000000000000000000000000000000000000000000000000000000";

  public static recordEvent(
    missionId: string,
    operation: string,
    command: string,
    exitCode: number,
    stdout: string,
    stderr: string,
    durationMs: number
  ): EvidenceLedgerEvent {
    const stdoutHash = crypto.createHash("sha256").update(stdout).digest("hex");
    const stderrHash = crypto.createHash("sha256").update(stderr).digest("hex");
    const index = this.ledger.length;

    const rawPayload = `${index}:${missionId}:${operation}:${command}:${exitCode}:${stdoutHash}:${stderrHash}:${durationMs}:${this.previousHash}`;
    const currentHash = crypto.createHash("sha256").update(rawPayload).digest("hex");

    const event: EvidenceLedgerEvent = {
      eventId: `ev_${index}_${Date.now()}`,
      index,
      timestamp: new Date().toISOString(),
      missionId,
      operation,
      command,
      exitCode,
      stdoutHash,
      stderrHash,
      durationMs,
      previousHash: this.previousHash,
      currentHash
    };

    this.previousHash = currentHash;
    this.ledger.push(event);

    return event;
  }

  public static verifyLedgerIntegrity(): boolean {
    let prev = "0000000000000000000000000000000000000000000000000000000000000000";
    for (const ev of this.ledger) {
      if (ev.previousHash !== prev) return false;
      const expectedHash = crypto
        .createHash("sha256")
        .update(`${ev.index}:${ev.missionId}:${ev.operation}:${ev.command}:${ev.exitCode}:${ev.stdoutHash}:${ev.stderrHash}:${ev.durationMs}:${ev.previousHash}`)
        .digest("hex");
      if (ev.currentHash !== expectedHash) return false;
      prev = ev.currentHash;
    }
    return true;
  }

  public static getLedger(): EvidenceLedgerEvent[] {
    return [...this.ledger];
  }
}
