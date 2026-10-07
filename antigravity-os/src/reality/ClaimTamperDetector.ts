/**
 * ANTIGRAVITY OS — CLAIM TAMPER & MOCK DETECTOR
 * ClaimTamperDetector: Intercepts altered JSON certificates, forged scores, and mock stubs
 */

export interface TamperDetectionResult {
  targetCertificate: string;
  isTampered: boolean;
  tamperCategory?: "FORGED_SCORE" | "HASH_MISMATCH" | "UNEXECUTED_CLAIM" | "SYNTHETIC_METRIC";
  evidence: string;
}

export class ClaimTamperDetector {
  public static auditCertificate(
    certificateJson: { claimedScore: number; verifiedExecutions: number; manifestHash: string },
    computedHash: string
  ): TamperDetectionResult {
    if (certificateJson.claimedScore > 90 && certificateJson.verifiedExecutions === 0) {
      return {
        targetCertificate: "master-verdict.json",
        isTampered: true,
        tamperCategory: "FORGED_SCORE",
        evidence: "Certificate claims high score but 0 verified executions recorded in evidence ledger."
      };
    }

    if (certificateJson.manifestHash !== computedHash) {
      return {
        targetCertificate: "master-verdict.json",
        isTampered: true,
        tamperCategory: "HASH_MISMATCH",
        evidence: "Manifest hash mismatch detected between certificate claim and raw execution hash."
      };
    }

    return {
      targetCertificate: "master-verdict.json",
      isTampered: false,
      evidence: "Certificate matched byte-for-byte with cryptographic ledger."
    };
  }
}

export class MockDetector {
  public static scanCodeForSuspiciousStubs(codeSnippet: string): { isMockDetected: boolean; flagsCount: number } {
    const suspiciousPatterns = [
      /return\s+true\s*;?\s*(\/\/|\/\*).*mock/i,
      /score\s*=\s*100\s*;?\s*(\/\/|\/\*).*hardcoded/i,
      /fake_api_response/i
    ];

    let flagsCount = 0;
    for (const pat of suspiciousPatterns) {
      if (pat.test(codeSnippet)) flagsCount++;
    }

    return {
      isMockDetected: flagsCount > 0,
      flagsCount
    };
  }
}
