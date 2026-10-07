/**
 * ANTIGRAVITY OS v7.0 — FACT-BASED INTELLIGENCE + SECURITY FABRIC
 * TrustFabric.ts: Central Master Pipeline orchestrating Fact Extraction, Verification & Provenance
 */

import crypto from "crypto";
import {
  ClaimRecord,
  SourceRecord,
  EvidenceRecord,
  FactStatus,
  EvidenceLevel,
  RiskCategory,
  TrustScore
} from "./TrustTypes";
import { ClaimRegistry } from "./ClaimRegistry";
import { EvidenceGraph } from "./EvidenceGraph";
import { SourceTrustEngine } from "./SourceTrustEngine";
import { FreshnessEngine } from "./FreshnessEngine";
import { ContradictionEngine } from "./ContradictionEngine";
import { SecurityGuards } from "./SecurityGuards";
import { TrustPolicyEngine } from "./TrustPolicyEngine";
import { MemorySafetyEngine } from "./MemorySafetyEngine";

export interface TrustFabricPipelineInput {
  rawInput: string;
  sourceContext?: {
    location: string;
    type: "LOCAL_FILE" | "PRIMARY_SOURCE" | "USER_ASSERTION" | "MODEL_OUTPUT" | "LOCAL_RUNTIME";
    rawContent?: string;
  };
  destination?: "LOCAL" | "CLOUD";
  riskCategory?: RiskCategory;
  isCreative?: boolean;
}

export interface TrustFabricPipelineResult {
  input: string;
  sanitizedInput: string;
  classification: "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "SENSITIVE" | "SECRET";
  claims: ClaimRecord[];
  sources: SourceRecord[];
  evidence: EvidenceRecord[];
  contradictions: string[];
  trustScore: TrustScore;
  auditTrailId: string;
  securityVerdict: "ALLOWED" | "BLOCKED" | "REDACTED";
  factualReport: string;
}

export class TrustFabric {
  private static instance: TrustFabric;

  private readonly claimRegistry: ClaimRegistry;
  private readonly evidenceGraph: EvidenceGraph;
  private readonly sourceEngine: SourceTrustEngine;
  private readonly freshnessEngine: FreshnessEngine;
  private readonly contradictionEngine: ContradictionEngine;
  private readonly securityGuards: SecurityGuards;
  private readonly policyEngine: TrustPolicyEngine;
  private readonly memoryEngine: MemorySafetyEngine;

  private constructor() {
    this.claimRegistry = ClaimRegistry.getInstance();
    this.evidenceGraph = EvidenceGraph.getInstance();
    this.sourceEngine = SourceTrustEngine.getInstance();
    this.freshnessEngine = FreshnessEngine.getInstance();
    this.contradictionEngine = ContradictionEngine.getInstance();
    this.securityGuards = SecurityGuards.getInstance();
    this.policyEngine = TrustPolicyEngine.getInstance();
    this.memoryEngine = MemorySafetyEngine.getInstance();
  }

  public static getInstance(): TrustFabric {
    if (!TrustFabric.instance) {
      TrustFabric.instance = new TrustFabric();
    }
    return TrustFabric.instance;
  }

