export interface QualityValidationResult {
  valid: boolean;
  score: number;
  reason?: string;
  hallucinationDetected?: boolean;
}

export function validateQuality(codeOrResponse: string, promptRequirements: string[] = []): QualityValidationResult {
  if (!codeOrResponse || codeOrResponse.trim().length === 0) {
    return {
      valid: false,
      score: 0,
      reason: 'Response content is empty'
    };
  }

  // Check syntax plausibility (matching braces)
  const openBraces = (codeOrResponse.match(/\{/g) || []).length;
  const closeBraces = (codeOrResponse.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    return {
      valid: false,
      score: 40,
      reason: 'Mismatched curly braces detected in generated code'
    };
  }

  // Check for obvious hallucinations or dummy placeholder errors
  if (
    codeOrResponse.includes('TODO: Implement') &&
    codeOrResponse.length < 50
  ) {
    return {
      valid: false,
      score: 30,
      reason: 'Response is only an unfulfilled TODO placeholder'
    };
  }

  return {
    valid: true,
    score: 95
  };
}
