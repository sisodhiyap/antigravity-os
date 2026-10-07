/**
 * ANTIGRAVITY OS v7.0 — FACT-BASED INTELLIGENCE + SECURITY FABRIC
 * TrustTypes.ts: Unified type contracts, enums, interfaces, and data models
 */

// 1. Fact Status Model
export type FactStatus =
  | "OBSERVED"
  | "VERIFIED"
  | "SUPPORTED"
  | "INFERRED"
  | "GENERATED"
  | "ASSUMED"
  | "UNKNOWN"
  | "CONTRADICTED"
  | "STALE";

// 2. Evidence Scoring Levels (E0 - E5)
export type EvidenceLevel =
  | "E0" // No evidence
  | "E1" // Model-generated assertion
  | "E2" // User/source assertion
  | "E3" // Trusted source support
  | "E4" // Independent cross-check
  | "E5"; // Direct executable/runtime evidence

// 3. Source Classes
export type SourceClass =
  | "OWNER_SOURCE"
  | "LOCAL_RUNTIME"
  | "LOCAL_FILE"
  | "OFFICIAL_DOCUMENTATION"
  | "PRIMARY_SOURCE"
  | "SECONDARY_SOURCE"
  | "TERTIARY_SOURCE"
  | "MODEL_OUTPUT"
  | "USER_ASSERTION"
  | "UNKNOWN_SOURCE";

// 4. Fact Freshness Classes
export type FreshnessClass =
  | "REAL_TIME"
  | "HOURLY"
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY"
  | "YEARLY"
  | "STABLE"
  | "UNKNOWN";

// 5. High-Risk Fact Categories
export type RiskCategory =
  | "SECURITY"
  | "MEDICAL"
  | "LEGAL"
  | "FINANCIAL"
  | "IDENTITY"
  | "CURRENT_EVENTS"
  | "GOVERNMENT"
  | "SAFETY"
  | "SCIENTIFIC_CLAIMS"
  | "SOFTWARE_SECURITY"
  | "PRIVACY"
  | "CURRENT_PRODUCT_CAPABILITIES"
  | "GENERAL";

// 6. Data Classification Levels
export type DataClassification =
  | "PUBLIC"
  | "INTERNAL"
  | "CONFIDENTIAL"
  | "SENSITIVE"
  | "SECRET";

// 7. Graph Node & Edge Types
export type EvidenceNodeType =
  | "CLAIM"
  | "SOURCE"
  | "DOCUMENT"
  | "FILE"
  | "IMAGE"
  | "VIDEO"
  | "AUDIO"
  | "MODEL"
  | "RUNTIME"
  | "API"
  | "DATABASE"
  | "OBSERVATION"
  | "TEST"
  | "EXTERNAL_REFERENCE";

export type EvidenceEdgeType =
  | "SUPPORTS"
  | "CONTRADICTS"
  | "DERIVED_FROM"
  | "OBSERVED_IN"
  | "VERIFIED_BY"
  | "GENERATED_BY"
  | "DEPENDS_ON"
  | "SUPERSEDES";

export interface EvidenceNode {
  id: string;
  type: EvidenceNodeType;
  label: string;
  metadata: Record<string, unknown>;
  createdAt: number;
}

export interface EvidenceEdge {
  id: string;
  fromId: string;
  toId: string;
  type: EvidenceEdgeType;
  weight: number;
  metadata?: Record<string, unknown>;
  createdAt: number;
}

// 8. Claim Structure
export interface ClaimRecord {
  claimId: string;
  text: string;
  type: "FACTUAL" | "CREATIVE_GENERATED" | "TECHNICAL" | "BEHAVIORAL" | "HYPOTHESIS";
  status: FactStatus;
  evidenceLevel: EvidenceLevel;
  confidence: number; // 0.0 to 1.0 (Evidence confidence, not truth probability)
  riskCategory: RiskCategory;
  createdAt: number;
  updatedAt: number;
  sourceIds: string[];
  evidenceIds: string[];
  modelIds: string[];
  verificationMethods: string[];
  contradictions: string[];
  freshness: {
    freshnessClass: FreshnessClass;
    lastVerified: number;
    expirationPolicy: string;
    nextVerification?: number;
    isStale: boolean;
  };
  owner: string;
  projectId: string;
  hash: string;
  provenanceTrail: string[];
}

// 9. Source Provenance Structure
export interface SourceRecord {
  sourceId: string;
  location: string;
  type: SourceClass;
  publisher?: string;
  timestamp: number;
  retrievalTimestamp: number;
  contentHash: string; // SHA-256
  version?: string;
  origin: string;
  license?: string;
  integrity: "VERIFIED" | "SUSPECT" | "TAMPERED" | "UNKNOWN";
  freshness: FreshnessClass;
  trustLevel: number; // 0.0 to 1.0
  isDirectRuntime: boolean;
}

// 10. Evidence Record
export interface EvidenceRecord {
  evidenceId: string;
  claimId: string;
  sourceId: string;
  type: "EXECUTION" | "FILE_HASH" | "CROSS_CHECK" | "API_RESPONSE" | "OBSERVATION" | "TEST_LOG";
  level: EvidenceLevel;
  content: string;
  hash: string;
  timestamp: number;
  verifiedBy: string;
  reproducible: boolean;
}

// 11. Contradiction Set
export type ContradictionResolution =
  | "A_SUPPORTED"
  | "B_SUPPORTED"
  | "BOTH_POSSIBLE"
  | "OUTDATED"
  | "UNRESOLVED";