  /**
   * Executes the Complete 12-Step Fact & Security Pipeline:
   * INPUT -> SOURCE DETECTION -> CONTENT CLASSIFICATION -> FACT EXTRACTION -> CLAIM REGISTRY -> SOURCE LINKING -> EVIDENCE COLLECTION -> CROSS-CHECK -> CONTRADICTION DETECTION -> CONFIDENCE CALCULATION -> FACT STATUS -> AUDIT TRAIL
   */
  public process(inputParams: TrustFabricPipelineInput): TrustFabricPipelineResult {
    const rawInput = inputParams.rawInput;

    // STEP 1: INPUT VALIDATION & PROMPT INJECTION SCAN
    const injectionCheck = this.securityGuards.detectPromptInjection(rawInput, "PIPELINE_INGESTION");
    if (injectionCheck.detected) {
      this.policyEngine.recordAuditLog({
        actor: "TRUST_FABRIC",
        task: "INGESTION",
        tool: "INJECTION_DETECTOR",
        action: "REJECT",
        decision: "BLOCK",
        policy: "PROMPT_INJECTION_DEFENSE"
      });

      return {
        input: rawInput,
        sanitizedInput: "[BLOCKED_INJECTION_PAYLOAD]",
        classification: "SECRET",
        claims: [],
        sources: [],
        evidence: [],
        contradictions: [],
        trustScore: this.calculateTrustScore([], [], 0),
        auditTrailId: "AUDIT_BLOCKED_INJECTION",
        securityVerdict: "BLOCKED",
        factualReport: `BLOCKED: Security violation detected. ${injectionCheck.reason}`
      };
    }

    // STEP 2: SECRET & PII SCANNING
    const secretScan = this.securityGuards.scanAndRedactSecrets(rawInput);
    const piiScan = this.securityGuards.detectAndSanitizePII(secretScan.redactedContent, "MASK");
    const sanitizedInput = piiScan.sanitizedText;

    // STEP 3: SOURCE DETECTION & REGISTRATION
    const detectedSources: SourceRecord[] = [];
    if (inputParams.sourceContext) {
      if (inputParams.sourceContext.type === "LOCAL_FILE") {
        detectedSources.push(this.sourceEngine.registerLocalFile(inputParams.sourceContext.location));
      } else if (inputParams.sourceContext.type === "LOCAL_RUNTIME") {
        detectedSources.push(this.sourceEngine.registerRuntimeSource(inputParams.sourceContext.location, inputParams.sourceContext.rawContent || ""));
      } else {
        detectedSources.push(this.sourceEngine.registerExternalSource({
          url: inputParams.sourceContext.location,
          domain: "local-env",
          rawContent: inputParams.sourceContext.rawContent || sanitizedInput
        }));
      }
    } else {
      // Default to USER_ASSERTION
      detectedSources.push({
        sourceId: `src_user_${crypto.randomBytes(4).toString("hex")}`,
        location: "USER_CHAT_INPUT",
        type: "USER_ASSERTION",
        timestamp: Date.now(),
        retrievalTimestamp: Date.now(),
        contentHash: crypto.createHash("sha256").update(sanitizedInput).digest("hex"),
        origin: "USER_INTERACTION",
        integrity: "UNKNOWN",
        freshness: "REAL_TIME",
        trustLevel: 0.4,
        isDirectRuntime: false
      });
    }

    // STEP 4: CONTENT CLASSIFICATION & CLOUD DLP CHECK
    const classification = secretScan.detected ? "SECRET" : (piiScan.detected ? "SENSITIVE" : "INTERNAL");
    const dlpResult = this.securityGuards.evaluateDLP(sanitizedInput, inputParams.destination || "LOCAL", classification);
    if (!dlpResult.allowed) {
      return {
        input: rawInput,
        sanitizedInput: "[BLOCKED_DLP]",
        classification,
        claims: [],
        sources: detectedSources,
        evidence: [],
        contradictions: [],
        trustScore: this.calculateTrustScore([], detectedSources, 0),
        auditTrailId: "AUDIT_BLOCKED_DLP",
        securityVerdict: "BLOCKED",
        factualReport: `BLOCKED: Cloud Data Loss Prevention rule triggered: ${dlpResult.reason}`
      };
    }

    // STEP 5: FACT EXTRACTION
    const extractedStatements = this.extractStatementsFromText(sanitizedInput);
    const registeredClaims: ClaimRecord[] = [];
    const collectedEvidence: EvidenceRecord[] = [];

    // STEP 6: CLAIM REGISTRATION & SOURCE LINKING
    for (const stmt of extractedStatements) {
      const isCreative = Boolean(inputParams.isCreative);
      const isRuntime = detectedSources.some((s) => s.isDirectRuntime);
      const isLocalFile = detectedSources.some((s) => s.type === "LOCAL_FILE");

      let initialStatus: FactStatus = "UNKNOWN";
      let initialLevel: EvidenceLevel = "E0";

      if (isCreative) {
        initialStatus = "GENERATED";
        initialLevel = "E1";
      } else if (isRuntime) {
        initialStatus = "OBSERVED";
        initialLevel = "E5";
      } else if (isLocalFile) {
        initialStatus = "OBSERVED";
        initialLevel = "E3";
      }

      const claim = this.claimRegistry.registerClaim({
        text: stmt,
        type: isCreative ? "CREATIVE_GENERATED" : "FACTUAL",
        status: initialStatus,
        evidenceLevel: initialLevel,
        riskCategory: inputParams.riskCategory || "GENERAL",
        sourceIds: detectedSources.map((s) => s.sourceId),
        freshnessClass: "STABLE"
      });

      // Add to Evidence Graph
      this.evidenceGraph.addNode(claim.claimId, "CLAIM", claim.text);
      for (const src of detectedSources) {
        this.evidenceGraph.addNode(src.sourceId, "SOURCE", src.location);
        this.evidenceGraph.addEdge(src.sourceId, claim.claimId, isRuntime ? "VERIFIED_BY" : "OBSERVED_IN");
      }

      // Collect Initial Evidence
      if (isRuntime || isLocalFile) {
        const primarySrc = detectedSources[0];
        const primarySrcId = primarySrc ? primarySrc.sourceId : "src_fallback_initial";
        const ev: EvidenceRecord = {
          evidenceId: `ev_${crypto.randomBytes(6).toString("hex")}`,
          claimId: claim.claimId,
          sourceId: primarySrcId,
          type: isRuntime ? "EXECUTION" : "FILE_HASH",
          level: initialLevel,
          content: `Initial empirical capture of: ${stmt}`,
          hash: crypto.createHash("sha256").update(stmt).digest("hex"),
          timestamp: Date.now(),
          verifiedBy: "TRUST_FABRIC_CORE",
          reproducible: true
        };
        collectedEvidence.push(ev);
        claim.evidenceIds.push(ev.evidenceId);

        this.evidenceGraph.addNode(ev.evidenceId, "TEST", ev.content);
        this.evidenceGraph.addEdge(ev.evidenceId, claim.claimId, "SUPPORTS");
      }

      registeredClaims.push(claim);
    }

    // STEP 7: CROSS-CHECK & CONTRADICTION DETECTION
    const detectedContradictions: string[] = [];
    const allClaims = this.claimRegistry.getAllClaims();
    for (const currentClaim of registeredClaims) {
      for (const otherClaim of allClaims) {
        if (currentClaim.claimId !== otherClaim.claimId) {
          const contra = this.contradictionEngine.evaluatePair(
            currentClaim,
            otherClaim,
            detectedSources,
            [],
            collectedEvidence
          );
          if (contra) {
            detectedContradictions.push(contra.id);
            this.evidenceGraph.addEdge(currentClaim.claimId, otherClaim.claimId, "CONTRADICTS");
          }
        }
      }
    }

    // STEP 8: FRESHNESS EVALUATION
    for (const claim of registeredClaims) {
      this.freshnessEngine.applyFreshnessCheck(claim);
    }

    // STEP 9: CONFIDENCE & TRUST SCORE CALCULATION
    const trustScore = this.calculateTrustScore(registeredClaims, detectedSources, detectedContradictions.length);

    // STEP 10: AUDIT TRAIL LOGGING
    const auditLog = this.policyEngine.recordAuditLog({
      actor: "TRUST_FABRIC_ENGINE",
      task: "EVALUATE_CLAIMS",
      tool: "TRUST_FABRIC",
      action: "PROCESS_PIPELINE",
      decision: "ALLOW",
      policy: "FACT_BASED_INTELLIGENCE_STANDARD",
      inputHash: crypto.createHash("sha256").update(sanitizedInput).digest("hex")
    });

    // STEP 11: GENERATE FACTUAL REPORT
    const factualReport = this.generateFactualReport(registeredClaims, collectedEvidence, detectedContradictions, trustScore);

    return {
      input: rawInput,
      sanitizedInput,
      classification,
      claims: registeredClaims,
      sources: detectedSources,
      evidence: collectedEvidence,
      contradictions: detectedContradictions,
      trustScore,
      auditTrailId: auditLog.id,
      securityVerdict: secretScan.detected || piiScan.detected ? "REDACTED" : "ALLOWED",
      factualReport
    };
  }

