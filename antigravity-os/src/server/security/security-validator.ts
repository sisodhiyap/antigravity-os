import { artifactSystem } from "../artifacts/artifact-system";

export interface SecurityFinding {
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
  ruleId: string;
  category: "SECRET_LEAKAGE" | "OWASP_VULNERABILITY" | "PROMPT_INJECTION" | "RLS_BYPASS" | "UNSAFE_EVAL";
  description: string;
  location?: string;
  remediation: string;
}

export interface SecurityAuditReport {
  passed: boolean;
  score: number; // 0 - 100
  totalFindings: number;
  criticalCount: number;
  highCount: number;
  findings: SecurityFinding[];
  timestamp: string;
}

export class SecurityValidator {
  private static instance: SecurityValidator;

  private constructor() {}

  public static getInstance(): SecurityValidator {
    if (!SecurityValidator.instance) {
      SecurityValidator.instance = new SecurityValidator();
    }
    return SecurityValidator.instance;
  }

  /**
   * Scans source code and instructions for security vulnerabilities
   */
  public auditCodebase(files: { path: string; content: string }[], context: { projectId: string; taskId: string }): SecurityAuditReport {
    const findings: SecurityFinding[] = [];

    for (const file of files) {
      const content = file.content;

      // 1. Secret Scanning (OpenAI sk-*, sk-proj-*, GitHub ghp_*, Google AIza*, etc.)
      if (
        content.match(/sk-(proj-)?[a-zA-Z0-9_\-]{20,}/) ||
        content.match(/ghp_[a-zA-Z0-9]{36}/) ||
        content.match(/AIza[0-9A-Za-z\-_]{35}/) ||
        content.match(/vcp_[a-zA-Z0-9]{24,}/)
      ) {
        findings.push({
          severity: "CRITICAL",
          ruleId: "SEC-001-HARDCODED-SECRET",
          category: "SECRET_LEAKAGE",
          description: "Potential hardcoded API token or credential detected in source code",
          location: file.path,
          remediation: "Move credentials to .env and access via typed config manager",
        });
      }

      // 2. Unsafe eval / Function constructor
      if (content.includes("eval(") || content.includes("new Function(")) {
        findings.push({
          severity: "HIGH",
          ruleId: "SEC-002-UNSAFE-EVAL",
          category: "UNSAFE_EVAL",
          description: "Dangerous dynamic code execution (eval) found",
          location: file.path,
          remediation: "Use safe static parsing or structured AST interpretation",
        });
      }

      // 3. Prompt Injection Defense
      if (
        content.toLowerCase().includes("ignore previous instructions") ||
        content.toLowerCase().includes("bypass all safety guidelines")
      ) {
        findings.push({
          severity: "CRITICAL",
          ruleId: "SEC-003-PROMPT-INJECTION",
          category: "PROMPT_INJECTION",
          description: "Adversarial prompt injection pattern detected",
          location: file.path,
          remediation: "Sanitize user prompt against adversarial overrides",
        });
      }
    }

    const criticalCount = findings.filter((f) => f.severity === "CRITICAL").length;
    const highCount = findings.filter((f) => f.severity === "HIGH").length;
    const passed = criticalCount === 0 && highCount === 0;
    const score = Math.max(0, 100 - criticalCount * 40 - highCount * 15 - findings.length * 5);

    const report: SecurityAuditReport = {
      passed,
      score,
      totalFindings: findings.length,
      criticalCount,
      highCount,
      findings,
      timestamp: new Date().toISOString(),
    };

    // Save Security Audit artifact
    artifactSystem.saveArtifact({
      name: "security-audit.json",
      category: "SECURITY",
      projectId: context.projectId,
      taskId: context.taskId,
      agentRole: "SECURITY_ENGINEER",
      content: report,
    });

    return report;
  }
}

export const securityValidator = SecurityValidator.getInstance();
