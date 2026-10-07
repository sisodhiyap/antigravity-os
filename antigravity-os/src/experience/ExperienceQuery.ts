/**
 * ANTIGRAVITY OS v5.4 — EXPERIENCE QUERY ENGINE
 * ExperienceQuery: Query interface for retrieving relevant historical engineering experiences
 */

import { ExperienceRecord, KnowledgeStatus } from "./ExperienceRecord";
import { ExperienceStore } from "./ExperienceStore";

export interface ExperienceQueryFilters {
  domain?: string;
  projectId?: string;
  minConfidence?: number;
  status?: KnowledgeStatus;
  outcome?: "SUCCESS" | "PARTIAL" | "FAILED";
  modelUsed?: string;
}

export class ExperienceQuery {
  public static query(filters: ExperienceQueryFilters): ExperienceRecord[] {
    const store = ExperienceStore.getInstance();
    let records = store.getAllExperiences();

    if (filters.domain) {
      const d = filters.domain.toLowerCase();
      records = records.filter((r) => r.domain.toLowerCase().includes(d));
    }

    if (filters.projectId) {
      records = records.filter((r) => r.projectId === filters.projectId);
    }

    if (filters.minConfidence !== undefined) {
      records = records.filter((r) => r.confidence >= (filters.minConfidence || 0));
    }

    if (filters.status) {
      records = records.filter((r) => r.status === filters.status);
    }

    if (filters.outcome) {
      records = records.filter((r) => r.finalOutcome === filters.outcome);
    }

    if (filters.modelUsed) {
      records = records.filter((r) =>
        r.modelsUsed.some((m) => m.modelId.toLowerCase().includes(filters.modelUsed!.toLowerCase()))
      );
    }

    return records.sort((a, b) => b.confidence - a.confidence);
  }

  public static getBestStrategyForDomain(domain: string): ExperienceRecord | undefined {
    const results = this.query({ domain, outcome: "SUCCESS", minConfidence: 0.8 });
    return results[0];
  }
}