  /**
   * Generates a balanced, evidence-grounded factual report
   */
  public generateFactualReport(
    claims: ClaimRecord[],
    evidence: EvidenceRecord[],
    contradictions: string[],
    trustScore: TrustScore
  ): string {
    const verified = claims.filter((c) => c.status === "VERIFIED" || c.status === "OBSERVED");
    const supported = claims.filter((c) => c.status === "SUPPORTED");
    const inferred = claims.filter((c) => c.status === "INFERRED");
    const generated = claims.filter((c) => c.status === "GENERATED");
    const unknown = claims.filter((c) => c.status === "UNKNOWN");
    const contradicted = claims.filter((c) => c.status === "CONTRADICTED");
    const stale = claims.filter((c) => c.status === "STALE");

    let report = `### FACTUAL INTELLIGENCE REPORT\n\n`;
    report += `**Overall TrustScore**: ${trustScore.score.toFixed(1)} / 100.0\n`;
    report += `- Evidence Completeness: ${trustScore.evidenceScore.toFixed(1)}\n`;
    report += `- Source Reliability: ${trustScore.sourceQualityScore.toFixed(1)}\n`;
    report += `- Contradiction Rate: ${contradictions.length}\n\n`;

    if (verified.length > 0) {
      report += `#### VERIFIED / OBSERVED FACTS (${verified.length})\n`;
      verified.forEach((c) => (report += `- [${c.evidenceLevel}] ${c.text} (Hash: \`${c.hash.slice(0, 8)}\`)\n`));
    }

    if (supported.length > 0) {
      report += `\n#### SUPPORTED CLAIMS (${supported.length})\n`;
      supported.forEach((c) => (report += `- [${c.evidenceLevel}] ${c.text}\n`));
    }

    if (inferred.length > 0) {
      report += `\n#### LOGICAL INFERENCES (${inferred.length})\n`;
      inferred.forEach((c) => (report += `- ${c.text} *(Requires empirical verification)*\n`));
    }

    if (unknown.length > 0) {
      report += `\n#### UNKNOWN / INSUFFICIENT EVIDENCE (${unknown.length})\n`;
      unknown.forEach((c) => (report += `- ${c.text} -> "Insufficient evidence to verify this."\n`));
    }

    if (contradicted.length > 0) {
      report += `\n#### CONTRADICTIONS DETECTED (${contradicted.length})\n`;
      contradicted.forEach((c) => (report += `- ${c.text} *(Conflict under arbitration)*\n`));
    }

    if (stale.length > 0) {
      report += `\n#### STALE CLAIMS (${stale.length})\n`;
      stale.forEach((c) => (report += `- ${c.text} *(Validity expired, re-verification required)*\n`));
    }

    report += `\n#### LIMITATIONS & UNCERTAINTIES\n`;
    report += `- Models generate hypotheses; empirical evidence establishes truth.\n`;
    report += `- Zero-hallucination policy active: missing evidence is preserved as UNKNOWN.\n`;

    return report;
  }

