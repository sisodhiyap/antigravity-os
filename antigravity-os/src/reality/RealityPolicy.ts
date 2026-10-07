/**
 * ANTIGRAVITY OS v5.5 — REALITY POLICY & CERTIFICATION GATES
 * RealityPolicy: Strict certification levels (0-6) and anti-hallucination policy enforcement
 */

export enum CertificationLevel {
  LEVEL_0_UNVERIFIED = 0,
  LEVEL_1_BUILD_VERIFIED = 1,
  LEVEL_2_FUNCTIONALLY_VERIFIED = 2,
  LEVEL_3_SECURITY_VERIFIED = 3,
  LEVEL_4_PRODUCTION_VERIFIED = 4,
  LEVEL_5_GENERALIZATION_VERIFIED = 5,
  LEVEL_6_EXPERIENCE_IMPROVEMENT_VERIFIED = 6
}

export class RealityPolicy {
  /**
   * Computes the maximum justified certification level strictly based on executable evidence
   */
  public static computeCertificationLevel(metrics: {
    buildPassed: boolean;
    functionalScore: number;
    securityScore: number;
    dockerHealthy: boolean;
    generalizationPassed: boolean;
    learningDeltaPositive: boolean;
    secretsFound: boolean;
  }): { level: CertificationLevel; title: string; justification: string } {
    if (!metrics.buildPassed) {
      return { level: CertificationLevel.LEVEL_0_UNVERIFIED, title: "LEVEL 0 — UNVERIFIED", justification: "Build failed" };
    }
    if (metrics.functionalScore < 0.95) {
      return { level: CertificationLevel.LEVEL_1_BUILD_VERIFIED, title: "LEVEL 1 — BUILD VERIFIED", justification: "Functional assertions < 95%" };
    }
    if (metrics.securityScore < 1.0 || metrics.secretsFound) {
      return { level: CertificationLevel.LEVEL_2_FUNCTIONALLY_VERIFIED, title: "LEVEL 2 — FUNCTIONALLY VERIFIED", justification: "Security vulnerabilities or secret leaks detected" };
    }
    if (!metrics.dockerHealthy) {
      return { level: CertificationLevel.LEVEL_3_SECURITY_VERIFIED, title: "LEVEL 3 — SECURITY VERIFIED", justification: "Docker container not verified" };
    }
    if (!metrics.generalizationPassed) {
      return { level: CertificationLevel.LEVEL_4_PRODUCTION_VERIFIED, title: "LEVEL 4 — PRODUCTION VERIFIED", justification: "Cross-domain generalization not yet proven" };
    }
    if (!metrics.learningDeltaPositive) {
      return { level: CertificationLevel.LEVEL_5_GENERALIZATION_VERIFIED, title: "LEVEL 5 — GENERALIZATION VERIFIED", justification: "Measurable experience improvement not yet demonstrated" };
    }

    return {
      level: CertificationLevel.LEVEL_6_EXPERIENCE_IMPROVEMENT_VERIFIED,
      title: "LEVEL 6 — EXPERIENCE-IMPROVEMENT VERIFIED",
      justification: "100% Gates Passed with independently verified cross-domain generalization and measurable positive learning delta"
    };
  }
}
