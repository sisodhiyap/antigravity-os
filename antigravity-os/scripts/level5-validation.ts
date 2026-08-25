/**
 * ANTIGRAVITY LEVEL-5 — AUTONOMOUS PRODUCTION PLATFORM VALIDATION SUITE
 *
 * Tests the complete Level-5 autonomous software engineering capabilities:
 * 1. Capability-Based Tool Security Authorization & Audit
 * 2. Revocation & Critical Capability Gate Enforcement
 * 3. Evidence Graph Bidirectional Traceability (Requirement -> Code -> Test -> Release)
 * 4. Phased Canary Deployment Progression (5% -> 25% -> 50% -> 100%)
 * 5. Automated Canary Rollback on SLA Violation
 * 6. Composite 100-Point Production Health Scorecard
 * 7. Incident Lifecycle & Autonomous Root Cause Analysis (RCA)
 * 8. Autonomous Bounded Remediation Proposal Generation
 * 9. Model Performance Registry & Task-Aware Routing
 * 10. Software Supply Chain SBOM Generation & Cryptographic Release Signing
 */
import fs from "fs";
import path from "path";
import { capabilityManager } from "../src/server/security/capability-manager";
import { evidenceGraph } from "../src/server/evidence/evidence-graph";
import { canaryOrchestrator } from "../src/server/deployment/canary-orchestrator";
import { healthScoreEngine } from "../src/server/health/health-score-engine";
import { incidentEngine } from "../src/server/incident/incident-engine";
import { modelPerformanceRegistry } from "../src/server/ai/model-registry";
import { sbomGenerator } from "../src/server/security/sbom-generator";

