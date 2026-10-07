/**
 * ANTIGRAVITY OS v7.0 — COMFYUI GENERATIVE MEDIA FABRIC
 * ComfyUISecurity.ts: Custom Node Static Analysis, Injection Defense, and Path Security
 */

export interface CustomNodeSecurityAudit {
  nodeName: string;
  isApproved: boolean;
  containsMaliciousCode: boolean;
  suspiciousPatterns: string[];
  status: "APPROVED" | "REJECTED_UNSAFE";
}

export class ComfyUISecurity {
  private static readonly SUSPICIOUS_PATTERNS = [
    /os\.system\s*\(/i,
    /subprocess\.Popen\s*\(/i,
    /eval\s*\(/i,
    /exec\s*\(/i,
    /socket\.connect/i,
    /requests\.post\s*\(/i,
    /urllib\.request/i,
    /__import__\s*\(\s*['"]os['"]\s*\)/i
  ];

  private static readonly PROMPT_INJECTIONS = [
    /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
    /disable\s+(security|filters|safeties)/i,
    /send\s+(secrets|passwords|keys)/i,
    /<script[\s\S]*?>/i
  ];

  /**
   * Sanitizes user media prompts, neutralizing prompt injection attempts
   */
  public static sanitizePrompt(prompt: string): { safePrompt: string; injectionDetected: boolean } {
    let injectionDetected = false;
    let safe = prompt;

    for (const pattern of this.PROMPT_INJECTIONS) {
      if (pattern.test(safe)) {
        injectionDetected = true;
        safe = safe.replace(pattern, "[FILTERED]");
      }
    }

    return {
      safePrompt: safe,
      injectionDetected
    };
  }

  /**
   * Statically audits Python custom node source code before allowing registration
   */
  public static auditCustomNode(nodeName: string, sourceCode: string): CustomNodeSecurityAudit {
    const suspicious: string[] = [];

    for (const pattern of this.SUSPICIOUS_PATTERNS) {
      if (pattern.test(sourceCode)) {
        suspicious.push(`SUSPICIOUS_PATTERN_DETECTED: ${pattern.toString()}`);
      }
    }

    const hasThreats = suspicious.length > 0;
    return {
      nodeName,
      isApproved: !hasThreats,
      containsMaliciousCode: hasThreats,
      suspiciousPatterns: suspicious,
      status: hasThreats ? "REJECTED_UNSAFE" : "APPROVED"
    };
  }
}
