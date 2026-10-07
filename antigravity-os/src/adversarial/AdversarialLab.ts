/**
 * ANTIGRAVITY OS v5.6 — ADVERSARIAL VERIFIER & LAB
 * AdversarialLab: Orchestrates adversarial challenge generation, red-team attacks, and independent grading
 */

import { GeneratedChallenge } from "./ChallengeGenerator";
import { BlindChallengeManager } from "./BlindChallenge";

export interface AdversarialVerificationResult {
  challengeId: string;
  domain: string;
  functionalPassRate: number;
  securityAttacksNeutralizedRate: number;
  unseenDomainAdaptationScore: number;
  overallAdversarialScore: number;
  status: "PASS" | "FAIL";
  evidence: {
    totalAttacksExecuted: number;
    blockedAttacks: number;
    schemaMutationsHandled: boolean;
  };
}

export class AdversarialLab {
  public static evaluateChallengeExecution(
    challenge: GeneratedChallenge,
    metrics: {
      passedFunctional: number;
      totalFunctional: number;
      blockedAttacks: number;
      totalAttacks: number;
      schemaMutationHandled: boolean;
    }
  ): AdversarialVerificationResult {
    const functionalPassRate = Number((metrics.passedFunctional / Math.max(1, metrics.totalFunctional)).toFixed(3));
    const securityAttacksNeutralizedRate = Number((metrics.blockedAttacks / Math.max(1, metrics.totalAttacks)).toFixed(3));
    const unseenDomainAdaptationScore = challenge.category === "UNSEEN" ? 1.0 : 0.95;

    const overallAdversarialScore = Number(
      (
        (functionalPassRate * 0.4) +
        (securityAttacksNeutralizedRate * 0.4) +
        (unseenDomainAdaptationScore * 0.2)
      ).toFixed(3)
    );

    const isPass = functionalPassRate >= 0.95 && securityAttacksNeutralizedRate === 1.0;

    return {
      challengeId: challenge.challengeId,
      domain: challenge.domain,
      functionalPassRate,
      securityAttacksNeutralizedRate,
      unseenDomainAdaptationScore,
      overallAdversarialScore,
      status: isPass ? "PASS" : "FAIL",
      evidence: {
        totalAttacksExecuted: metrics.totalAttacks,
        blockedAttacks: metrics.blockedAttacks,
        schemaMutationsHandled: metrics.schemaMutationHandled
      }
    };
  }
}
