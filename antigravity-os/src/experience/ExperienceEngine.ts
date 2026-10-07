/**
 * ANTIGRAVITY OS v5.4 — MASTER EXPERIENCE ENGINE
 * ExperienceEngine: Orchestrates the Experience-Driven Engineering Loop
 * OBSERVE -> UNDERSTAND -> PLAN -> EXECUTE -> HARNESS -> VERIFY -> CRITIQUE -> REPAIR -> MEASURE -> LEARN
 */

import { ExperienceRecord } from "./ExperienceRecord";
import { ExperienceStore } from "./ExperienceStore";
import { ExperienceScorer, ExperienceScoreBreakdown } from "./ExperienceScorer";
import { ExperienceEvaluator, EvaluationVerdict } from "./ExperienceEvaluator";
import { StrategyUpdater, StrategyUpdateResult } from "./StrategyUpdater";
import { ExperienceVersioning } from "./ExperienceVersioning";

export class ExperienceEngine {
  private static instance: ExperienceEngine;
  private readonly store: ExperienceStore;
  private readonly versioning: ExperienceVersioning;

  private constructor() {
    this.store = ExperienceStore.getInstance();
    this.versioning = ExperienceVersioning.getInstance();
  }

  public static getInstance(): ExperienceEngine {
    if (!ExperienceEngine.instance) {
      ExperienceEngine.instance = new ExperienceEngine();
    }
    return ExperienceEngine.instance;
  }

  /**
   * Processes a completed mission into a verified, scored, and versioned experience record
   */
  public processMissionCompletion(record: ExperienceRecord): {
    record: ExperienceRecord;
    scores: ExperienceScoreBreakdown;
    evaluation: EvaluationVerdict;
    strategyUpdate: StrategyUpdateResult;
  } {
    // 1. Evaluate against poisoning & security rules
    const evaluation = ExperienceEvaluator.evaluateCandidateKnowledge(
      `${record.domain} ${record.architecture.pattern}`,
      record
    );

    // 2. Score multidimensional metrics
    const scores = ExperienceScorer.score(record);
    record.confidence = Number(((record.confidence || 0.8) + scores.confidenceDelta).toFixed(4));
    record.status = scores.recommendation === "PROMOTE_TO_VERIFIED" && evaluation.approved ? "VERIFIED" : "CANDIDATE";

    // 3. Update strategy recommendations
    const strategyUpdate = StrategyUpdater.applyExperienceToStrategy(record);
    record.strategyVersion = strategyUpdate.strategyVersion;

    // 4. Save to persistent store if not frozen
    if (!this.versioning.isFrozen()) {
      this.store.saveExperience(record);
    }

    return {
      record,
      scores,
      evaluation,
      strategyUpdate
    };
  }

  public getStore(): ExperienceStore {
    return this.store;
  }

  public getVersioning(): ExperienceVersioning {
    return this.versioning;
  }
}
