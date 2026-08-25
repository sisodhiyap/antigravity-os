/**
 * ANTIGRAVITY LEVEL-4 — PRODUCTION FACTORY & DEPLOYMENT VALIDATION
 *
 * Tests the complete Level-4 production infrastructure:
 * 1. Release State Machine (19 strict states, rejection of illegal transitions)
 * 2. Secret Redaction & Credential Governance
 * 3. Artifact Integrity & SHA-256 Manifest Hashing
 * 4. Local Staging Deployment Pipeline
 * 5. Production Approval Gate (Mandatory Human Operator Gate)
 * 6. Production Deployment Promotion & Smoke Verification
 * 7. Automated Rollback Orchestration & Audit Persistence
 * 8. Multi-Subsystem Health Check Engine
 * 9. Production Alert Engine & Dispatching
 */
import fs from "fs";
import path from "path";
import { releaseStateMachine } from "../src/server/deployment/release-state-machine";
import { deploymentOrchestrator } from "../src/server/deployment/deployment-orchestrator";
import { rollbackOrchestrator } from "../src/server/deployment/rollback-orchestrator";
import { secretRedactor } from "../src/server/security/secret-redactor";
import { artifactIntegrity } from "../src/server/security/artifact-integrity";
import { healthCheckEngine } from "../src/server/health/health-check-engine";
import { alertEngine } from "../src/server/alerts/alert-engine";

const EVIDENCE_DIR = path.resolve(process.cwd(), "artifacts", "level4");

interface TestResult {
  testNumber: number;
  name: string;
  passed: boolean;
  durationMs: number;
  details: string;
}

const results: TestResult[] = [];
let passedCount = 0;
let failedCount = 0;

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function record(testNumber: number, name: string, passed: boolean, durationMs: number, details: string) {
  results.push({ testNumber, name, passed, durationMs, details });
  const icon = passed ? "✅ [PASS]" : "❌ [FAIL]";
  console.log(`  ${icon} Test ${testNumber}: ${name} (${durationMs}ms)`);
  console.log(`     ${details}`);
  if (passed) passedCount++;
  else failedCount++;
}

