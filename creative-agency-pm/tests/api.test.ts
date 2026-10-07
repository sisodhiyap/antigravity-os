import assert from "assert";
import http from "http";
import { startServer } from "../src/server";

const TEST_PORT = 3499;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

function request(path: string, options: { method?: string; body?: any; headers?: Record<string, string> } = {}): Promise<{ status: number; body: any }> {
  return new Promise((resolve) => {
    const postData = options.body ? JSON.stringify(options.body) : "";
    const req = http.request(
      BASE_URL + path,
      {
        method: options.method || "GET",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData),
          ...options.headers
        }
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode || 0, body: JSON.parse(raw) });
          } catch {
            resolve({ status: res.statusCode || 0, body: raw });
          }
        });
      }
    );
    req.on("error", (e) => resolve({ status: 500, body: e.message }));
    if (postData) req.write(postData);
    req.end();
  });
}

async function runApiTests() {
  console.log("\n==========================================");
  console.log("INTEGRATION API TESTS: Aura Studio OS");
  console.log("==========================================\n");

  const server = await startServer(TEST_PORT);

  try {
    // 1. Health
    console.log("▶ [Test 1] Health Check Endpoint");
    const health = await request("/api/health");
    assert.strictEqual(health.status, 200);
    assert.strictEqual(health.body.status, "healthy");
    console.log("  ✓ Health Check: PASS");

    // 2. Authentication Login
    console.log("▶ [Test 2] Auth Login & Session Token Issuance");
    const loginRes = await request("/api/auth/login", {
      method: "POST",
      body: { email: "elena@aurastudio.design", password: "creative2026!" }
    });
    assert.strictEqual(loginRes.status, 200);
    assert(loginRes.body.token, "No session token returned");
    assert.strictEqual(loginRes.body.user.name, "Elena Rostova");
    const token = loginRes.body.token;
    console.log("  ✓ Auth Login: PASS");

    // 3. Projects CRUD
    console.log("▶ [Test 3] Projects API Full Lifecycle");
    const createProj = await request("/api/projects", {
      method: "POST",
      body: {
        name: "Test Neo Brand Project",
        client_id: "cli_apex",
        code: "NEO-01",
        budget: 50000,
        due_date: "2026-11-01"
      },
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.strictEqual(createProj.status, 201);
    const projId = createProj.body.data.id;

    const listProj = await request("/api/projects", { headers: { Authorization: `Bearer ${token}` } });
    assert.strictEqual(listProj.status, 200);
    assert(listProj.body.data.length >= 4, "Project list count mismatch");

    const updateProj = await request(`/api/projects/${projId}`, {
      method: "PATCH",
      body: { budget: 55000, status: "Production" },
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.strictEqual(updateProj.status, 200);
    assert.strictEqual(updateProj.body.data.budget, 55000);

    const deleteProj = await request(`/api/projects/${projId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.strictEqual(deleteProj.status, 200);
    console.log("  ✓ Projects API CRUD: PASS");

    // 4. Tasks & Kanban
    console.log("▶ [Test 4] Tasks & Status Transitions");
    const createTask = await request("/api/tasks", {
      method: "POST",
      body: {
        title: "Integration Test Task",
        project_id: "prj_apex_rebrand",
        priority: "High",
        estimated_hours: 8
      },
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.strictEqual(createTask.status, 201);
    const taskId = createTask.body.data.id;

    const moveTask = await request(`/api/tasks/${taskId}`, {
      method: "PATCH",
      body: { status: "Completed" },
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.strictEqual(moveTask.status, 200);
    assert.strictEqual(moveTask.body.data.status, "Completed");
    console.log("  ✓ Tasks & Kanban Status Transitions: PASS");

    // 5. Approvals Sign-off Workflow
    console.log("▶ [Test 5] Approvals Sign-Off Lifecycle");
    const createAppr = await request("/api/approvals", {
      method: "POST",
      body: {
        title: "Test Logo Signoff",
        project_id: "prj_apex_rebrand",
        comments: "Please review"
      },
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.strictEqual(createAppr.status, 201);
    const apprId = createAppr.body.data.id;

    const reviewAppr = await request(`/api/approvals/${apprId}/review`, {
      method: "POST",
      body: { status: "Approved", comments: "Signed off by director" },
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.strictEqual(reviewAppr.status, 200);
    assert.strictEqual(reviewAppr.body.data.status, "Approved");
    console.log("  ✓ Approvals Sign-Off Lifecycle: PASS");

    // 6. Analytics & Global Search
    console.log("▶ [Test 6] Analytics Aggregations & Global Search");
    const analytics = await request("/api/analytics", { headers: { Authorization: `Bearer ${token}` } });
    assert.strictEqual(analytics.status, 200);
    assert(analytics.body.kpis.total_budget > 0);

    const search = await request("/api/search?q=Apex", { headers: { Authorization: `Bearer ${token}` } });
    assert.strictEqual(search.status, 200);
    assert(search.body.results.length > 0);
    console.log("  ✓ Analytics & Search Aggregations: PASS");

    console.log("\n==========================================");
    console.log("ALL INTEGRATION API TESTS PASSED (6/6 PASS)");
    console.log("==========================================\n");
  } finally {
    server.close();
  }
}

if (require.main === module) {
  runApiTests().catch(console.error);
}

export { runApiTests };
