/**
 * ANTIGRAVITY OS — SOVEREIGN SELF-SUSTAINING AI FABRIC
 * updates/types.ts: Data contracts for Upstream Update Monitoring, Staged Verification Pipeline,
 * Safe Rollbacks, and Multi-Channel Auto-Update Policies across the 10 Engines.
 */

import { FabricEngineId } from "../types";

export type UpdateChannel = "STABLE" | "PREVIEW" | "MANUAL";

export type UpdateTestStatus =
  | "PENDING"
  | "STAGED"
  | "TESTING"
  | "PASSED"
  | "FAILED"
  | "ACTIVE"
  | "ROLLED_BACK";

export interface EngineUpdateRecord {
  engineId: FabricEngineId;
  name: string;
  currentVersion: string;
  currentCommit: string;
  latestVersion: string;
  latestCommit: string;
  releaseDate: string;
  changelog: string;
  licenseChanged: boolean;
  newLicenseSpdx?: string;
  breakingChanges: boolean;
  securityAdvisories: string[];
  downloadSizeMb: number;
  testStatus: UpdateTestStatus;
  canAutoActivate: boolean;
  lastTestedTimestamp?: string;
  rollbackSnapshotId?: string;
  testFailureReason?: string;
}

export interface UpdatePolicyConfig {
  channel: UpdateChannel;
  checkFrequency: "DAILY" | "WEEKLY" | "MANUAL";
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string; // "06:00"
  };
  autoActivateLowRisk: boolean;
  bandwidthLimitMbps: number;
  maxRetries: number;
}

export interface UpdateManifest {
  manifestId: string;
  engineId: FabricEngineId;
  fromVersion: string;
  toVersion: string;
  fromCommit: string;
  toCommit: string;
  testedAt: string;
  signature: string;
  gatesPassed: number;
  rollbackSnapshotId: string;
}
