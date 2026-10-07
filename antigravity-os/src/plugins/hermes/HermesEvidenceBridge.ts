/**
 * ANTIGRAVITY OS v7.0 — HERMES AGENT SUBSYSTEM
 * HermesEvidenceBridge.ts: Append-only hash-chain evidence ledger interface
 */

import { EvidenceCollector, EvidenceLedgerEvent } from "../../reality/EvidenceCollector";

export class HermesEvidenceBridge {
  public static appendEvidence(
    missionId: string,
    operation: string,
    command: string,
    exitCode: number,
    stdout: string,
    stderr: string,
    durationMs: number
  ): EvidenceLedgerEvent {
    return EvidenceCollector.recordEvent(
      missionId,
      operation,
      command,
      exitCode,
      stdout,
      stderr,
      durationMs
    );
  }

  public static verifyLedgerIntegrity(): boolean {
    return EvidenceCollector.verifyLedgerIntegrity();
  }

  public static getEvidenceLedger(): EvidenceLedgerEvent[] {
    return EvidenceCollector.getLedger();
  }
}