export interface ContradictionSet {
  id: string;
  claimA: ClaimRecord;
  claimB: ClaimRecord;
  sourcesA: SourceRecord[];
  sourcesB: SourceRecord[];
  timestamps: { a: number; b: number };
  authority: { aScore: number; bScore: number };
  evidence: EvidenceRecord[];
  resolution: ContradictionResolution;
  explanation: string;
}

// 12. Capability Record
export interface CapabilityRecord {
  capabilityId: string;
  name: string;
  implementation: string;
  installed: boolean;
  enabled: boolean;
  executable: boolean;
  tested: boolean;
  verified: boolean;
  limitations: string[];
  evidence: string[];
  lastVerified: number;
}

// 13. Model Capability Verification
export type ModelStatus =
  | "DISCOVERED"
  | "INSTALLED"
  | "LOADABLE"
  | "EXECUTABLE"
  | "VERIFIED";

export interface ModelCapabilityRecord {
  modelId: string;
  name: string;
  provider: string;
  status: ModelStatus;
  capabilities: string[];
  testedModes: string[];
  evidenceIds: string[];
  lastVerified: number;
}

// 14. Code Reality Verification
export type CodeRealityState =
  | "DOCUMENTED"
  | "IMPLEMENTED"
  | "EXECUTABLE"
  | "TESTED"
  | "VERIFIED";

export interface CodeRealityResult {
  target: string;
  state: CodeRealityState;
  hasDocs: boolean;
  hasCode: boolean;
  executes: boolean;
  testsPass: boolean;
  independentCheck: boolean;
  evidence: string[];
}

// 15. Security & Prompt Injection
export interface InjectionDetectionResult {
  detected: boolean;
  location: string;
  payload: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  action: "BLOCK" | "SANITIZE" | "ISOLATE" | "ALLOW";
  reason: string;
}

export interface SecretScanResult {
  detected: boolean;
  redactedContent: string;
  foundSecrets: Array<{
    type: string;
    hashedReference: string;
    line?: number;
  }>;
}

export interface PIIDetectionResult {
  detected: boolean;
  items: Array<{
    type: "EMAIL" | "PHONE" | "ADDRESS" | "GOV_ID" | "FINANCIAL_ID" | "NAME" | "CREDENTIAL";
    masked: string;
    action: "REDACT" | "MASK" | "HASH" | "BLOCK" | "LOCAL_ONLY";
  }>;
  sanitizedText: string;
}

export interface DLPPolicyResult {
  allowed: boolean;
  destination: "LOCAL" | "CLOUD";
  classification: DataClassification;
  reason?: string;
  requiresOwnerApproval: boolean;
}

// 16. Least Privilege & Tool Guard
export type ToolPermission =
  | "READ_PROJECT"
  | "WRITE_PROJECT"
  | "READ_MEDIA"
  | "WRITE_MEDIA"
  | "EXECUTE_MODEL"
  | "NETWORK_LOCAL"
  | "NETWORK_EXTERNAL"
  | "READ_METADATA"
  | "WRITE_EVIDENCE";

export interface ToolGuardEvaluation {
  allowed: boolean;
  tool: string;
  caller: string;
  grantedPermissions: ToolPermission[];
  requiredPermission: ToolPermission;
  inputValid: boolean;
  securityClean: boolean;
  resourceClean: boolean;
  reason?: string;
}

// 17. Supply Chain & Runtime Integrity
export interface DependencyAuditResult {
  package: string;
  version: string;
  hash: string;
  source: string;
  license: string;
  knownVulnerabilities: string[];
  status: "SECURE" | "VULNERABLE" | "DRIFT_DETECTED" | "UNVERIFIED";
}

export interface RuntimeIntegrityEvent {
  id: string;
  type: "UNEXPECTED_PROCESS" | "UNEXPECTED_PORT" | "FILE_MUTATION" | "UNEXPECTED_PLUGIN" | "UNEXPECTED_NETWORK" | "ANOMALY";
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  timestamp: number;
  evidence: string;
  actionTaken: string;
}

// 18. Incident Management
export type IncidentState =
  | "DETECTED"
  | "CONTAINED"
  | "INVESTIGATING"
  | "RESOLVED"
  | "ESCALATED";

export interface IncidentRecord {
  incidentId: string;
  title: string;
  state: IncidentState;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  createdAt: number;
  updatedAt: number;
  mitigationSteps: string[];
  evidenceIds: string[];
  emergencyStopTriggered: boolean;
}

// 19. Knowledge Versioning & Memory Promotion
export interface KnowledgeItem {
  knowledgeId: string;
  version: number;
  topic: string;
  content: string;
  status: "CURRENT" | "SUPERSEDED" | "DEPRECATED" | "CONTRADICTED";
  sourceHash: string;
  evidenceHash: string;
  createdAt: number;
  verifiedAt: number;
  supersededAt?: number;
}

// 20. Audit Log Entry
export interface AuditLogEntry {
  id: string;
  actor: string;
  task: string;
  tool: string;
  action: string;
  timestamp: number;
  inputHash: string;
  outputHash: string;
  decision: "ALLOW" | "BLOCK" | "REDACT" | "ESCALATE";
  policy: string;
  evidenceId?: string;
}

// 21. Trust Score Metric
export interface TrustScore {
  score: number; // 0.0 to 100.0 (Labeled TrustScore, never Truth Score)
  evidenceScore: number;
  sourceQualityScore: number;
  freshnessScore: number;
  verificationScore: number;
  contradictionPenalty: number;
  runtimeVerificationBonus: number;
  provenanceCompleteness: number;
  uncertaintyDeduction: number;
}
