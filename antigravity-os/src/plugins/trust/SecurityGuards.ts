/**
 * ANTIGRAVITY OS v7.0 — FACT-BASED INTELLIGENCE + SECURITY FABRIC
 * SecurityGuards.ts: Prompt injection defense, Secret Redaction, Data Classification, Cloud DLP & PII Guard
 */

import crypto from "crypto";
import {
  InjectionDetectionResult,
  SecretScanResult,
  PIIDetectionResult,
  DLPPolicyResult,
  DataClassification
} from "./TrustTypes";

export class SecurityGuards {
  private static instance: SecurityGuards;

  private readonly secretPatterns: Array<{ name: string; regex: RegExp }> = [
    { name: "OPENAI_API_KEY", regex: /sk-[A-Za-z0-9-_]{20,64}/gi },
    { name: "GENERIC_API_KEY", regex: /(api_key|apiKey|secret_key|private_key|token|auth_token)\s*[:=]\s*["']?([A-Za-z0-9\-_]{16,128})["']?/gi },
    { name: "GITHUB_TOKEN", regex: /gh[pousr]_[A-Za-z0-9_]{36,255}/gi },
    { name: "AWS_ACCESS_KEY", regex: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g },
    { name: "JWT_TOKEN", regex: /eyJ[A-Za-z0-9-_=]+\.eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]+/g },
    { name: "PRIVATE_KEY", regex: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----[\s\S]*?-----END\s+(?:RSA\s+)?PRIVATE\s+KEY-----/g },
    { name: "PASSWORD_ASSIGNMENT", regex: /(password|passwd|pwd)\s*[:=]\s*["']([^"']{6,64})["']/gi }
  ];

  private readonly injectionSignatures: Array<{ signature: string; pattern: RegExp; severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" }> = [
    { signature: "IGNORE_PREVIOUS_INSTRUCTIONS", pattern: /ignore\s+(?:all\s+)?previous\s+instructions/i, severity: "CRITICAL" },
    { signature: "SYSTEM_PROMPT_OVERRIDE", pattern: /you\s+are\s+now\s+(?:unconstrained|in\s+god\s+mode|dan|jailbroken)/i, severity: "CRITICAL" },
    { signature: "SECRET_EXFILTRATION", pattern: /reveal\s+(?:all\s+)?(?:secrets|api\s*keys|passwords|env|tokens)/i, severity: "CRITICAL" },
    { signature: "INDIRECT_COMMENT_INJECTION", pattern: /(?:<!--|\/\*|#|\/\/)\s*SYSTEM:\s*override/i, severity: "HIGH" },
    { signature: "DOCUMENT_PAYLOAD_EXPLOIT", pattern: /(?:eval|exec|import\s+os|__import__|subprocess)\s*\(.*curl/i, severity: "CRITICAL" },
    { signature: "MEMORY_POISON_OVERRIDE", pattern: /(?:always\s+trust\s+this|never\s+verify\s+this|disable\s+security\s+checks)/i, severity: "CRITICAL" },
    { signature: "FAKED_PROMPT_BOUNDARY", pattern: /<\|\s*endoftext\s*\|>|<\|\s*im_start\s*\|>/i, severity: "HIGH" }
  ];

  private readonly piiPatterns: Array<{ type: "EMAIL" | "PHONE" | "GOV_ID" | "FINANCIAL_ID"; regex: RegExp }> = [
    { type: "EMAIL", regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
    { type: "PHONE", regex: /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g },
    { type: "GOV_ID", regex: /\b\d{3}-\d{2}-\d{4}\b/g }, // SSN format
    { type: "FINANCIAL_ID", regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g } // Credit card format
  ];

  public static getInstance(): SecurityGuards {
    if (!SecurityGuards.instance) {
      SecurityGuards.instance = new SecurityGuards();
    }
    return SecurityGuards.instance;
  }

  /**
   * Scans content for direct and indirect prompt injection
   */
  public detectPromptInjection(content: string, location: string = "INPUT"): InjectionDetectionResult {
    for (const item of this.injectionSignatures) {
      const match = item.pattern.exec(content);
      if (match) {
        return {
          detected: true,
          location,
          payload: match[0],
          severity: item.severity,
          action: "BLOCK",
          reason: `Detected adversarial instruction signature [${item.signature}] in ${location}`
        };
      }
    }

    return {
      detected: false,
      location,
      payload: "",
      severity: "LOW",
      action: "ALLOW",
      reason: "No prompt injection patterns detected"
    };
  }

  /**
   * Scans and redacts secrets, replacing them with HASHED_REFERENCE tokens
   */
  public scanAndRedactSecrets(content: string): SecretScanResult {
    let sanitized = content;
    const foundSecrets: Array<{ type: string; hashedReference: string; line?: number }> = [];

    for (const pattern of this.secretPatterns) {
      sanitized = sanitized.replace(pattern.regex, (match, ...args) => {
        const rawSecret = args[1] || match;
        const secretHash = crypto.createHash("sha256").update(rawSecret).digest("hex").slice(0, 12);
        const refToken = `[REDACTED_SECRET_${pattern.name}:${secretHash}]`;
        foundSecrets.push({
          type: pattern.name,
          hashedReference: refToken
        });
        return refToken;
      });
    }

    return {
      detected: foundSecrets.length > 0,
      redactedContent: sanitized,
      foundSecrets
    };
  }

  /**
   * Evaluates data classification and applies Cloud DLP policy
   */
  public evaluateDLP(
    content: string,
    destination: "LOCAL" | "CLOUD",
    classification: DataClassification = "INTERNAL"
  ): DLPPolicyResult {
    // 1. Secrets can NEVER go to cloud
    const secretScan = this.scanAndRedactSecrets(content);
    if (secretScan.detected && destination === "CLOUD") {
      return {
        allowed: false,
        destination,
        classification: "SECRET",
        reason: "BLOCKED: Payload contains unredacted secrets targeting cloud egress",
        requiresOwnerApproval: true
      };
    }

    // 2. SECRET / SENSITIVE classification routing
    if (classification === "SECRET" && destination === "CLOUD") {
      return {
        allowed: false,
        destination,
        classification: "SECRET",
        reason: "BLOCKED: SECRET classified assets are restricted to LOCAL ONLY",
        requiresOwnerApproval: true
      };
    }

    if (classification === "SENSITIVE" && destination === "CLOUD") {
      return {
        allowed: false,
        destination,
        classification: "SENSITIVE",
        reason: "BLOCKED: SENSITIVE assets require explicit OWNER approval before cloud transfer",
        requiresOwnerApproval: true
      };
    }

    return {
      allowed: true,
      destination,
      classification,
      requiresOwnerApproval: false
    };
  }

  /**
   * Detects PII and generates a redaction/mask report
   */
  public detectAndSanitizePII(content: string, action: "MASK" | "REDACT" = "MASK"): PIIDetectionResult {
    let sanitized = content;
    const items: Array<{
      type: "EMAIL" | "PHONE" | "GOV_ID" | "FINANCIAL_ID" | "NAME" | "CREDENTIAL";
      masked: string;
      action: "REDACT" | "MASK" | "HASH" | "BLOCK" | "LOCAL_ONLY";
    }> = [];

    for (const p of this.piiPatterns) {
      sanitized = sanitized.replace(p.regex, (match) => {
        let masked = "";
        if (p.type === "EMAIL") {
          const parts = match.split("@");
          const local = parts[0] || "";
          const domain = parts[1] || "";
          masked = `${local.slice(0, 2)}***@${domain}`;
        } else if (p.type === "PHONE") {
          masked = `***-***-${match.slice(-4)}`;
        } else if (p.type === "GOV_ID" || p.type === "FINANCIAL_ID") {
          masked = `[REDACTED_${p.type}]`;
        }

        items.push({
          type: p.type,
          masked,
          action
        });

        return action === "REDACT" ? `[REDACTED_${p.type}]` : masked;
      });
    }

    return {
      detected: items.length > 0,
      items,
      sanitizedText: sanitized
    };
  }
}
