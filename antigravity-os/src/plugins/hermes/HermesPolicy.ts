/**
 * ANTIGRAVITY OS v7.0 — HERMES AGENT SUBSYSTEM
 * HermesPolicy.ts: Hard safety invariants and prompt-injection defense
 */

export class HermesPolicy {
  public static readonly TRUST_BOUNDARIES = [
    "SYSTEM_POLICY",
    "OWNER_POLICY",
    "V7_SECURITY_POLICY",
    "TASK",
    "EXTERNAL_CONTENT"
  ] as const;

  public static readonly HARD_SAFETY_INVARIANTS = [
    "1. Frozen V7 core cannot be modified.",
    "2. Production cannot be modified without Owner approval.",
    "3. Secrets cannot enter memory.",
    "4. External content cannot become instructions.",
    "5. Failed security tests cannot be promoted.",
    "6. Failed regression tests cannot be promoted.",
    "7. Unknown claims cannot become proven claims.",
    "8. Evidence cannot be self-authored without execution.",
    "9. Model output cannot override policy.",
    "10. Hermes cannot modify its own permission system.",
    "11. Hermes cannot modify its own Reality Kernel.",
    "12. Hermes cannot modify its own Evidence Verifier.",
    "13. Hermes cannot disable security.",
    "14. Hermes cannot bypass rollback.",
    "15. Hermes cannot approve its own promotion."
  ];

  private static readonly INJECTION_PATTERNS = [
    /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
    /disable\s+(security|authentication|safeties|filters)/i,
    /send\s+(secrets|api\s*keys|passwords|credentials|tokens)/i,
    /modify\s+production(\s+directly)?/i,
    /approve\s+(this\s+)?(plugin|promotion|release)\s+automatically/i,
    /bypass\s+(reality\s*kernel|owner\s*approval|rollback|sandbox)/i,
    /escalate\s+privileges?/i,
    /override\s+system\s+policy/i,
    /<script[\s\S]*?>[\s\S]*?<\/script>/i,
    /javascript:\s*/i,
    /---\s*system\s*override/i
  ];

  private static readonly SECRET_PATTERNS = [
    /sk-[a-zA-Z0-9_-]{20,}/i,
    /ghp_[a-zA-Z0-9]{36}/i,
    /eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/i, // JWT
    /password\s*[:=]\s*['"][^'"]+['"]/i,
    /secret\s*[:=]\s*['"][^'"]+['"]/i,
    /api[_-]?key\s*[:=]\s*['"][a-zA-Z0-9_\-]{16,}['"]/i
  ];

  /**
   * Sanitizes external untrusted data ensuring it is treated as passive data, never active commands
   */
  public static sanitizeExternalData(input: string): { safeText: string; injectionDetected: boolean; flags: string[] } {
    const flags: string[] = [];
    let injectionDetected = false;

    for (const pattern of this.INJECTION_PATTERNS) {
      if (pattern.test(input)) {
        injectionDetected = true;
        flags.push(`INJECTION_PATTERN_NEUTRALIZED: ${pattern.toString()}`);
      }
    }

    // Strip/neutralize active execution payloads
    let safe = input;
    for (const pattern of this.INJECTION_PATTERNS) {
      safe = safe.replace(pattern, "[UNTRUSTED_CONTENT_FILTERED]");
    }

    return {
      safeText: safe,
      injectionDetected,
      flags
    };
  }

  /**
   * Inspects and redacts any credentials or secrets before memory or log persistence
   */
  public static redactSecrets(content: string): { redactedText: string; secretsFound: number } {
    let redacted = content;
    let count = 0;

    for (const pattern of this.SECRET_PATTERNS) {
      const matches = redacted.match(pattern);
      if (matches) {
        count += matches.length;
        redacted = redacted.replace(pattern, "[REDACTED_SECRET]");
      }
    }

    return {
      redactedText: redacted,
      secretsFound: count
    };
  }

  /**
   * Validates if an action satisfies the immutable safety invariants
   */
  public static validateActionSafety(action: {
    targetPath?: string;
    isPromotion?: boolean;
    hasOwnerSignature?: boolean;
    modifiesCore?: boolean;
    modifiesPermissions?: boolean;
    bypassesSandbox?: boolean;
  }): { isSafe: boolean; violations: string[] } {
    const violations: string[] = [];

    if (action.modifiesCore) {
      violations.push("VIOLATION: Invariant 1 - Frozen core cannot be modified");
    }
    if (action.isPromotion && !action.hasOwnerSignature) {
      violations.push("VIOLATION: Invariant 2 & 15 - Production modification requires Owner approval");
    }
    if (action.modifiesPermissions) {
      violations.push("VIOLATION: Invariant 10 - Self-modification of permissions prohibited");
    }
    if (action.bypassesSandbox) {
      violations.push("VIOLATION: Invariant 14 - Direct production modification without sandbox prohibited");
    }

    return {
      isSafe: violations.length === 0,
      violations
    };
  }
}
