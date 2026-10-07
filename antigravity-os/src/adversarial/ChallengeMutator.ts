/**
 * ANTIGRAVITY OS v5.6 — ADVERSARIAL CHALLENGE MUTATOR
 * ChallengeMutator: Injects requirement mutations, schema changes, and conflicting constraints
 */

import { GeneratedChallenge } from "./ChallengeGenerator";

export class ChallengeMutator {
  public static applyRequirementMutation(challenge: GeneratedChallenge, additionalRequirements: string[]): GeneratedChallenge {
    const mutated = JSON.parse(JSON.stringify(challenge)) as GeneratedChallenge;
    mutated.blindInput.requirements.push(...additionalRequirements);
    mutated.blindInput.mutationsApplied.push("REQUIREMENT_EXTENSION");
    mutated.blindInput.naturalLanguagePrompt += ` Furthermore, dynamically adapt to support: ${additionalRequirements.join(", ")} without regressing existing features.`;
    return mutated;
  }

  public static applySchemaMutation(challenge: GeneratedChallenge): GeneratedChallenge {
    const mutated = JSON.parse(JSON.stringify(challenge)) as GeneratedChallenge;
    mutated.blindInput.mutationsApplied.push("SCHEMA_RELATION_CHANGE");
    mutated.blindInput.naturalLanguagePrompt += " Require multi-tenant organization boundaries and composite UUIDv4 indexing.";
    return mutated;
  }
}
