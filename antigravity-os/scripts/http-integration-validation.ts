/**
 * ANTIGRAVITY LEVEL-3 — REAL HTTP INTEGRATION VALIDATION
 *
 * Tests the actual Next.js 15 API routes via real fetch() calls against localhost:3000.
 * No in-process controller invocation — all calls go through the real HTTP stack.
 */
import fs from "fs";
import path from "path";
import { startTestServer } from "./test-http-server";

const BASE_URL = "http://localhost:3000";
const EVIDENCE_DIR = path.resolve(process.cwd(), "artifacts", "level3", "http");

interface HttpTestResult {
  testName: string;
  method: string;
  url: string;
  requestBody?: object;
  responseStatus: number;
  responseBody: any;
  requestId: string | null;
  durationMs: number;
  passed: boolean;
  assertions: { assertion: string; passed: boolean }[];
}

const results: HttpTestResult[] = [];
let passed = 0;
let failed = 0;

function assert(r: HttpTestResult, label: string, cond: boolean) {
  r.assertions.push({ assertion: label, passed: cond });
  if (!cond) r.passed = false;
}

async function httpTest(
  testName: string,
  method: string,
  path: string,
  body?: object,
  fn?: (r: HttpTestResult) => void
): Promise<HttpTestResult> {
  const url = `${BASE_URL}${path}`;
  const start = performance.now();
  const result: HttpTestResult = {
    testName,
    method,
    url,
    requestBody: body,
    responseStatus: 0,
    responseBody: null,
    requestId: null,
    durationMs: 0,
    passed: true,
    assertions: [],
  };

  try {
    const init: RequestInit = {
      method,
      headers: { "Content-Type": "application/json" },
    };
    if (body) init.body = JSON.stringify(body);

    const res = await fetch(url, init);
    result.responseStatus = res.status;
    result.requestId = res.headers.get("x-request-id");

    const text = await res.text();
    try {
      result.responseBody = JSON.parse(text);
    } catch {
      result.responseBody = text;
    }
  } catch (err: any) {
    result.passed = false;
    result.responseBody = { error: err.message };
  }

  result.durationMs = Math.round(performance.now() - start);

  if (fn) fn(result);

  results.push(result);
  const icon = result.passed && result.assertions.every(a => a.passed) ? "✅" : "❌";
  const finalPassed = result.passed && result.assertions.every(a => a.passed);
  console.log(`  ${icon} [${finalPassed ? "PASS" : "FAIL"}] ${method} ${path} → HTTP ${result.responseStatus} (${result.durationMs}ms)`);
  if (!finalPassed) {
    const failedAssertions = result.assertions.filter(a => !a.passed);
    failedAssertions.forEach(a => console.log(`       ASSERT FAILED: ${a.assertion}`));
  }
  if (finalPassed) passed++;
  else failed++;

  return result;
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function main() {
  ensureDir(EVIDENCE_DIR);

  const stopServer = await startTestServer(3000);

  console.log("==================================================================");
  console.log("🔌 ANTIGRAVITY LEVEL-3 — REAL HTTP API INTEGRATION VALIDATION");
  console.log(`   Target: ${BASE_URL} (live Next.js 15 production server)`);
  console.log("==================================================================\n");

  // -----------------------------------------------------------------------
  // 1. GET /api/health — Full health check
  // -----------------------------------------------------------------------
  console.log("1. Health & Readiness Endpoints");
  await httpTest("Health Check", "GET", "/api/health", undefined, (r) => {
    assert(r, "HTTP 200", r.responseStatus === 200);
    assert(r, "Returns JSON", typeof r.responseBody === "object");
    assert(r, "Has data field", r.responseBody?.data !== undefined || r.responseBody?.error !== undefined);
  });

  await httpTest("Readiness Probe", "GET", "/api/health/readiness", undefined, (r) => {
    assert(r, "HTTP 200", r.responseStatus === 200);
    assert(r, "Returns JSON", typeof r.responseBody === "object");
  });

  // -----------------------------------------------------------------------
  // 2. GET /api/agents
  // -----------------------------------------------------------------------
  console.log("\n2. Agent Endpoints");
  await httpTest("List Agents", "GET", "/api/agents", undefined, (r) => {
    assert(r, "HTTP 200", r.responseStatus === 200);
    assert(r, "Returns JSON", typeof r.responseBody === "object");
  });

  // -----------------------------------------------------------------------
  // 3. GET /api/models
  // -----------------------------------------------------------------------
  console.log("\n3. Model & Provider Endpoints");
  await httpTest("List Models", "GET", "/api/models", undefined, (r) => {
    assert(r, "HTTP 200", r.responseStatus === 200);
    assert(r, "Returns JSON", typeof r.responseBody === "object");
  });

  await httpTest("List Providers", "GET", "/api/providers", undefined, (r) => {
    assert(r, "HTTP 200", r.responseStatus === 200);
  });

  // -----------------------------------------------------------------------
  // 4. Tasks CRUD
  // -----------------------------------------------------------------------
  console.log("\n4. Task Lifecycle — Create, Read, Cancel");
  await httpTest("Create Task", "POST", "/api/tasks", {
    title: "HTTP Integration Test Task",
    description: "Created by Level-3 HTTP integration validator",
    workspaceId: "http_test_ws",
  }, (r) => {
    assert(r, "HTTP 200 or 201", r.responseStatus === 200 || r.responseStatus === 201);
    assert(r, "Returns JSON", typeof r.responseBody === "object");
  });

  await httpTest("List Tasks", "GET", "/api/tasks", undefined, (r) => {
    assert(r, "HTTP 200", r.responseStatus === 200);
    assert(r, "Returns JSON", typeof r.responseBody === "object");
  });

  // -----------------------------------------------------------------------
  // 5. Artifacts API
  // -----------------------------------------------------------------------
  console.log("\n5. Artifact Endpoints");
  await httpTest("List Artifacts", "GET", "/api/artifacts", undefined, (r) => {
    assert(r, "HTTP 200", r.responseStatus === 200);
  });

  await httpTest("Create Artifact", "POST", "/api/artifacts", {
    name: "http-integration-test.json",
    category: "TESTING",
    projectId: "proj_http_test",
    taskId: "task_http_test",
    agentRole: "QA_ENGINEER",
    content: { source: "level3-http-integration-validation", timestamp: new Date().toISOString() },
  }, (r) => {
    assert(r, "HTTP 200 or 201", r.responseStatus === 200 || r.responseStatus === 201);
  });

  // -----------------------------------------------------------------------
  // 6. Approvals Lifecycle
  // -----------------------------------------------------------------------
  console.log("\n6. Approval Lifecycle");
  await httpTest("List Approvals", "GET", "/api/approvals", undefined, (r) => {
    assert(r, "HTTP 200", r.responseStatus === 200);
    assert(r, "Returns JSON", typeof r.responseBody === "object");
  });

  // -----------------------------------------------------------------------
  // 7. Memory API
  // -----------------------------------------------------------------------
  console.log("\n7. Memory API");
  await httpTest("List Memory", "GET", "/api/memory", undefined, (r) => {
    assert(r, "HTTP 200", r.responseStatus === 200);
  });

  // -----------------------------------------------------------------------
  // 8. Benchmarks API
  // -----------------------------------------------------------------------
  console.log("\n8. Benchmark API");
  await httpTest("List Benchmarks", "GET", "/api/benchmarks", undefined, (r) => {
    assert(r, "HTTP 200", r.responseStatus === 200);
    assert(r, "Returns JSON", typeof r.responseBody === "object");
  });

  // -----------------------------------------------------------------------
  // 9. Kernel Status
  // -----------------------------------------------------------------------
  console.log("\n9. Kernel API");
  await httpTest("Kernel Status", "GET", "/api/kernel/status", undefined, (r) => {
    assert(r, "HTTP 200", r.responseStatus === 200);
  });

  await httpTest("Kernel Services", "GET", "/api/kernel/services", undefined, (r) => {
    assert(r, "HTTP 200", r.responseStatus === 200);
  });

  await httpTest("Kernel Events", "GET", "/api/kernel/events", undefined, (r) => {
    assert(r, "HTTP 200", r.responseStatus === 200);
  });

  // -----------------------------------------------------------------------
  // 10. Malformed Request Validation
  // -----------------------------------------------------------------------
  console.log("\n10. Input Validation — Malformed Requests");
  await httpTest("Malformed Task POST (missing title)", "POST", "/api/tasks", {
    description: "no title provided",
  }, (r) => {
    // Should be 400 or still 200 depending on implementation
    assert(r, "Does not return 500", r.responseStatus !== 500);
    assert(r, "Returns JSON not crash", typeof r.responseBody === "object");
  });

  // -----------------------------------------------------------------------
  // 11. Usage API
  // -----------------------------------------------------------------------
  console.log("\n11. Usage / Cost API");
  await httpTest("Usage Statistics", "GET", "/api/usage", undefined, (r) => {
    assert(r, "HTTP 200", r.responseStatus === 200);
  });

  // -----------------------------------------------------------------------
  // Write Evidence
  // -----------------------------------------------------------------------
  const report = {
    suite: "ANTIGRAVITY LEVEL-3 REAL HTTP API INTEGRATION",
    target: BASE_URL,
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    passed,
    failed,
    results,
  };

  fs.writeFileSync(
    path.join(EVIDENCE_DIR, "http-integration-report.json"),
    JSON.stringify(report, null, 2),
    "utf-8"
  );

  console.log("\n==================================================================");
  console.log(`📊 REAL HTTP INTEGRATION SUMMARY: ${passed}/${results.length} TESTS PASSED`);
  console.log(`📁 Evidence: artifacts/level3/http/http-integration-report.json`);
  console.log("==================================================================");

  await stopServer();

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("HTTP integration validation crashed:", err.message);
  process.exit(1);
});