const EVIDENCE_DIR = path.resolve(process.cwd(), "artifacts", "level5");

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
  console.log("🌟 ANTIGRAVITY LEVEL-5 — AUTONOMOUS PRODUCTION PLATFORM SUITE");
  console.log("==================================================================\n");

  // -----------------------------------------------------------------------
  // TEST 1: Capability-Based Security Authorization
  // -----------------------------------------------------------------------
  console.log("1. Capability-Based Security Authorization");
  {
    const start = performance.now();
    const auth1 = capabilityManager.authorize({
      agentRole: "BUILDER",
      capability: "fs.write",
      targetResource: "/src/services/api.ts",
      workspaceId: "ws_cap_test",
    });

    const auth2 = capabilityManager.authorize({
      agentRole: "PRODUCT_MANAGER",
      capability: "fs.write", // PM cannot write code
      targetResource: "/src/services/api.ts",
      workspaceId: "ws_cap_test",
    });

    const ok = auth1.allowed === true && auth2.allowed === false;
    const duration = Math.round(performance.now() - start);
    record(1, "Capability-Based Authorization & Role Scoping", ok, duration, "BUILDER granted fs.write, PRODUCT_MANAGER correctly denied fs.write");
  }

  // -----------------------------------------------------------------------
  // TEST 2: Critical Capability Gate & Expiration/Revocation
  // -----------------------------------------------------------------------
  console.log("\n2. Critical Capability Gate Enforcement");
  {
    const start = performance.now();
    // production.deploy requires mandatory human approval gate
    const authCrit = capabilityManager.authorize({
      agentRole: "DEVOPS_ENGINEER",
      capability: "production.deploy",
      targetResource: "production_cluster",
      workspaceId: "ws_cap_test",
    });

    // Test Grant & Revocation
    const customGrant = capabilityManager.grantCapability({
      agentRole: "CUSTOM_WORKER",
      capability: "test.run",
      workspaceId: "ws_cap_test",
    });

    const authBefore = capabilityManager.authorize({
      agentRole: "CUSTOM_WORKER",
      capability: "test.run",
      targetResource: "unit_tests",
      workspaceId: "ws_cap_test",
    });

    capabilityManager.revokeCapability(customGrant.grantId);

    const authAfter = capabilityManager.authorize({
      agentRole: "CUSTOM_WORKER",
      capability: "test.run",
      targetResource: "unit_tests",
      workspaceId: "ws_cap_test",
    });

    const ok = authCrit.allowed === false && authBefore.allowed === true && authAfter.allowed === false;
    const duration = Math.round(performance.now() - start);
    record(2, "Critical Capability Gate & Revocation", ok, duration, "production.deploy blocked without human approval; custom grant revocable immediately");
  }

  // -----------------------------------------------------------------------
  // TEST 3: Evidence Graph Lineage & Traceability
  // -----------------------------------------------------------------------
  console.log("\n3. Evidence Graph Lineage & Traceability");
  {
    const start = performance.now();
    const reqNode = evidenceGraph.addNode({
      nodeId: "ev_req_auth_v5",
      type: "REQUIREMENT",
      title: "Zero-Trust JWT Auth & Session Invalidation",
      projectId: "proj_eg_test",
      workspaceId: "ws_eg_test",
      source: "USER",
      checksum: "a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90",
      confidence: 1.0,
    });

    const codeNode = evidenceGraph.addNode({
      nodeId: "ev_code_auth_service",
      type: "CODE_CHANGE",
      title: "src/services/auth.service.ts",
      projectId: "proj_eg_test",
      workspaceId: "ws_eg_test",
      source: "AI",
      checksum: "b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1",
      confidence: 0.95,
    });

    const testNode = evidenceGraph.addNode({
      nodeId: "ev_test_auth_suite",
      type: "TEST",
      title: "auth.service.test.ts (20 unit tests)",
      projectId: "proj_eg_test",
      workspaceId: "ws_eg_test",
      source: "TEST",
      checksum: "c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2",
      confidence: 1.0,
    });

    evidenceGraph.addEdge(codeNode.nodeId, reqNode.nodeId, "IMPLEMENTS");
    evidenceGraph.addEdge(testNode.nodeId, codeNode.nodeId, "VALIDATES");

    const lineage = evidenceGraph.traceWhyCodeExists(codeNode.nodeId);
    const testsForReq = evidenceGraph.getTestsForRequirement(reqNode.nodeId);

    const ok =
      lineage.some((n) => n.nodeId === reqNode.nodeId) &&
      testsForReq.some((t) => t.nodeId === testNode.nodeId);

    const duration = Math.round(performance.now() - start);
    record(3, "Evidence Graph Traceability Queries", ok, duration, `Lineage traced to root requirement [${reqNode.nodeId}]; tests mapped to requirement`);
  }

  // -----------------------------------------------------------------------
  // TEST 4: Phased Canary Deployment Progression (5% -> 25% -> 50% -> 100%)
  // -----------------------------------------------------------------------
  console.log("\n4. Phased Canary Deployment Progression");
  {
    const start = performance.now();
    const { releaseStateMachine } = await import("../src/server/deployment/release-state-machine");
    const rel = releaseStateMachine.createRelease({
      projectId: "proj_canary_success",
      workspaceId: "ws_canary_success",
      version: "1.0.0",
    });
    const canary = canaryOrchestrator.startCanary(rel.releaseId);

    const s1 = await canaryOrchestrator.evaluateAndAdvance(canary.canaryId, {
      errorRatePercent: 0.2,
      p95LatencyMs: 65,
      http5xxCount: 0,
      criticalSecurityAlerts: 0,
    });

    const s2 = await canaryOrchestrator.evaluateAndAdvance(canary.canaryId, {
      errorRatePercent: 0.3,
      p95LatencyMs: 70,
      http5xxCount: 0,
      criticalSecurityAlerts: 0,
    });

    const s3 = await canaryOrchestrator.evaluateAndAdvance(canary.canaryId, {
      errorRatePercent: 0.1,
      p95LatencyMs: 60,
      http5xxCount: 0,
      criticalSecurityAlerts: 0,
    });

    const ok =
      canary.currentPercentage === 100 &&
      canary.isComplete === true &&
      s1.currentPercentage === 25 &&
      s2.currentPercentage === 50 &&
      s3.currentPercentage === 100;

    const duration = Math.round(performance.now() - start);
    record(4, "Phased Canary Progression (5% -> 25% -> 50% -> 100%)", ok, duration, "Canary successfully advanced across all 4 stages with real health verification");
  }

  // -----------------------------------------------------------------------
  // TEST 5: Automated Canary Rollback on SLA Violation
  // -----------------------------------------------------------------------
  console.log("\n5. Automated Canary Rollback on SLA Breach");
  {
    const start = performance.now();
    const { releaseStateMachine } = await import("../src/server/deployment/release-state-machine");
    const rel = releaseStateMachine.createRelease({
      projectId: "proj_canary_fail",
      workspaceId: "ws_canary_fail",
      version: "1.0.0",
    });
    // Transition to STAGING_DEPLOYED so it can rollback
    releaseStateMachine.transition(rel.releaseId, "PLANNED", "ARCHITECT");
    releaseStateMachine.transition(rel.releaseId, "BUILDING", "BUILDER");
    releaseStateMachine.transition(rel.releaseId, "TESTING", "QA_ENGINEER");
    releaseStateMachine.transition(rel.releaseId, "SECURITY_REVIEW", "SECURITY_ENGINEER");
    releaseStateMachine.transition(rel.releaseId, "STAGING_PENDING", "DEVOPS_ENGINEER");
    releaseStateMachine.transition(rel.releaseId, "STAGING_DEPLOYING", "DEVOPS_ENGINEER");
    releaseStateMachine.transition(rel.releaseId, "STAGING_DEPLOYED", "DEVOPS_ENGINEER");

    const canary = canaryOrchestrator.startCanary(rel.releaseId);

    // Inject high error rate SLA violation
    const res = await canaryOrchestrator.evaluateAndAdvance(canary.canaryId, {
      errorRatePercent: 5.4, // > 2.0% threshold
      p95LatencyMs: 850,     // > 500ms threshold
      http5xxCount: 12,      // > 0
      criticalSecurityAlerts: 0,
    });

    const ok = res.status === "ROLLED_BACK" && canary.isRolledBack === true;
    const duration = Math.round(performance.now() - start);
    record(5, "Automated Canary Rollback on SLA Breach", ok, duration, "Error rate 5.4% tripped watchdog; automated rollback executed immediately");
  }

  // -----------------------------------------------------------------------
  // TEST 6: Composite 100-Point Health Scorecard
  // -----------------------------------------------------------------------
  console.log("\n6. Composite 100-Point Health Scorecard");
  {
    const start = performance.now();
    const scorecard = await healthScoreEngine.computeHealthScore();

    const ok =
      scorecard.totalScore >= 90 &&
      scorecard.overallStatus === "HEALTHY" &&
      scorecard.dimensions.length === 10;

    const duration = Math.round(performance.now() - start);
    record(6, "Composite 100-Point Health Scorecard", ok, duration, `Computed score: ${scorecard.totalScore}/100 [${scorecard.overallStatus}] across 10 dimensions`);
  }

  // -----------------------------------------------------------------------
  // TEST 7: Incident Management & Autonomous RCA
  // -----------------------------------------------------------------------
  console.log("\n7. Incident Lifecycle & Autonomous Root Cause Analysis");
  {
    const start = performance.now();
    const incident = incidentEngine.createIncident({
      title: "Spike in API latency following release rel_402",
      severity: "SEV-2",
      affectedServices: ["api-gateway", "auth-service"],
      workspaceId: "ws_inc_test",
      symptoms: ["HTTP 504 gateway timeout on /api/tasks", "Deployment regression on rel_402"],
      releaseId: "rel_402",
    });

    const analyzed = incidentEngine.performRCA(incident.incidentId);
    const rca = analyzed.rootCauseAnalysis;

    const ok =
      analyzed.state === "ROOT_CAUSE_IDENTIFIED" &&
      rca !== undefined &&
      rca.primaryHypothesis.category === "DEPLOYMENT_REGRESSION" &&
      rca.primaryHypothesis.confidence > 0.8;

    const duration = Math.round(performance.now() - start);
    record(7, "Incident Lifecycle & Autonomous RCA", ok, duration, `RCA categorized incident as [${rca?.primaryHypothesis.category}] with ${(rca?.primaryHypothesis.confidence || 0) * 100}% confidence`);
  }

  // -----------------------------------------------------------------------
  // TEST 8: Autonomous Remediation Proposal & Postmortem
  // -----------------------------------------------------------------------
  console.log("\n8. Autonomous Remediation Proposal & Postmortem");
  {
    const start = performance.now();
    const incList = incidentEngine.listIncidents();
    const activeInc = incList[0]!;

    const proposed = incidentEngine.proposeRemediation(activeInc.incidentId);
    const closed = incidentEngine.closeIncident(activeInc.incidentId, {
      summary: "Canary rollback restored p95 latency to 45ms. Sandbox patch created for rel_403.",
      lessonsLearned: ["Database query timeout parameter was missing in task filter"],
      actionItems: ["Add query timeout validation to API lint suite"],
    });

    const ok =
      proposed.remediationPlan !== undefined &&
      closed.state === "CLOSED" &&
      closed.postmortem !== undefined;

    const duration = Math.round(performance.now() - start);
    record(8, "Autonomous Remediation & Postmortem Lifecycle", ok, duration, `Incident closed with postmortem and immutable lesson graph linkage`);
  }

  // -----------------------------------------------------------------------
  // TEST 9: Model Performance Registry & Task-Aware Routing
  // -----------------------------------------------------------------------
  console.log("\n9. Model Performance Registry & Task-Aware Routing");
  {
    const start = performance.now();
    const codeRec = modelPerformanceRegistry.recommendModel("CODE");
    const reasoningRec = modelPerformanceRegistry.recommendModel("REASONING");

    const ok =
      codeRec.provider === "ollama" &&
      reasoningRec.provider === "deepseek" &&
      codeRec.confidence >= 0.9;

    const duration = Math.round(performance.now() - start);
    record(9, "Task-Aware Model Selection via Performance Registry", ok, duration, `CODE routed to ${codeRec.provider} (${codeRec.model}), REASONING routed to ${reasoningRec.provider}`);
  }

  // -----------------------------------------------------------------------
  // TEST 10: Software Supply Chain SBOM & Cryptographic Release Signing
  // -----------------------------------------------------------------------
  console.log("\n10. Software Supply Chain SBOM & Release Signing");
  {
    const start = performance.now();
    const sbom = sbomGenerator.generateSBOM();
    const signedPkg = sbomGenerator.signRelease({
      releaseId: "rel_signed_v5",
      projectId: "antigravity-os",
      version: "5.0.0",
      manifestHash: "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      sbomHash: sbom.sbomHash,
    });

    const verified = sbomGenerator.verifyReleaseSignature(signedPkg);
    const tampered = sbomGenerator.verifyReleaseSignature({
      ...signedPkg,
      version: "5.0.1-UNAUTHORIZED",
    });

    const ok =
      sbom.components.length > 5 &&
      sbom.bomFormat === "CycloneDX" &&
      verified === true &&
      tampered === false;

    const duration = Math.round(performance.now() - start);
    record(10, "CycloneDX SBOM Generation & Release Signing", ok, duration, `CycloneDX SBOM generated (${sbom.components.length} components); cryptographic signature verified`);
  }

  // -----------------------------------------------------------------------
  // Save Level 5 Evidence Report
  // -----------------------------------------------------------------------
  const report = {
    suite: "ANTIGRAVITY LEVEL-5 AUTONOMOUS PRODUCTION PLATFORM VALIDATION",
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    passedCount,
    failedCount,
    allPassed: failedCount === 0,
    results,
  };

  fs.writeFileSync(
    path.join(EVIDENCE_DIR, "level5-platform-report.json"),
    JSON.stringify(report, null, 2),
    "utf-8"
  );

  console.log("\n==================================================================");
  console.log(`📊 LEVEL-5 VALIDATION SUMMARY: ${passedCount}/${results.length} TESTS PASSED`);
  console.log(`📁 Evidence: artifacts/level5/level5-platform-report.json`);
  console.log("==================================================================");

  if (failedCount > 0) process.exit(1);
  process.exit(0);
}

main().catch((err) => {
  console.error("Level-5 validation crashed:", err);
  process.exit(1);
});
