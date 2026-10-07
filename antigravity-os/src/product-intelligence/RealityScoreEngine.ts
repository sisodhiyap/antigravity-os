/**
 * ANTIGRAVITY OS v5.9 — REALITY SCORE ENGINE
 * RealityScoreEngine: 10-dimensional reality score calculation with hard safety caps
 */

export interface RealityScoreBreakdown {
  functional: number;     // 20%
  security: number;       // 20%
  integration: number;    // 15%
  visual: number;         // 15%
  ux: number;             // 10%
  accessibility: number;  // 5%
  performance: number;    // 5%
  reliability: number;    // 5%
  evidence: number;       // 5%
  compositeScore: number; // 0 to 100
  criticalSafetyCapped: boolean;
  productionReadyVerdict: boolean;
}

export class RealityScoreEngine {
  public static calculateScore(metrics: {
    functionalPassRate: number;    // 0 to 1
    securityPassRate: number;      // 0 to 1
    integrationPassRate: number;   // 0 to 1
    visualSimilarity: number;      // 0 to 1
    uxSuccessRate: number;         // 0 to 1
    accessibilityScore: number;    // 0 to 1
    performanceScore: number;      // 0 to 1
    reliabilityScore: number;      // 0 to 1
    evidenceIntegrity: number;     // 0 to 1
    criticalSecurityBreach?: boolean;
    criticalFunctionalCrash?: boolean;
  }): RealityScoreBreakdown {
    const functional = metrics.functionalPassRate * 20;
    const security = metrics.securityPassRate * 20;
    const integration = metrics.integrationPassRate * 15;
    const visual = metrics.visualSimilarity * 15;
    const ux = metrics.uxSuccessRate * 10;
    const accessibility = metrics.accessibilityScore * 5;
    const performance = metrics.performanceScore * 5;
    const reliability = metrics.reliabilityScore * 5;
    const evidence = metrics.evidenceIntegrity * 5;

    let compositeScore = Number(
      (functional + security + integration + visual + ux + accessibility + performance + reliability + evidence).toFixed(2)
    );

    let criticalSafetyCapped = false;
    if (metrics.criticalSecurityBreach || metrics.criticalFunctionalCrash) {
      compositeScore = Math.min(compositeScore, 49.0);
      criticalSafetyCapped = true;
    }

    const productionReadyVerdict = compositeScore >= 95.0 && !criticalSafetyCapped;

    return {
      functional,
      security,
      integration,
      visual,
      ux,
      accessibility,
      performance,
      reliability,
      evidence,
      compositeScore,
      criticalSafetyCapped,
      productionReadyVerdict
    };
  }
}
