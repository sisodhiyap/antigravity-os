/**
 * ANTIGRAVITY OS v5.6 — ADVERSARIAL BLIND CHALLENGE CONTRACT
 * BlindChallenge: Separates challenge presentation from secret validation criteria
 */

export interface BlindChallengeInput {
  challengeId: string;
  domain: string;
  requirements: string[];
  constraints: string[];
  mutationsApplied: string[];
  naturalLanguagePrompt: string;
}

export interface SecretChallengeCriteria {
  challengeId: string;
  hiddenEndpoints: string[];
  adversarialAttackVectors: string[];
  expectedPerformanceP95Ms: number;
  expectedA11yGrade: string;
  canaryTokens: string[];
}

export class BlindChallengeManager {
  private static readonly secretCriteria = new Map<string, SecretChallengeCriteria>();

  public static registerCriteria(challengeId: string, criteria: SecretChallengeCriteria) {
    this.secretCriteria.set(challengeId, criteria);
  }

  public static getSecretCriteria(challengeId: string): SecretChallengeCriteria | undefined {
    return this.secretCriteria.get(challengeId);
  }
}