  /**
   * Evaluates TrustScore (never Truth Score)
   */
  public calculateTrustScore(claims: ClaimRecord[], sources: SourceRecord[], contradictionCount: number): TrustScore {
    if (claims.length === 0) {
      return {
        score: 0,
        evidenceScore: 0,
        sourceQualityScore: 0,
        freshnessScore: 100,
        verificationScore: 0,
        contradictionPenalty: 0,
        runtimeVerificationBonus: 0,
        provenanceCompleteness: 0,
        uncertaintyDeduction: 100
      };
    }

    const verifiedCount = claims.filter((c) => c.status === "VERIFIED" || c.status === "OBSERVED").length;
    const supportedCount = claims.filter((c) => c.status === "SUPPORTED").length;
    const unknownCount = claims.filter((c) => c.status === "UNKNOWN").length;
    const staleCount = claims.filter((c) => c.status === "STALE").length;
    const runtimeCount = claims.filter((c) => c.evidenceLevel === "E5").length;

    const sourceTrustAvg = sources.length > 0 ? sources.reduce((acc, s) => acc + s.trustLevel, 0) / sources.length : 0.5;

    const evidenceScore = Math.min(100, ((verifiedCount * 1.0 + supportedCount * 0.7) / claims.length) * 100);
    const sourceQualityScore = sourceTrustAvg * 100;
    const freshnessScore = Math.max(0, 100 - (staleCount / claims.length) * 100);
    const verificationScore = (verifiedCount / claims.length) * 100;
    const contradictionPenalty = contradictionCount * 25;
    const runtimeVerificationBonus = Math.min(20, runtimeCount * 10);
    const uncertaintyDeduction = (unknownCount / claims.length) * 40;
    const provenanceCompleteness = sources.length > 0 ? 100 : 20;

    let totalScore =
      evidenceScore * 0.35 +
      sourceQualityScore * 0.25 +
      freshnessScore * 0.15 +
      verificationScore * 0.25 +
      runtimeVerificationBonus -
      contradictionPenalty -
      uncertaintyDeduction;

    totalScore = Math.max(0, Math.min(100, totalScore));

    return {
      score: totalScore,
      evidenceScore,
      sourceQualityScore,
      freshnessScore,
      verificationScore,
      contradictionPenalty,
      runtimeVerificationBonus,
      provenanceCompleteness,
      uncertaintyDeduction
    };
  }

  private extractStatementsFromText(text: string): string[] {
    const sentences = text
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 5);

    return sentences.length > 0 ? sentences : [text.trim()];
  }

  // Getters for subsystems
  public getClaimRegistry(): ClaimRegistry { return this.claimRegistry; }
  public getEvidenceGraph(): EvidenceGraph { return this.evidenceGraph; }
  public getSourceEngine(): SourceTrustEngine { return this.sourceEngine; }
  public getFreshnessEngine(): FreshnessEngine { return this.freshnessEngine; }
  public getContradictionEngine(): ContradictionEngine { return this.contradictionEngine; }
  public getSecurityGuards(): SecurityGuards { return this.securityGuards; }
  public getPolicyEngine(): TrustPolicyEngine { return this.policyEngine; }
  public getMemoryEngine(): MemorySafetyEngine { return this.memoryEngine; }
}
