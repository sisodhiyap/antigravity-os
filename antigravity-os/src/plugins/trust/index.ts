/**
 * ANTIGRAVITY OS v7.0 — FACT-BASED INTELLIGENCE + SECURITY FABRIC
 * index.ts: Module export barrel and PluginAdapterManager registration
 */

import { PluginAdapterManager } from "../PluginAdapterManager";

export * from "./TrustTypes";
export * from "./ClaimRegistry";
export * from "./EvidenceGraph";
export * from "./SourceTrustEngine";
export * from "./FreshnessEngine";
export * from "./ContradictionEngine";
export * from "./MultiModelChecker";
export * from "./CodeRealityVerifier";
export * from "./CapabilityRegistry";
export * from "./SecurityGuards";
export * from "./TrustPolicyEngine";
export * from "./MemorySafetyEngine";
export * from "./TrustFabric";
export * from "./TrustUIComponents";

// Register Trust Fabric Plugin with V7 PluginAdapterManager above frozen core
PluginAdapterManager.getInstance().registerPlugin({
  pluginId: "plugin_trust_security_fabric",
  name: "Fact-Based Intelligence & Security Fabric",
  version: "1.0.0-TRUST-V7",
  category: "TESTING_ADAPTER",
  isSandboxed: true,
  securityAudited: true,
  realityTested: true,
  ownerApproved: true,
  status: "ACTIVE"
});
