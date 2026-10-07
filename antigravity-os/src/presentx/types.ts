/**
 * PRESENTX STUDIO — V7-NATIVE PRODUCTION TYPE DEFINITIONS
 * types.ts: Comprehensive type definitions for PresentX Studio
 * Includes Source Reality Gate, Truth Firewalls, Export Manifests, and Lineage.
 */

export type VisualDirection =
  | "EDITORIAL"
  | "MINIMAL"
  | "CORPORATE"
  | "TECH"
  | "FUTURISTIC"
  | "CREATIVE"
  | "LUXURY"
  | "DATA_DRIVEN"
  | "ACADEMIC";

export type PresentationType =
  | "PITCH_DECK"
  | "PROPOSAL"
  | "SALES_DECK"
  | "INVESTOR_DECK"
  | "EDUCATIONAL"
  | "WORKSHOP"
  | "REPORT"
  | "PORTFOLIO"
  | "CASE_STUDY"
  | "PRODUCT_LAUNCH"
  | "COMPANY_OVERVIEW"
  | "RESEARCH"
  | "STORYTELLING"
  | "CUSTOM";

export type SlideLayout =
  | "HERO"
  | "EDITORIAL"
  | "FULL_BLEED"
  | "ASYMMETRIC"
  | "TWO_COLUMN"
  | "THREE_COLUMN"
  | "METRICS_GRID"
  | "DATA_STORY"
  | "CHART_RIGHT"
  | "CHART_VIEW"
  | "PROCESS_FLOW"
  | "TIMELINE"
  | "SYSTEM_DIAGRAM"
  | "COMPARISON"
  | "MATRIX"
  | "CASE_STUDY"
  | "QUOTE_CALLOUT"
  | "QUOTE"
  | "PRODUCT_SHOWCASE"
  | "SCREENSHOT_STORY"
  | "BEFORE_AFTER"
  | "ROADMAP"
  | "DATA_TABLE"
  | "TABLE"
  | "CONCLUSION_CTA"
  | "CONCLUSION"
  | "CTA"
  | "TITLE_CONTENT"
  | "FUNNEL"
  | "ARCHITECTURE"
  | "DIAGRAM"
  | "IMAGE_STORY"
  | "FULL_IMAGE"
  | "SECTION_DIVIDER";

export type ProvenanceStatus =
  | "OBSERVED"
  | "VERIFIED"
  | "SUPPORTED"
  | "INFERRED"
  | "ASSUMED"
  | "GENERATED"
  | "ILLUSTRATIVE"
  | "HYPOTHETICAL"
  | "UNVERIFIED"
  | "CONTRADICTED"
  | "UNKNOWN"
  | "STALE";

export type SourceRealityState =
  | "SOURCE_NOT_FOUND"
  | "SOURCE_UNREADABLE"
  | "SOURCE_UNVERIFIED"
  | "SOURCE_RETRIEVED"
  | "SOURCE_EXTRACTED"
  | "SOURCE_EVIDENCE_MATCHED"
  | "SOURCE_CONTRADICTED"
  | "SOURCE_STALE";

export type SourceQualityTier =
  | "TIER_A"
  | "TIER_B"
  | "TIER_C"
  | "TIER_D"
  | "TIER_E";

export type DataProvenanceType =
  | "REAL_DATA"
  | "USER_PROVIDED_DATA"
  | "ILLUSTRATIVE_DATA"
  | "GENERATED_DATA";

export type VisualFactualityType =
  | "VERIFIED_DATA_VISUAL"
  | "USER_PROVIDED_VISUAL"
  | "GENERATED_VISUAL"
  | "ILLUSTRATIVE_VISUAL";

export type CaseStudyClassification =
  | "REAL_VERIFIED_CASE"
  | "USER_PROVIDED_CASE"
  | "HYPOTHETICAL_CASE"
  | "SIMULATION"
  | "UNKNOWN";

export type TruthBadgeType =
  | "VERIFIED"
  | "SUPPORTED"
  | "INFERRED"
  | "ILLUSTRATIVE"
  | "UNVERIFIED"
  | "CONTRADICTED";

