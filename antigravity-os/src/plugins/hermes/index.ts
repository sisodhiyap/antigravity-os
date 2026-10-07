/**
 * ANTIGRAVITY OS v7.0 — HERMES AGENT PLUGIN
 * index.ts: Public export barrel & PluginAdapterManager registration
 */

import { PluginAdapterManager } from "../PluginAdapterManager";

export * from "./HermesTypes";
export * from "./HermesPolicy";
export * from "./HermesPermissionManager";
export * from "./HermesMemory";
export * from "./HermesModelRouter";
export * from "./HermesToolRegistry";
export * from "./HermesMCPBridge";
export * from "./HermesRealityBridge";
export * from "./HermesEvidenceBridge";
export * from "./HermesCheckpointManager";
export * from "./HermesRollbackManager";
export * from "./HermesTaskGraph";
export * from "./HermesCritic";
export * from "./HermesPlanner";
export * from "./HermesExecutor";
export * from "./HermesApprovalGate";
export * from "./HermesSessionManager";
export * from "./HermesObservability";
export * from "./HermesAgent";

// Register Hermes Plugin with V7 PluginAdapterManager above frozen core
PluginAdapterManager.getInstance().registerPlugin({
  pluginId: "plugin_hermes_autonomous_agent",
  name: "Hermes Autonomous Engineering Agent",
  version: "1.0.0-HERMES-V7",
  category: "TESTING_ADAPTER",
  isSandboxed: true,
  securityAudited: true,
  realityTested: true,
  ownerApproved: false, // Level 5 Owner Gate initially pending
  status: "SANDBOXED"
});
