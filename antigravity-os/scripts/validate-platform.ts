import { env } from "../src/config/env";
import { quotaEngine } from "../src/server/ai/quota";
import { toolRegistry } from "../src/server/tools/registry";
import { memoryEngine } from "../src/server/memory/memory-engine";
import { agentSwarm } from "../src/server/swarm/agent-swarm";
import { taskOrchestrator } from "../src/server/orchestrator/task-orchestrator";
import { policyEngine } from "../src/server/policy/policy-engine";
import { artifactSystem } from "../src/server/artifacts/artifact-system";
import { sandboxManager } from "../src/server/sandbox/sandbox-manager";
import { codingLoop } from "../src/server/coding-loop/coding-loop";
import { browserQA } from "../src/server/browser-qa/browser-qa-engine";
import { securityValidator } from "../src/server/security/security-validator";
import { benchmarkRunner } from "../src/server/benchmark/benchmark-runner";

async function runTestSuite() {
  console.log("==================================================================");
  console.log("🚀 ANTIGRAVITY AUTONOMOUS SOFTWARE FACTORY — MASTER VERIFICATION");
  console.log("==================================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(name: string, condition: boolean, details?: string) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${name}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${name} ${details ? `(${details})` : ""}`);
    }
  }

  // 1. Configuration & Env Validation
  console.log("1. Environment & Configuration System");
  assert("Public App Name matches 'Antigravity OS'", env.public.NEXT_PUBLIC_APP_NAME === "Antigravity OS");
  assert("Default Telemetry Interval is configured", env.public.NEXT_PUBLIC_TELEMETRY_INTERVAL_MS >= 500);

  // 2. 10-Role Swarm Roster
  console.log("\n2. 10-Role Swarm Architecture");
  const allAgents = agentSwarm.getAllAgents();
  assert("Exact 10 Swarm Agents registered", allAgents.length === 10);
  assert("Architect role is present", allAgents.some((a) => a.role === "ARCHITECT"));
  assert("Security Engineer role is present", allAgents.some((a) => a.role === "SECURITY_ENGINEER"));
  assert("Builder role is present", allAgents.some((a) => a.role === "BUILDER"));

  // 3. Sandboxed Tool Registry & Permissions
  console.log("\n3. Sandboxed Tool Registry & Permissions");
  const allTools = toolRegistry.getAllTools();
  assert("Tools registered in registry", allTools.length >= 2);
  const memTool = toolRegistry.getTool("search_memory");
  assert("search_memory tool exists", !!memTool);
  assert("search_memory risk level is READ_ONLY", memTool?.riskLevel === "READ_ONLY");

  const toolExec = await toolRegistry.executeTool("search_memory", { query: "Next.js architecture", limit: 3 }, {
    agentRole: "ARCHITECT",
    workspaceId: "test_ws",
  });
  assert("Tool execution succeeded with structured output", toolExec.success && (toolExec.result?.matches?.length ?? 0) > 0);

  // 4. Central Policy Engine & Risk Classification
  console.log("\n4. Central Policy Engine & Human Approval Gate");
  const readCheck = policyEngine.evaluateAction({
    taskId: "t_read",
    agentRole: "BUILDER",
    action: "fs:read",
    workspaceId: "ws_alpha",
  });
  assert("READ_ONLY action automatically allowed", readCheck.allowed && !readCheck.requiresApproval);

  const prodCheck = policyEngine.evaluateAction({
    taskId: "t_prod",
    agentRole: "DEVOPS_ENGINEER",
    action: "deploy:prod",
    workspaceId: "ws_alpha",
  });
  assert("PRODUCTION_CRITICAL action suspended for human approval", !prodCheck.allowed && prodCheck.requiresApproval);
  assert("Approval request generated in queue", !!prodCheck.approvalRequestId);

  if (prodCheck.approvalRequestId) {
    const decision = policyEngine.recordDecision(prodCheck.approvalRequestId, "APPROVED", "Lead Operator", "Release validated");
    assert("Approval decision recorded and transitioned to APPROVED", decision.status === "APPROVED");
  }

  // 5. Versioned Artifact System
  console.log("\n5. Versioned Artifact System");
  const art1 = artifactSystem.saveArtifact({
    name: "user-stories.json",
    category: "REQUIREMENTS",
    projectId: "proj_alpha",
    taskId: "task_req",
    agentRole: "PRODUCT_MANAGER",
    content: { stories: ["As a user, I want real-time telemetry streaming."] },
  });
  assert("Artifact created with version 1", art1.version === 1);

  const art2 = artifactSystem.saveArtifact({
    name: "user-stories.json",
    category: "REQUIREMENTS",
    projectId: "proj_alpha",
    taskId: "task_req",
    agentRole: "PRODUCT_MANAGER",
    content: { stories: ["As a user, I want real-time telemetry streaming.", "As an admin, I require approval gates."] },
  });
  assert("Artifact updated to version 2 without overwriting history", art2.version === 2 && art2.previousVersionId === art1.artifactId);

  // 6. Scoped Sandbox Directory & Security Isolation
  console.log("\n6. Scoped Sandbox & Workspace Isolation");
  const sandbox = sandboxManager.provisionSandbox("ws_alpha", "proj_alpha", "task_01");
  assert("Sandbox provisioned in isolated workspace path", sandbox.rootPath.includes("workspaces"));

  const writtenPath = sandboxManager.writeFile(sandbox.sandboxId, "test.txt", "Antigravity Secure Sandbox");
  assert("File safely written inside sandbox boundary", writtenPath.startsWith(sandbox.rootPath));

  let traversalBlocked = false;
  try {
    sandboxManager.writeFile(sandbox.sandboxId, "../../../evil.txt", "Escape attempt");
  } catch (err: any) {
    traversalBlocked = true;
  }
  assert("Path traversal escape attempt detected & prevented", traversalBlocked);

  // 7. Autonomous Coding Loop & Self-Healing
  console.log("\n7. Autonomous Coding Loop & Self-Healing Engine");
  const loopResult = await codingLoop.executeLoop({
    workspaceId: "ws_alpha",
    projectId: "proj_alpha",
    taskId: "task_loop",
    prompt: "Generate typed AppState module",
    maxIterations: 3,
  });
  assert("Autonomous coding loop finished with SUCCESS", loopResult.success);
  assert("Coding loop steps captured in artifact trace", loopResult.steps.length >= 2);

  // 8. Automated Security & Secret Scanning
  console.log("\n8. Automated Security Validator");
  const secScanClean = securityValidator.auditCodebase(
    [{ path: "src/clean.ts", content: "export const safe = true;" }],
    { projectId: "proj_alpha", taskId: "task_sec" }
  );
  assert("Clean codebase scores 100 on security audit", secScanClean.passed && secScanClean.score === 100);

  const secScanVuln = securityValidator.auditCodebase(
    [{ path: "src/vuln.ts", content: 'const token = "sk-123456789012345678901234567890123456"; eval("2+2");' }],
    { projectId: "proj_alpha", taskId: "task_sec" }
  );
  assert("Security validator catches hardcoded secret and eval", !secScanVuln.passed && secScanVuln.criticalCount > 0);

  // 9. Browser QA Headless Verification
  console.log("\n9. Browser QA Headless Engine");
  const qaScenarioResult = await browserQA.executeScenario(
    {
      name: "Dashboard Telemetry View Check",
      targetUrl: process.env.TEST_PORT ? `http://localhost:${process.env.TEST_PORT}` : "http://localhost:3000",
      actions: ["NAVIGATE", "ASSERT_TEXT"],
    },
    { projectId: "proj_alpha", taskId: "task_qa" }
  );
  assert("Browser QA scenario executed and generated report", qaScenarioResult.passed && qaScenarioResult.domElementsVerified > 0);

  // 10. Software Factory Benchmark Runner (Canonical Task)
  console.log("\n10. Software Factory Benchmark Execution");
  const benchmarkResult = await benchmarkRunner.runBenchmark("task-app");
  assert("Task-App Benchmark executed successfully", benchmarkResult.passed);
  assert("Overall Quality Score is PRODUCTION_CANDIDATE or EXCELLENT", benchmarkResult.scorecard.overallScore >= 85);
  console.log(`     Scorecard: ${benchmarkResult.scorecard.overallScore}/100 [${benchmarkResult.scorecard.tier}]`);

  // 11. Unified Memory Engine & Cross-Tenant Isolation
  console.log("\n11. Unified Memory Engine & Provenance");
  const testMem = memoryEngine.remember({
    content: "Deterministic fallback engine deployed to test environment.",
    category: "ARCHITECTURE",
    tags: ["test", "fallback"],
    workspaceId: "ws_alpha",
  });
  assert("Memory entry stored with generated ID", !!testMem.id);

  const retrieved = memoryEngine.retrieve("ws_alpha", "Deterministic");
  assert("Memory item accurately retrieved by query", retrieved.length >= 1 && retrieved[0]?.id === testMem.id);

  const isolatedRetrieve = memoryEngine.retrieve("ws_beta", "Deterministic");
  assert("Tenant isolation: ws_beta cannot access ws_alpha memory", isolatedRetrieve.length === 0);

  // 12. Quota & Cost Governance
  console.log("\n12. Quota & Cost Governance");
  quotaEngine.recordUsage("ollama", 120, 80, "qwen2.5-coder:7b", "ws_alpha");
  const statsAfter = quotaEngine.getAllStats();
  assert("Ollama GPU usage tracked (0 cost USD)", (statsAfter.providers["ollama"]?.requestCount ?? 0) > 0);

  // 13. Task Orchestration & Finite State Machine
  console.log("\n13. Task Orchestration & Finite State Machine");
  const task = taskOrchestrator.createTask({
    title: "Verify Full Lifecycle Golden Path Execution",
    description: "Execute end-to-end software factory sequence.",
    priority: "HIGH",
    assignedAgent: "QA_ENGINEER",
    workspaceId: "ws_alpha",
  });
  assert("Task created in QUEUED state", task.status === "QUEUED");

  const cancelSuccess = taskOrchestrator.cancelTask(task.id);
  assert("Task cancellation successfully propagated", cancelSuccess && task.status === "CANCELLED");

  console.log("\n==================================================================");
  console.log(`📊 FINAL MASTER VERIFICATION SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log("==================================================================");

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test runner failed:", err);
  process.exit(1);
});
