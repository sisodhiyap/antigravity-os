/**
 * ANTIGRAVITY OS v7.0 — FINAL PRODUCT RELEASE & LONG-TERM GOVERNANCE
 * index.ts: Barrel export & PluginAdapterManager registration
 */

import { PluginAdapterManager } from "../PluginAdapterManager";

export * from "./GovernanceTypes";
export * from "./RuntimeHealthPlane";
export * from "./CapabilityRealityRegistry";
export * from "./ProjectLifecycleManager";
export * from "./OwnerApprovalCenter";
export * from "./BackupRestoreEngine";
export * from "./CommandCenterUI";

// Register Governance Subsystem with PluginAdapterManager above frozen core
PluginAdapterManager.getInstance().registerPlugin({
  pluginId: "plugin_v7_release_governance",
  name: "Antigravity OS V7.0 Release Governance & Runtime Observability Plane",
  version: "7.0.0-PROD",
  category: "INTEGRATION_ADAPTER",
  isSandboxed: true,
  securityAudited: true,
  realityTested: true,
  ownerApproved: true,
  status: "ACTIVE"
});
