/**
 * ANTIGRAVITY OS v7.0 — HERMES AGENT SUBSYSTEM
 * HermesMemory.ts: Provenance-aware, secret-sanitized multi-layer memory engine
 */

import { HermesExperience } from "./HermesTypes";
import { HermesPolicy } from "./HermesPolicy";

export interface FailureRecord {
  failureId: string;
  errorSignature: string;
  taskType: string;
  rootCause: string;
  attemptedFixes: Array<{ fix: string; verified: boolean; evidenceId?: string }>;
  verifiedFix?: string;
  timestamp: string;
}

export interface ModelPerformanceMetric {
  modelId: string;
  taskCategory: string;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  averageLatencyMs: number;
  averageConfidence: number;
}

export class HermesMemory {
  private sessionMemory: Map<string, unknown> = new Map();
  private taskMemory: Map<string, unknown> = new Map();
  private projectMemory: Map<string, unknown> = new Map();
  private failureKnowledge: Map<string, FailureRecord> = new Map();
  private verifiedExperiences: Map<string, HermesExperience> = new Map();
  private modelPerformance: Map<string, ModelPerformanceMetric> = new Map();

  // 1. Session Memory
  public setSessionItem(key: string, value: string): void {
    const { redactedText } = HermesPolicy.redactSecrets(value);
    this.sessionMemory.set(key, redactedText);
  }

  public getSessionItem(key: string): unknown {
    return this.sessionMemory.get(key);
  }

  // 2. Task Memory
  public recordTaskOutput(taskId: string, output: unknown): void {
    const serialized = JSON.stringify(output);
    const { redactedText } = HermesPolicy.redactSecrets(serialized);
    this.taskMemory.set(taskId, JSON.parse(redactedText));
  }

  public getTaskOutput(taskId: string): unknown {
    return this.taskMemory.get(taskId);
  }

  // 3. Project Memory
  public setProjectContext(key: string, data: unknown): void {
    const serialized = JSON.stringify(data);
    const { redactedText } = HermesPolicy.redactSecrets(serialized);
    this.projectMemory.set(key, JSON.parse(redactedText));
  }

  public getProjectContext(key: string): unknown {
    return this.projectMemory.get(key);
  }

  // 4. Failure Knowledge
  public recordFailure(record: Omit<FailureRecord, "timestamp">): FailureRecord {
    const { redactedText: cleanCause } = HermesPolicy.redactSecrets(record.rootCause);
    const cleanRecord: FailureRecord = {
      ...record,
      rootCause: cleanCause,
      timestamp: new Date().toISOString()
    };
    this.failureKnowledge.set(cleanRecord.errorSignature, cleanRecord);
    return cleanRecord;
  }

  public findKnownRepair(errorSignature: string): string | undefined {
    const record = this.failureKnowledge.get(errorSignature);
    return record?.verifiedFix;
  }

  // 5. Verified Experience (Strict: OBSERVED + EXECUTED + VERIFIED only)
  public recordExperience(exp: HermesExperience): boolean {
    if (exp.verificationStatus !== "VERIFIED") {
      return false; // Hard Invariant: Never automatically learn from unverified experience
    }
    const { redactedText: cleanObs } = HermesPolicy.redactSecrets(exp.observation);
    const { redactedText: cleanAct } = HermesPolicy.redactSecrets(exp.action);
    const { redactedText: cleanRes } = HermesPolicy.redactSecrets(exp.result);

    const cleanExp: HermesExperience = {
      ...exp,
      observation: cleanObs,
      action: cleanAct,
      result: cleanRes
    };

    this.verifiedExperiences.set(exp.experienceId, cleanExp);
    return true;
  }

  public getVerifiedExperiences(): HermesExperience[] {
    return Array.from(this.verifiedExperiences.values());
  }

  // 6. Model Performance
  public recordModelUsage(modelId: string, taskCategory: string, latencyMs: number, success: boolean, confidence: number): void {
    const key = `${modelId}:${taskCategory}`;
    const existing = this.modelPerformance.get(key) || {
      modelId,
      taskCategory,
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      averageLatencyMs: 0,
      averageConfidence: 0
    };

    const newTotal = existing.totalCalls + 1;
    existing.successfulCalls += success ? 1 : 0;
    existing.failedCalls += success ? 0 : 1;
    existing.averageLatencyMs = (existing.averageLatencyMs * existing.totalCalls + latencyMs) / newTotal;
    existing.averageConfidence = (existing.averageConfidence * existing.totalCalls + confidence) / newTotal;
    existing.totalCalls = newTotal;

    this.modelPerformance.set(key, existing);
  }

  public getModelPerformance(modelId: string, taskCategory: string): ModelPerformanceMetric | undefined {
    return this.modelPerformance.get(`${modelId}:${taskCategory}`);
  }

  public clearSession(): void {
    this.sessionMemory.clear();
    this.taskMemory.clear();
  }
}
