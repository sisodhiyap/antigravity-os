/**
 * ANTIGRAVITY PRODUCTION DEPLOYMENT & RELEASE TYPES
 */

export type ReleaseState =
  | "DRAFT"
  | "PLANNED"
  | "BUILDING"
  | "TESTING"
  | "SECURITY_REVIEW"
  | "STAGING_PENDING"
  | "STAGING_DEPLOYING"
  | "STAGING_DEPLOYED"
  | "STAGING_VALIDATED"
  | "APPROVAL_PENDING"
  | "APPROVED"
  | "PRODUCTION_DEPLOYING"
  | "PRODUCTION_HEALTH_CHECK"
  | "PRODUCTION_VALIDATED"
  | "RELEASED"
  | "ROLLBACK_PENDING"
  | "ROLLING_BACK"
  | "ROLLED_BACK"
  | "FAILED"
  | "CANCELLED";

export interface ReleaseStateTransition {
  fromState: ReleaseState;
  toState: ReleaseState;
  timestamp: string;
  actor: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export interface ReleaseRecord {
  releaseId: string;
  projectId: string;
  workspaceId: string;
  version: string;
  state: ReleaseState;
  environment: "staging" | "production";
  provider: "vercel" | "netlify" | "local_staging";
  targetUrl?: string;
  stagingUrl?: string;
  productionUrl?: string;
  deployedCommit?: string;
  transitions: ReleaseStateTransition[];
  createdAt: string;
  updatedAt: string;
  rollbackReleaseId?: string;
  approvalId?: string;
  healthStatus?: "HEALTHY" | "DEGRADED" | "UNHEALTHY";
  manifestHash?: string;
}

export interface IDeploymentProvider {
  name: string;
  validateCredentials(): Promise<{ valid: boolean; reason?: string }>;
  deploy(options: {
    releaseId: string;
    projectId: string;
    workspaceId: string;
    environment: "staging" | "production";
    buildArtifactPath?: string;
  }): Promise<{
    deploymentId: string;
    url: string;
    status: "READY" | "BUILDING" | "ERROR";
    createdAt: string;
  }>;
  getDeploymentStatus(deploymentId: string): Promise<{
    status: "READY" | "BUILDING" | "ERROR" | "CANCELLED";
    url?: string;
    error?: string;
  }>;
  rollback(previousDeploymentId: string): Promise<{
    success: boolean;
    rollbackDeploymentId: string;
    targetUrl: string;
  }>;
}
