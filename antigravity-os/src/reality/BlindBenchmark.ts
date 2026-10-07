/**
 * ANTIGRAVITY OS v5.5 — TRUE BLIND BENCHMARK ENGINE
 * BlindBenchmark: Enforces strict information boundaries between Generation Agents and Evaluation Criteria
 */

import { RealityMissionConfig } from "./RealityMission";

export interface BenchmarkInput {
  benchmarkId: string;
  domain: string;
  naturalLanguagePrompt: string;
  functionalRequirements: string[];
  nonFunctionalConstraints: string[];
  acceptanceCriteria: string[];
}

export interface BenchmarkSecretVerificationCriteria {
  benchmarkId: string;
  expectedEndpoints: string[];
  expectedSecurityChecks: string[];
  expectedPerformanceThresholdMs: number;
  expectedA11yStandard: string;
  secretPayloadCanaries: string[];
}

export class BlindBenchmark {
  private static readonly secretCriteriaMap: Map<string, BenchmarkSecretVerificationCriteria> = new Map();

  public static registerBenchmarkCriteria(
    benchmarkId: string,
    criteria: BenchmarkSecretVerificationCriteria
  ) {
    this.secretCriteriaMap.set(benchmarkId, criteria);
  }

  /**
   * Sanitizes benchmark payload before handing off to Generator Agents.
   * Strips all internal test payloads, schemas, and solution keys.
   */
  public static createBlindInput(config: RealityMissionConfig): BenchmarkInput {
    return {
      benchmarkId: config.benchmarkId,
      domain: config.domain,
      naturalLanguagePrompt: config.naturalLanguagePrompt,
      functionalRequirements: [...config.functionalRequirements],
      nonFunctionalConstraints: [...config.nonFunctionalConstraints],
      acceptanceCriteria: [...config.acceptanceCriteria]
    };
  }

  /**
   * Private accessor for IndependentVerifier only. Generator agents have zero access.
   */
  public static getVerificationCriteria(benchmarkId: string): BenchmarkSecretVerificationCriteria | undefined {
    return this.secretCriteriaMap.get(benchmarkId);
  }
}
