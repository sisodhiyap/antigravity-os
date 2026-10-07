/**
 * ANTIGRAVITY OS v7.0 — HERMES AGENT SUBSYSTEM
 * HermesCritic.ts: 11-Question Zero-Trust Verification Engine
 */

import { HermesCriticEvaluation, HermesTaskNode } from "./HermesTypes";

export interface ExecutionEvidencePackage {
  hasExecuted: boolean;
  observableOutput: unknown;
  testPassed: boolean;
  regressionCount: number;
  securityVulnerabilities: number;
  visualFidelityScore: number; // 0 - 100
  accessibilityScore: number; // 0 - 100
  latencyMs: number;
  rawEvidenceId: string;
  isIndependentlyVerifiable: boolean;
}

export class HermesCritic {
  /**
   * Performs rigorous 11-question evaluation against raw evidence
   */
  public static evaluateTask(
    task: HermesTaskNode,
    evidence: ExecutionEvidencePackage
  ): HermesCriticEvaluation {
    const failures: string[] = [];

    // Q1: Did the task actually execute?
    const taskExecuted = evidence.hasExecuted && Boolean(evidence.rawEvidenceId);
    if (!taskExecuted) failures.push("Q1_FAIL: Task did not execute or lacks execution evidence");

    // Q2: Is the output observable?
    const outputObservable = evidence.observableOutput !== null && evidence.observableOutput !== undefined;
    if (!outputObservable) failures.push("Q2_FAIL: Output is empty or unobservable");

    // Q3: Is the output correct?
    const outputCorrect = evidence.testPassed;
    if (!outputCorrect) failures.push("Q3_FAIL: Automated tests or output verification failed");

    // Q4: Is the result reproducible?
    const resultReproducible = taskExecuted && outputCorrect;
    if (!resultReproducible) failures.push("Q4_FAIL: Execution result cannot be reproduced");

    // Q5: Did the implementation introduce regressions?
    const noRegressions = evidence.regressionCount === 0;
    if (!noRegressions) failures.push(`Q5_FAIL: Injected ${evidence.regressionCount} regressions`);

    // Q6: Did security degrade?
    const securityPreserved = evidence.securityVulnerabilities === 0;
    if (!securityPreserved) failures.push(`Q6_FAIL: Detected ${evidence.securityVulnerabilities} security flaws`);

    // Q7: Did visual fidelity degrade?
    const visualFidelityPreserved = evidence.visualFidelityScore >= 95;
    if (!visualFidelityPreserved) failures.push(`Q7_FAIL: Visual score ${evidence.visualFidelityScore} < 95`);

    // Q8: Did accessibility degrade?
    const accessibilityPreserved = evidence.accessibilityScore >= 95;
    if (!accessibilityPreserved) failures.push(`Q8_FAIL: Accessibility score ${evidence.accessibilityScore} < 95`);

    // Q9: Did performance degrade?
    const performancePreserved = evidence.latencyMs <= 1000;
    if (!performancePreserved) failures.push(`Q9_FAIL: Latency ${evidence.latencyMs}ms exceeded 1000ms threshold`);

    // Q10: Is there raw evidence?
    const rawEvidencePresent = Boolean(evidence.rawEvidenceId && evidence.rawEvidenceId.startsWith("ev_"));
    if (!rawEvidencePresent) failures.push("Q10_FAIL: Missing valid hash-chain evidence record");

    // Q11: Is the claim independently verifiable?
    const independentlyVerifiable = evidence.isIndependentlyVerifiable;
    if (!independentlyVerifiable) failures.push("Q11_FAIL: Claim is not independently reconstructible");

    const allPassed = failures.length === 0;

    let verdict: "APPROVED" | "REPAIR_REQUIRED" | "ROLLBACK_REQUIRED" = "APPROVED";
    if (!allPassed) {
      verdict = !securityPreserved || !noRegressions ? "ROLLBACK_REQUIRED" : "REPAIR_REQUIRED";
    }

    return {
      taskExecuted,
      outputObservable,
      outputCorrect,
      resultReproducible,
      noRegressions,
      securityPreserved,
      visualFidelityPreserved,
      accessibilityPreserved,
      performancePreserved,
      rawEvidencePresent,
      independentlyVerifiable,
      allPassed,
      verdict,
      failureDetails: failures.length > 0 ? failures : undefined
    };
  }
}
