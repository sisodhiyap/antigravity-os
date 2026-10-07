/**
 * ANTIGRAVITY OS v5.5 — GENERALIZATION ENGINE
 * GeneralizationEngine: Measures adaptation and principle transfer across unseen domains and requirement mutations
 */

export interface GeneralizationEvaluation {
  testedDomainsCount: number;
  unseenDomainsCount: number;
  crossDomainTransferSuccess: boolean;
  requirementMutationAdaptation: boolean;
  architectureMutationSuccess: boolean;
  generalizationScore: number; // 0 to 1
  domainBreakdown: Array<{
    domain: string;
    isUnseen: boolean;
    pass: boolean;
    timeMs: number;
  }>;
}

export class GeneralizationEngine {
  public static evaluateGeneralization(
    domainRuns: Array<{ domain: string; isUnseen: boolean; pass: boolean; timeMs: number }>,
    mutationResults: { requirementMutationPass: boolean; architectureMutationPass: boolean }
  ): GeneralizationEvaluation {
    const total = domainRuns.length;
    const passed = domainRuns.filter((d) => d.pass).length;
    const unseen = domainRuns.filter((d) => d.isUnseen).length;

    const crossDomainTransferSuccess = passed === total;
    const requirementMutationAdaptation = mutationResults.requirementMutationPass;
    const architectureMutationSuccess = mutationResults.architectureMutationPass;

    const generalizationScore = Number(
      (
        ((passed / Math.max(1, total)) * 0.6) +
        (requirementMutationAdaptation ? 0.2 : 0) +
        (architectureMutationSuccess ? 0.2 : 0)
      ).toFixed(3)
    );

    return {
      testedDomainsCount: total,
      unseenDomainsCount: unseen,
      crossDomainTransferSuccess,
      requirementMutationAdaptation,
      architectureMutationSuccess,
      generalizationScore,
      domainBreakdown: domainRuns
    };
  }
}
