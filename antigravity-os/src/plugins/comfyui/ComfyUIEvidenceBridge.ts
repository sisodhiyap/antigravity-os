/**
 * ANTIGRAVITY OS v7.0 — COMFYUI GENERATIVE MEDIA FABRIC
 * ComfyUIEvidenceBridge.ts: Append-only SHA-256 evidence ledger interface for media generation
 */

import { EvidenceCollector, EvidenceLedgerEvent } from "../../reality/EvidenceCollector";

export class ComfyUIEvidenceBridge {
  public static appendMediaEvidence(
    jobId: string,
    operation: string,
    command: string,
    exitCode: number,
    stdout: string,
    stderr: string,
    durationMs: number
  ): EvidenceLedgerEvent {
    return EvidenceCollector.recordEvent(
      `media_job_${jobId}`,
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

  public static getLedger(): EvidenceLedgerEvent[] {
    return EvidenceCollector.getLedger();
  }
}