export interface PresentationBrief {
  title: string;
  purpose: string;
  audience: string;
  presentationType: PresentationType;
  tone: string;
  language: string;
  durationMinutes: number;
  slideCount: number;
  depth: "EXECUTIVE" | "STANDARD" | "DEEP_DIVE";
  visualStyle: VisualDirection;
  brandName?: string;
  callToAction: string;
  factualityMode: "STRICT_VERIFIED" | "BALANCED" | "EXPLORATORY";
  sourceRequirements?: string[];
}

export interface StoryNode {
  id: string;
  slideNumber: number;
  role: "HOOK" | "CONTEXT" | "PROBLEM" | "EVIDENCE" | "INSIGHT" | "SOLUTION" | "MECHANISM" | "BENEFITS" | "PROOF" | "CONCLUSION" | "CTA";
  keyMessage: string;
  tensionLevel: number;
  factLinkIds: string[];
}

export interface SourceRealityRecord {
  source_id: string;
  source_title: string;
  source_locator: string;
  source_url?: string;
  source_tier: SourceQualityTier;
  source_state: SourceRealityState;
  publication_date: string;
  retrieval_date: string;
  content_hash: string;
  extracted_excerpt?: string;
  evidence_hash?: string;
  ledger_event_id: string;
}

export interface FactClaim {
  claimId: string;
  text: string;
  sourceIds: string[];
  sourceClass: string;
  evidenceLevel: "E0" | "E1" | "E2" | "E3" | "E4" | "E5";
  confidence: number;
  createdAt: string;
  verifiedAt?: string;
  freshness: "LIVE" | "CURRENT" | "ARCHIVED" | "STALE";
  provenance: ProvenanceStatus;
  evidenceId?: string;
  contradictionNotes?: string;
  sourceReality?: SourceRealityRecord;
  verificationMethod?: "CRYPTOGRAPHIC_EXCERPT_MATCH" | "RUNTIME_EXECUTION" | "INDEPENDENT_CROSS_CHECK" | "UNVERIFIED";
  verifier?: string;
  ledgerEventId?: string;
  verificationInvalidated?: boolean;
  invalidationReason?: string;
}

export interface NumericalClaimFirewallRecord {
  claimId: string;
  metricLabel: string;
  value: string | number;
  source: string;
  dataset: string;
  unit: string;
  timePeriod: string;
  methodology: string;
  evidenceExcerpt: string;
  calculationFormula?: string;
  verified: boolean;
  status: DataProvenanceType;
}

export interface ContradictionSetRecord {
  id: string;
  claimA: string;
  claimB: string;
  sourceA: string;
  sourceB: string;
  pubDateA: string;
  pubDateB: string;
  methodologyA: string;
  methodologyB: string;
  confidenceA: number;
  confidenceB: number;
  resolutionStatus: "UNRESOLVED_CONTRADICTION" | "SOURCE_A_SUPERSEDES" | "SOURCE_B_SUPERSEDES" | "SCOPE_DISCREPANCY";
  conflictNotes: string;
}

export interface MetricItem {
  value: string;
  label: string;
  change?: string;
  trend?: "UP" | "DOWN" | "NEUTRAL";
  citation?: string;
  dataType?: DataProvenanceType;
  numericalFirewall?: NumericalClaimFirewallRecord;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  category?: string;
  secondaryValue?: number;
}