async function main() {
  ensureDir(EVIDENCE_DIR);

  console.log("==================================================================");
  console.log("🚀 ANTIGRAVITY LEVEL-4 — PRODUCTION DEPLOYMENT & GOVERNANCE SUITE");
  console.log("==================================================================\n");

  // -----------------------------------------------------------------------
  // TEST 1: Release State Machine — Normal Path Transitions
  // -----------------------------------------------------------------------
  console.log("1. Release State Machine Transitions");
  {
    const start = performance.now();
    const rel = releaseStateMachine.createRelease({
      projectId: "proj_l4_test",
      workspaceId: "ws_l4_test",
      version: "1.0.0",
      environment: "staging",
    });

    let ok = rel.state === "DRAFT";
    releaseStateMachine.transition(rel.releaseId, "PLANNED", "ARCHITECT", "Sprint plan");
    ok = ok && releaseStateMachine.getRelease(rel.releaseId)?.state === "PLANNED";
    releaseStateMachine.transition(rel.releaseId, "BUILDING", "BUILDER", "Sandbox build");
    ok = ok && releaseStateMachine.getRelease(rel.releaseId)?.state === "BUILDING";

    const duration = Math.round(performance.now() - start);
    record(1, "Release State Machine Valid Transitions", ok, duration, "DRAFT -> PLANNED -> BUILDING transitioned successfully with audit history");
  }

  // -----------------------------------------------------------------------
  // TEST 2: Release State Machine — Illegal Transition Rejection
  // -----------------------------------------------------------------------
  console.log("\n2. Rejection of Illegal State Transitions");
  {
    const start = performance.now();
    const rel = releaseStateMachine.createRelease({
      projectId: "proj_illegal_test",
      workspaceId: "ws_illegal_test",
      version: "1.0.0",
    });

    let illegalBlocked = false;
    try {
      // Direct jump from DRAFT to RELEASED is illegal
      releaseStateMachine.transition(rel.releaseId, "RELEASED", "ATTACKER", "Bypass all gates");
    } catch (err: any) {
      illegalBlocked = err.message.includes("Illegal release state transition");
    }

    const duration = Math.round(performance.now() - start);
    record(2, "Illegal State Transition Blocked", illegalBlocked, duration, "Direct jump DRAFT -> RELEASED correctly rejected by state machine guard");
  }

  // -----------------------------------------------------------------------
  // TEST 3: Secret Redactor — String Redaction
  // -----------------------------------------------------------------------
  console.log("\n3. Secret Redaction — Sensitive Strings");
  {
    const start = performance.now();
    const sensitiveString = "Error connecting with sk-proj-1234567890123456789012345678901234567890123456 and token ghp_123456789012345678901234567890123456";
    const redacted = secretRedactor.redactString(sensitiveString);

    const hasRedactedOpenAI = redacted.includes("[REDACTED_OPENAI_KEY]");
    const hasRedactedGithub = redacted.includes("[REDACTED_GITHUB_TOKEN]");
    const noRawSecret = !redacted.includes("sk-proj-") && !redacted.includes("ghp_");

    const ok = hasRedactedOpenAI && hasRedactedGithub && noRawSecret;
    const duration = Math.round(performance.now() - start);
    record(3, "Secret Redactor String Sanitization", ok, duration, "API keys and GitHub tokens successfully replaced with redaction tags");
  }

  // -----------------------------------------------------------------------
  // TEST 4: Secret Redactor — Deep Object Redaction
  // -----------------------------------------------------------------------
  console.log("\n4. Secret Redactor — Deep Nested Object Redaction");
  {
    const start = performance.now();
    const payload = {
      user: "operator",
      config: {
        apiKey: "sk-proj-9999999999999999999999999999999999999999999999",
        databasePassword: "SuperSecretPassword123!",
        nested: {
          token: "Bearer secret-auth-token-1234567890",
        },
      },
    };

    const redacted = secretRedactor.redactObject(payload);
    const ok =
      redacted.config.apiKey === "[REDACTED]" &&
      redacted.config.databasePassword === "[REDACTED]" &&
      redacted.config.nested.token === "[REDACTED]";

    const duration = Math.round(performance.now() - start);
    record(4, "Secret Redactor Deep Object Sanitization", ok, duration, "Nested password, apiKey, and token fields recursively redacted in object graph");
  }

  // -----------------------------------------------------------------------
  // TEST 5: Artifact Integrity — SHA-256 Hashing & Manifest Generation
  // -----------------------------------------------------------------------
  console.log("\n5. Artifact Integrity & SHA-256 Hashing");
  {
    const start = performance.now();
    const testArtifacts = [
      {
        id: "art_1",
        name: "architecture.json",
        category: "ARCHITECTURE",
        version: 1,
        content: { controlPlane: "Kernel v4.0", router: "CentralAIRouter" },
        agentRole: "ARCHITECT",
        createdAt: new Date().toISOString(),
      },
      {
        id: "art_2",
        name: "security-audit.json",
        category: "SECURITY",
        version: 1,
        content: { score: 100, criticalFindings: 0 },
        agentRole: "SECURITY_ENGINEER",
        createdAt: new Date().toISOString(),
      },
    ];

    const manifest = artifactIntegrity.generateReleaseManifest(
      "rel_test_manifest",
      "proj_test",
      "ws_test",
      "staging",
      testArtifacts
    );

    const hash1 = manifest.artifacts[0].sha256;
    const verified = artifactIntegrity.verifyArtifact(testArtifacts[0].content, hash1);
    const tampered = artifactIntegrity.verifyArtifact({ controlPlane: "TAMPERED" }, hash1);

    const ok = manifest.integrityVerified && verified && !tampered && manifest.manifestHash.length === 64;
    const duration = Math.round(performance.now() - start);
    record(5, "Artifact Integrity & SHA-256 Manifest Verification", ok, duration, `Manifest hash computed (${manifest.manifestHash.substring(0, 16)}...), tamper detection verified`);
  }

  // -----------------------------------------------------------------------
  // TEST 6: Staging Pipeline Execution (DRAFT -> STAGING_VALIDATED -> APPROVAL_PENDING)
  // -----------------------------------------------------------------------
  console.log("\n6. Autonomous Staging Pipeline Execution");
  {
    const start = performance.now();
    const stagingRun = await deploymentOrchestrator.executeStagingPipeline({
      projectId: "proj_saas_staging",
      workspaceId: "ws_staging_test",
      version: "2.1.0",
      providerName: "local_staging",
    });

    const ok =
      stagingRun.state === "APPROVAL_PENDING" &&
      stagingRun.stagingHealthPassed === true &&
      stagingRun.approvalRequired === true &&
      stagingRun.stagingUrl === "http://localhost:3000";

    const duration = Math.round(performance.now() - start);
    record(6, "Staging Deployment Pipeline & Health Check", ok, duration, `Deployed to ${stagingRun.stagingUrl}, health check PASS, transitioned to APPROVAL_PENDING`);
  }

  // -----------------------------------------------------------------------
  // TEST 7: Production Approval Gate (Operator Approval -> Production Deploy)
  // -----------------------------------------------------------------------
  console.log("\n7. Production Approval Gate & Promotion");
  {
    const start = performance.now();
    // Create staging release first
    const stagingRun = await deploymentOrchestrator.executeStagingPipeline({
      projectId: "proj_prod_promo",
      workspaceId: "ws_prod_test",
      version: "3.0.0",
      providerName: "local_staging",
    });

    // Operator promotes to production
    const prodRun = await deploymentOrchestrator.promoteToProduction(
      stagingRun.releaseId,
      "SecOps Lead",
      "APPROVED"
    );

    const ok =
      prodRun.state === "RELEASED" &&
      prodRun.productionHealthPassed === true &&
      prodRun.productionUrl === "http://localhost:3000";

    const duration = Math.round(performance.now() - start);
    record(7, "Production Promotion After Operator Approval", ok, duration, `Release ${stagingRun.releaseId} promoted to RELEASED state with production health check verified`);
  }

  // -----------------------------------------------------------------------
  // TEST 8: Automated Rollback Orchestration
  // -----------------------------------------------------------------------
  console.log("\n8. Automated Rollback Orchestration");
  {
    const start = performance.now();
    const stagingRun = await deploymentOrchestrator.executeStagingPipeline({
      projectId: "proj_rollback_test",
      workspaceId: "ws_rb_test",
      version: "1.5.0",
    });

    const rollbackResult = await rollbackOrchestrator.executeRollback({
      releaseId: stagingRun.releaseId,
      triggerReason: "HEALTH_CHECK_FAILURE",
      details: "Simulated post-deployment 500 error on /api/health",
      actor: "AUTOMATED_WATCHDOG",
    });

    const release = releaseStateMachine.getRelease(stagingRun.releaseId);
    const ok =
      rollbackResult.success === true &&
      release?.state === "ROLLED_BACK" &&
      rollbackResult.auditRecord.newState === "ROLLED_BACK";

    const duration = Math.round(performance.now() - start);
    record(8, "Automated Bounded Rollback on Failure", ok, duration, `Rollback executed in ${rollbackResult.durationMs}ms, release transitioned to ROLLED_BACK with audit record`);
  }

  // -----------------------------------------------------------------------
  // TEST 9: Health Check Engine — Multi-Subsystem Diagnostics
  // -----------------------------------------------------------------------
  console.log("\n9. Production Health Check Engine");
  {
    const start = performance.now();
    const health = await healthCheckEngine.getComprehensiveHealth();

    const ok =
      health.status === "HEALTHY" &&
      health.components.database.status === "HEALTHY" &&
      health.components.aiRouter.status === "HEALTHY" &&
      health.components.memoryEngine.status === "HEALTHY" &&
      health.version === "4.0.0";

    const duration = Math.round(performance.now() - start);
    record(9, "Multi-Subsystem Health Check Engine", ok, duration, `Health evaluated: status=${health.status}, DB=${health.components.database.status}, AI=${health.components.aiRouter.status}`);
  }

  // -----------------------------------------------------------------------
  // TEST 10: Production Alert Engine
  // -----------------------------------------------------------------------
  console.log("\n10. Production Alert Engine");
  {
    const start = performance.now();
    const alert = alertEngine.dispatchAlert({
      severity: "CRITICAL",
      category: "ROLLBACK_TRIGGERED",
      summary: "Rollback executed for release rel_123",
      details: "Health check failed with error connecting to api key sk-proj-1234567890123456789012345678901234567890123456",
    });

    const isRedacted = !alert.details.includes("sk-proj-");
    const ackSuccess = alertEngine.acknowledgeAlert(alert.alertId);
    const active = alertEngine.getActiveAlerts();

    const ok = alert.severity === "CRITICAL" && isRedacted && ackSuccess && active.length > 0;
    const duration = Math.round(performance.now() - start);
    record(10, "Production Alert Engine & Redaction", ok, duration, `Alert dispatched with sanitized details (${alert.alertId}), acknowledged=${ackSuccess}`);
  }

  // -----------------------------------------------------------------------
  // Save Level 4 Evidence Report
  // -----------------------------------------------------------------------
  const report = {
    suite: "ANTIGRAVITY LEVEL-4 PRODUCTION DEPLOYMENT & GOVERNANCE VALIDATION",
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    passedCount,
    failedCount,
    allPassed: failedCount === 0,
    results,
  };

  fs.writeFileSync(
    path.join(EVIDENCE_DIR, "deployment-governance-report.json"),
    JSON.stringify(report, null, 2),
    "utf-8"
  );

  console.log("\n==================================================================");
  console.log(`📊 LEVEL-4 VALIDATION SUMMARY: ${passedCount}/${results.length} TESTS PASSED`);
  console.log(`📁 Evidence: artifacts/level4/deployment-governance-report.json`);
  console.log("==================================================================");

  if (failedCount > 0) process.exit(1);
  process.exit(0);
}

main().catch((err) => {
  console.error("Level-4 deployment validation crashed:", err);
  process.exit(1);
});