export interface ChartSpecification {
  type: "BAR" | "LINE" | "AREA" | "PIE" | "DONUT" | "FUNNEL" | "RADAR";
  title: string;
  data: ChartDataPoint[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  units?: string;
  source?: string;
  dataset?: string;
  timePeriod?: string;
  methodology?: string;
  datasetHash?: string;
  sourceHash?: string;
  calculationMethod?: string;
  dataType: DataProvenanceType;
  citation?: string;
}

export interface DiagramSpecification {
  type: "PROCESS" | "TIMELINE" | "MATRIX" | "FUNNEL" | "CYCLE" | "ARCHITECTURE";
  title: string;
  steps: {
    number: number;
    title: string;
    description: string;
    icon?: string;
  }[];
}

export interface DesignTokens {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  textSecondaryColor: string;
  fontHeading: string;
  fontBody: string;
  borderRadius: string;
  cardStyle: "SOLID" | "GLASS" | "OUTLINE" | "GRADIENT";
}

export interface SlideAuditResult {
  contentScore: number;
  visualScore: number;
  hierarchyScore: number;
  readabilityScore: number;
  accessibilityScore: number;
  factualityScore: number;
  truthBadge: TruthBadgeType;
  findings: {
    type: "INFO" | "WARNING" | "CRITICAL";
    defectCategory:
      | "TEXT_OVERFLOW"
      | "DENSITY_TOO_HIGH"
      | "WEAK_HIERARCHY"
      | "FACT_UNVERIFIED"
      | "BAD_CHART"
      | "VISUAL_INCONSISTENCY"
      | "ACCESSIBILITY_FAILURE"
      | "NUMERICAL_UNVERIFIED"
      | "CONTRADICTION_UNRESOLVED";
    message: string;
    fixAction?: string;
  }[];
}

export interface Slide {
  id: string;
  slideNumber: number;
  layout: SlideLayout;
  headline: string;
  subheadline?: string;
  bodyContent?: string;
  bulletPoints?: string[];
  keyMetrics?: MetricItem[];
  visualStrategy: string;
  visualFactuality?: VisualFactualityType;
  mediaPrompt?: string;
  mediaUrl?: string;
  chart?: ChartSpecification;
  diagram?: DiagramSpecification;
  caseStudyClassification?: CaseStudyClassification;
  quote?: {
    text: string;
    author: string;
    role?: string;
  };
  speakerNotes: string;
  citations: string[];
  facts: FactClaim[];
  designTokens: Partial<DesignTokens>;
  audit?: SlideAuditResult;
  lastEditedAt?: string;
}

export interface MediaRequest {
  id: string;
  slideId: string;
  purpose: "HERO" | "ILLUSTRATION" | "BACKGROUND" | "DIAGRAM" | "METAPHOR";
  subject: string;
  composition: string;
  style: string;
  lighting: string;
  camera: string;
  aspectRatio: string;
  resolution: string;
  negativePrompt?: string;
  seed: number;
  model: string;
  workflow: string;
  provenance: string;
}

export interface PresentationMediaBible {
  masterStyle: string;
  paletteMood: string;
  lighting: string;
  cameraLanguage: string;
  consistencySeed: number;
  items: MediaRequest[];
}

export interface AutoRepairRecord {
  id: string;
  slideId: string;
  defectCategory: string;
  originalValue: string;
  repairedValue: string;
  timestamp: string;
  success: boolean;
}

export interface VersionSnapshot {
  version: number;
  timestamp: string;
  author: string;
  changeReason: string;
  modelUsed: string;
  slidesCount: number;
  qualityScore: number;
  provenanceHash: string;
}

export interface ExportManifest {
  presentationHash: string;
  sourceHashes: string[];
  claimHashes: string[];
  evidenceHashes: string[];
  datasetHashes: string[];
  mediaHashes: string[];
  designSystemHash: string;
  auditHash: string;
  exportTimestamp: string;
  presentXVersion: string;
  v7Version: string;
  signature: string;
}

export interface OwnerOverrideRecord {
  id: string;
  overrideReason: string;
  ownerIdentity: string;
  timestamp: string;
  affectedClaims: string[];
  originalStatus: string;
  newStatus: string;
  exportHash: string;
}

export interface TruthFirewallResult {
  passed: boolean;
  blockedReason?: string;
  criticalClaimsCount: number;
  unverifiedClaimsCount: number;
  contradictedClaimsCount: number;
  staleClaimsCount: number;
  manifest?: ExportManifest;
  overrideApplied?: boolean;
}

export interface SourceRealityFactualityScore {
  evidenceCoverage: number;
  verifiedClaimsCount: number;
  supportedClaimsCount: number;
  partiallyVerifiedClaimsCount: number;
  unverifiedClaimsCount: number;
  contradictedClaimsCount: number;
  hypotheticalClaimsCount: number;
  sourceRetrievalCoverage: number;
  evidenceMatchCoverage: number;
  contradictionResolutionRate: number;
  freshnessCoverage: number;
  numericalVerificationRate: number;
  overallScore: number;
}

export interface QualityAuditSummary {
  overallScore: number;
  contentScore: number;
  storyScore: number;
  factualityScore: number;
  designScore: number;
  visualHierarchyScore: number;
  readabilityScore: number;
  accessibilityScore: number;
  consistencyScore: number;
  findingsCount: number;
  certified: boolean;
  verifiedClaimsCount: number;
  inferredClaimsCount: number;
  unverifiedClaimsCount: number;
  contradictedClaimsCount: number;
  sourceReality?: SourceRealityFactualityScore;
  truthFirewall?: TruthFirewallResult;
}

export interface CreativeBrief {
  thesis: string;
  audienceInsight: string;
  narrativeStrategy: string;
  emotionalArc: string;
  visualMetaphor: string;
  designDirection: string;
  typographyDirection: string;
  colorDirection: string;
  imageDirection: string;
  chartStrategy: string;
  slideRhythm: string;
  callToAction: string;
}

export interface DeckRecommendation {
  id: string;
  type: "REPETITION" | "STORY_GAP" | "COGNITIVE_LOAD" | "PACING" | "ACCESSIBILITY";
  severity: "LOW" | "MEDIUM" | "HIGH";
  title: string;
  description: string;
  suggestedAction: string;
  affectedSlideIndexes?: number[];
}

export interface DeckHealth {
  narrative: number;
  storyFlow: number;
  visualVariety: number;
  hierarchy: number;
  factuality: number;
  accessibility: number;
  brandConsistency: number;
  cognitiveLoadScore: number;
  overallScore: number;
  repetitionWarnings: string[];
  recommendations: DeckRecommendation[];
}

export interface IntentField<T> {
  value: T;
  inferred: boolean;
  confidence: number;
  sourceText?: string;
}

export interface IntentCard {
  projectType: IntentField<PresentationType>;
  audience: IntentField<string>;
  objective: IntentField<string>;
  purpose: IntentField<string>;
  tone: IntentField<string>;
  slideCount: IntentField<number>;
  contentDepth: IntentField<"EXECUTIVE" | "STANDARD" | "DEEP_DIVE">;
  visualStyle: IntentField<VisualDirection>;
  brand: IntentField<string>;
  language: IntentField<string>;
  factualityLevel: IntentField<"STRICT_VERIFIED" | "BALANCED" | "EXPLORATORY">;
  speakerNotesRequired: IntentField<boolean>;
  callToAction: IntentField<string>;
  exportTarget: IntentField<"PPTX" | "PDF" | "HTML" | "JSON">;
}

export interface BrandKit {
  name: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  fontHeading: string;
  fontBody: string;
  tone: string;
  imageryStyle: string;
  complianceScore?: number;
}

export interface PresentationProject {
  id: string;
  title: string;
  subtitle?: string;
  rawInput: string;
  brief: PresentationBrief;
  creativeBrief?: CreativeBrief;
  deckHealth?: DeckHealth;
  brandKit?: BrandKit;
  intentCard?: IntentCard;
  visualDirection: VisualDirection;
  designTokens: DesignTokens;
  storyGraph: StoryNode[];
  slides: Slide[];
  mediaBible: PresentationMediaBible;
  qualityAudit: QualityAuditSummary;
  evidenceStatus: "GROUNDED_E3" | "VERIFIED_E2" | "INFERRED_E1" | "UNVERIFIED";
  provenanceHash: string;
  version: number;
  versionHistory?: VersionSnapshot[];
  autoRepairs?: AutoRepairRecord[];
  contradictionSets?: ContradictionSetRecord[];
  ownerOverrides?: OwnerOverrideRecord[];
  exportManifest?: ExportManifest;
  createdAt: string;
  updatedAt: string;
}

export interface AiSlideCommandRequest {
  projectId: string;
  slideId?: string;
  action:
    | "REWRITE"
    | "SHORTEN"
    | "EXPAND"
    | "EXECUTIVE"
    | "PERSUASIVE"
    | "ADD_EVIDENCE"
    | "FACT_CHECK"
    | "GENERATE_VISUAL"
    | "CHANGE_LAYOUT"
    | "IMPROVE_HIERARCHY"
    | "ADD_SPEAKER_NOTES"
    | "AUTO_REPAIR_SLIDE"
    | "CUSTOM_COMMAND";
  customPrompt?: string;
  targetLayout?: SlideLayout;
}

// ── QUALITY DIRECTOR & QUALITY GATE TYPES ────────────────────────────────

export type ExportQualityMode = "FAST" | "BALANCED" | "PREMIUM" | "MAXIMUM";

export type QualityDirectorDecision =
  | "APPROVED"
  | "APPROVED_WITH_WARNINGS"
  | "REPAIR_REQUIRED"
  | "REJECTED"
  | "QUALITY_LIMIT_REACHED";

export type DefectSeverity = "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type DefectCategory =
  | "CONTENT"
  | "STORY"
  | "LAYOUT"
  | "TYPOGRAPHY"
  | "VISUAL"
  | "IMAGE"
  | "CHART"
  | "DATA"
  | "FACTUALITY"
  | "ACCESSIBILITY"
  | "EXPORT"
  | "SECURITY"
  | "PERFORMANCE";

export interface QualityDefect {
  defectId: string;
  slideId: string;
  slideNumber: number;
  severity: DefectSeverity;
  category: DefectCategory;
  evidence: string;
  cause: string;
  repairStrategy: string;
  confidence: number;
  risk: "LOW" | "MEDIUM" | "HIGH";
  affectedElements: string[];
  resolved?: boolean;
}

export interface SlideQualityDimensionScore {
  content: number;
  story: number;
  hierarchy: number;
  typography: number;
  composition: number;
  visuals: number;
  readability: number;
  accessibility: number;
  factuality: number;
  consistency: number;
  slideQualityScore: number;
}

export interface VisualInspectionResult {
  slideId: string;
  slideNumber: number;
  textOverflow: boolean;
  textUnderflow: boolean;
  clipping: boolean;
  alignmentIssue: boolean;
  contrastRatio: number;
  contrastPassed: boolean;
  visualBalanceScore: number;
  densityScore: number;
  chartLegibility: boolean;
  elementCollisions: boolean;
  findings: string[];
}

export interface MultiModelReviewResult {
  consensusMode:
    | "SINGLE_MODEL_REVIEW"
    | "2_MODEL_REVIEW"
    | "3_MODEL_REVIEW"
    | "4_MODEL_REVIEW"
    | "CREATIVE_REVIEW_UNAVAILABLE";
  modelsActive: string[];
  creativeDirectorScore: number;
  presentationDesignerScore: number;
  uxCriticScore: number;
  qualityCriticScore: number;
  combinedCreativeScore: number;
  reviews: Array<{
    role: string;
    model: string;
    feedback: string;
    score: number;
  }>;
}

export interface QualityRepairCycleRecord {
  cycle: number;
  slideId?: string;
  beforeHash: string;
  afterHash: string;
  beforeScores: {
    creative: number;
    trust: number;
    technical: number;
    accessibility: number;
  };
  afterScores: {
    creative: number;
    trust: number;
    technical: number;
    accessibility: number;
  };
  repairedDefects: string[];
  accepted: boolean;
  rollbackReason?: string;
}

export interface ExportPreflightReport {
  structurePassed: boolean;
  contentPassed: boolean;
  factualityPassed: boolean;
  visualQualityPassed: boolean;
  accessibilityPassed: boolean;
  securityPassed: boolean;
  openXmlPassed: boolean;
  roundtripPassed: boolean;
  evidencePassed: boolean;
  hashPassed: boolean;
  overallReady: boolean;
  details: Record<string, string>;
}

export interface PresentXExportQualityCertificate {
  certificateId: string;
  projectId: string;
  projectTitle: string;
  projectHash: string;
  presentationHash: string;
  slideCount: number;
  creativeQuality: number;
  trustQuality: number;
  technicalIntegrity: number;
  accessibilityScore: number;
  exportScore: number;
  decision: QualityDirectorDecision;
  repairCyclesCount: number;
  modelsUsed: string[];
  enginesUsed: string[];
  verifiedClaimsCount: number;
  unverifiedClaimsCount: number;
  warnings: string[];
  roundtripResult: "PERFECT" | "LOSS_DETECTED" | "FAILED";
  roundtripLossPercentage: number;
  exportFormat: "PPTX" | "PDF" | "HTML" | "JSON";
  timestamp: string;
  signature: string;
}

export interface ExportQualityDirectorResult {
  success: boolean;
  decision: QualityDirectorDecision;
  certificate: PresentXExportQualityCertificate;
  preflightReport: ExportPreflightReport;
  defects: QualityDefect[];
  unresolvedDefects: QualityDefect[];
  repairHistory: QualityRepairCycleRecord[];
  dimensionScores: Record<string, SlideQualityDimensionScore>;
  visualInspections: VisualInspectionResult[];
  multiModelReview: MultiModelReviewResult;
  repairedProject: PresentationProject;
  exportBuffer?: Uint8Array;
}

