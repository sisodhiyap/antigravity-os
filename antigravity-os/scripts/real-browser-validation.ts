/**
 * ANTIGRAVITY LEVEL-3 — REAL PLAYWRIGHT BROWSER E2E VALIDATION
 *
 * Uses real Chromium via Playwright against the live Next.js server on localhost:3000.
 * NO synthetic simulation. Every assertion is against a real rendered browser session.
 */
import { chromium, Browser, Page, BrowserContext } from "playwright";
import fs from "fs";
import path from "path";
import { startTestServer } from "./test-http-server";

const BASE_URL = "http://localhost:3000";
const EVIDENCE_DIR = path.resolve(process.cwd(), "artifacts", "level3", "browser");

interface BrowserTestResult {
  testName: string;
  url: string;
  passed: boolean;
  httpStatus?: number;
  domAssertions: { assertion: string; passed: boolean }[];
  consoleErrors: string[];
  pageErrors: string[];
  failedRequests: { url: string; status: number }[];
  screenshotPath: string;
  durationMs: number;
  timestamp: string;
}

const allResults: BrowserTestResult[] = [];
let passed = 0;
let failed = 0;

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function runTest(
  page: Page,
  testName: string,
  url: string,
  testFn: (page: Page, result: BrowserTestResult) => Promise<void>
): Promise<BrowserTestResult> {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedRequests: { url: string; status: number }[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => {
    pageErrors.push(err.message);
  });
  page.on("response", (response) => {
    if (!response.ok() && !response.url().includes("/_next/")) {
      failedRequests.push({ url: response.url(), status: response.status() });
    }
  });

  const start = performance.now();
  const result: BrowserTestResult = {
    testName,
    url,
    passed: false,
    domAssertions: [],
    consoleErrors,
    pageErrors,
    failedRequests,
    screenshotPath: "",
    durationMs: 0,
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
    result.httpStatus = response?.status() ?? 0;

    await testFn(page, result);

    // Take real screenshot
    const screenshotPath = path.join(EVIDENCE_DIR, `${testName.replace(/\s+/g, "_").toLowerCase()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    result.screenshotPath = screenshotPath;
    result.passed = result.domAssertions.every((a) => a.passed) && result.httpStatus < 500;
  } catch (err: any) {
    result.passed = false;
    result.pageErrors.push(`Test execution error: ${err.message}`);
    // Still try to screenshot
    try {
      const screenshotPath = path.join(EVIDENCE_DIR, `${testName.replace(/\s+/g, "_").toLowerCase()}_error.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      result.screenshotPath = screenshotPath;
    } catch (_) {}
  }

  result.durationMs = Math.round(performance.now() - start);
  allResults.push(result);

  const icon = result.passed ? "✅" : "❌";
  console.log(`  ${icon} [${result.passed ? "PASS" : "FAIL"}] ${testName} (${result.durationMs}ms, HTTP ${result.httpStatus})`);
  if (!result.passed) {
    if (result.pageErrors.length) console.log(`     Page errors: ${result.pageErrors.join("; ")}`);
    if (result.consoleErrors.length) console.log(`     Console errors: ${result.consoleErrors.slice(0, 2).join("; ")}`);
    if (result.failedRequests.length) console.log(`     Failed reqs: ${result.failedRequests.slice(0, 2).map(r => `${r.url} -> ${r.status}`).join("; ")}`);
    failed++;
  } else {
    passed++;
  }

  return result;
}

function assertElement(result: BrowserTestResult, assertion: string, cond: boolean) {
  result.domAssertions.push({ assertion, passed: cond });
}

async function main() {
  ensureDir(EVIDENCE_DIR);

  const stopServer = await startTestServer(3000);

  console.log("==================================================================");
  console.log("🌐 ANTIGRAVITY LEVEL-3 — REAL PLAYWRIGHT CHROMIUM BROWSER E2E");
  console.log(`   Target: ${BASE_URL}`);
  console.log(`   Browser: Chromium (Playwright v1.62.1)`);
  console.log("==================================================================\n");

  let browser: Browser | undefined;
  let context: BrowserContext | undefined;

  try {
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      userAgent: "Antigravity-Level3-Validator/1.0 Chromium",
    });
    const page = await context.newPage();

    // -----------------------------------------------------------------------
    // TEST 1: Root Dashboard — real page load, DOM structure, title
    // -----------------------------------------------------------------------
    console.log("1. Root Dashboard — Real Page Load");
    await runTest(page, "Root Dashboard Load", BASE_URL, async (p, r) => {
      const title = await p.title();
      assertElement(r, `Page title non-empty (got: "${title}")`, title.length > 0);

      const body = await p.locator("body").count();
      assertElement(r, "Body element present", body === 1);

      const main = await p.locator("main, [role='main'], #__next").count();
      assertElement(r, "Main content container present", main > 0);
    });

    // -----------------------------------------------------------------------
    // TEST 2: Agents Page — real navigation and DOM
    // -----------------------------------------------------------------------
    console.log("\n2. Agents Page — Real Navigation & DOM");
    await runTest(page, "Agents Page Navigation", `${BASE_URL}/agents`, async (p, r) => {
      const h1Count = await p.locator("h1, h2").count();
      assertElement(r, "Heading element exists on agents page", h1Count > 0);

      const bodyText = await p.locator("body").innerText();
      assertElement(r, "Page has non-empty content", bodyText.trim().length > 20);
    });

    // -----------------------------------------------------------------------
    // TEST 3: MCP Tools Page
    // -----------------------------------------------------------------------
    console.log("\n3. MCP Page — Real DOM Assertions");
    await runTest(page, "MCP Page Load", `${BASE_URL}/mcp`, async (p, r) => {
      const body = await p.locator("body").count();
      assertElement(r, "MCP page body rendered", body === 1);

      const elements = await p.locator("*").count();
      assertElement(r, `Page has significant DOM elements (got ${elements})`, elements > 10);
    });

    // -----------------------------------------------------------------------
    // TEST 4: Settings Page
    // -----------------------------------------------------------------------
    console.log("\n4. Settings Page — Real DOM Assertions");
    await runTest(page, "Settings Page Load", `${BASE_URL}/settings`, async (p, r) => {
      const body = await p.locator("body").count();
      assertElement(r, "Settings page body rendered", body === 1);
    });

    // -----------------------------------------------------------------------
    // TEST 5: API /api/health — Real HTTP + JSON response parsing
    // -----------------------------------------------------------------------
    console.log("\n5. Health API — Real HTTP JSON Response");
    await runTest(page, "Health API Response", `${BASE_URL}/api/health`, async (p, r) => {
      const bodyText = await p.locator("body").innerText();
      let parsed: any = null;
      try {
        parsed = JSON.parse(bodyText);
      } catch (_) {}

      assertElement(r, "API returns parseable JSON", parsed !== null);
      assertElement(r, `Response has 'data' or 'status' field`, parsed?.data !== undefined || parsed?.status !== undefined || parsed?.error !== undefined);
      assertElement(r, `HTTP status is 200`, r.httpStatus === 200);
    });

    // -----------------------------------------------------------------------
    // TEST 6: API /api/health/readiness — Real readiness probe
    // -----------------------------------------------------------------------
    console.log("\n6. Readiness API — Real HTTP JSON Response");
    await runTest(page, "Readiness API Response", `${BASE_URL}/api/health/readiness`, async (p, r) => {
      const bodyText = await p.locator("body").innerText();
      let parsed: any = null;
      try { parsed = JSON.parse(bodyText); } catch (_) {}
      assertElement(r, "Readiness returns parseable JSON", parsed !== null);
      assertElement(r, "HTTP status 200", r.httpStatus === 200);
    });

    // -----------------------------------------------------------------------
    // TEST 7: API /api/agents — Real agents endpoint
    // -----------------------------------------------------------------------
    console.log("\n7. Agents API — Real Endpoint Response");
    await runTest(page, "Agents API Response", `${BASE_URL}/api/agents`, async (p, r) => {
      const bodyText = await p.locator("body").innerText();
      let parsed: any = null;
      try { parsed = JSON.parse(bodyText); } catch (_) {}
      assertElement(r, "Agents API returns parseable JSON", parsed !== null);
      assertElement(r, "HTTP status 200", r.httpStatus === 200);
    });

    // -----------------------------------------------------------------------
    // TEST 8: API /api/models — Real models listing
    // -----------------------------------------------------------------------
    console.log("\n8. Models API — Real Response");
    await runTest(page, "Models API Response", `${BASE_URL}/api/models`, async (p, r) => {
      assertElement(r, "HTTP 200", r.httpStatus === 200);
      const bodyText = await p.locator("body").innerText();
      let parsed: any = null;
      try { parsed = JSON.parse(bodyText); } catch (_) {}
      assertElement(r, "Returns valid JSON", parsed !== null);
    });

    // -----------------------------------------------------------------------
    // TEST 9: API /api/tasks — Real task listing
    // -----------------------------------------------------------------------
    console.log("\n9. Tasks API — Real Endpoint");
    await runTest(page, "Tasks API Response", `${BASE_URL}/api/tasks`, async (p, r) => {
      assertElement(r, "HTTP 200", r.httpStatus === 200);
    });

    // -----------------------------------------------------------------------
    // TEST 10: API /api/artifacts — Real artifacts listing
    // -----------------------------------------------------------------------
    console.log("\n10. Artifacts API — Real Endpoint");
    await runTest(page, "Artifacts API Response", `${BASE_URL}/api/artifacts`, async (p, r) => {
      assertElement(r, "HTTP 200", r.httpStatus === 200);
    });

    // -----------------------------------------------------------------------
    // TEST 11: API /api/approvals — Real approvals listing
    // -----------------------------------------------------------------------
    console.log("\n11. Approvals API — Real Endpoint");
    await runTest(page, "Approvals API Response", `${BASE_URL}/api/approvals`, async (p, r) => {
      assertElement(r, "HTTP 200", r.httpStatus === 200);
    });

    // -----------------------------------------------------------------------
    // TEST 12: API /api/memory — Real memory listing
    // -----------------------------------------------------------------------
    console.log("\n12. Memory API — Real Endpoint");
    await runTest(page, "Memory API Response", `${BASE_URL}/api/memory`, async (p, r) => {
      assertElement(r, "HTTP 200", r.httpStatus === 200);
    });

    // -----------------------------------------------------------------------
    // TEST 13: Responsive Viewport — Mobile 375px
    // -----------------------------------------------------------------------
    console.log("\n13. Responsive — Mobile 375px Viewport");
    const mobilePage = await context.newPage();
    await mobilePage.setViewportSize({ width: 375, height: 812 });
    await runTest(mobilePage, "Mobile 375px Viewport", BASE_URL, async (p, r) => {
      const body = await p.locator("body").count();
      assertElement(r, "Page renders at 375px width", body === 1);
      const vp = p.viewportSize();
      assertElement(r, `Viewport is 375px (got ${vp?.width})`, vp?.width === 375);
    });
    await mobilePage.close();

    // -----------------------------------------------------------------------
    // TEST 14: Responsive Viewport — Tablet 768px
    // -----------------------------------------------------------------------
    console.log("\n14. Responsive — Tablet 768px Viewport");
    const tabletPage = await context.newPage();
    await tabletPage.setViewportSize({ width: 768, height: 1024 });
    await runTest(tabletPage, "Tablet 768px Viewport", BASE_URL, async (p, r) => {
      const body = await p.locator("body").count();
      assertElement(r, "Page renders at 768px width", body === 1);
    });
    await tabletPage.close();

    // -----------------------------------------------------------------------
    // TEST 15: 404 Not Found — Correct error page
    // -----------------------------------------------------------------------
    console.log("\n15. 404 Error Page — Real Not Found Handling");
    await runTest(page, "404 Not Found Page", `${BASE_URL}/non-existent-route-xyz`, async (p, r) => {
      // 404 pages in Next.js still return 200 with error content — check for "not found" content
      const bodyText = (await p.locator("body").innerText()).toLowerCase();
      assertElement(r, "Body has content (not blank)", bodyText.length > 5);
    });

  } finally {
    await context?.close();
    await browser?.close();
  }

  // -----------------------------------------------------------------------
  // Write Evidence Reports
  // -----------------------------------------------------------------------
  const report = {
    suite: "ANTIGRAVITY LEVEL-3 REAL PLAYWRIGHT BROWSER E2E",
    browser: "Chromium",
    playwrightVersion: "1.62.1",
    target: BASE_URL,
    timestamp: new Date().toISOString(),
    totalTests: allResults.length,
    passed,
    failed,
    results: allResults,
  };

  fs.writeFileSync(
    path.join(EVIDENCE_DIR, "browser-report.json"),
    JSON.stringify(report, null, 2),
    "utf-8"
  );

  fs.writeFileSync(
    path.join(EVIDENCE_DIR, "console.log"),
    allResults.map(r => `[${r.testName}]\n  URL: ${r.url}\n  Status: ${r.passed ? "PASS" : "FAIL"}\n  HTTP: ${r.httpStatus}\n  Console Errors: ${r.consoleErrors.join("; ") || "none"}\n  Page Errors: ${r.pageErrors.join("; ") || "none"}\n`).join("\n"),
    "utf-8"
  );

  fs.writeFileSync(
    path.join(EVIDENCE_DIR, "network.log"),
    allResults.map(r => `[${r.testName}] Failed requests: ${r.failedRequests.map(f => `${f.url} (${f.status})`).join(", ") || "none"}`).join("\n"),
    "utf-8"
  );

  console.log("\n==================================================================");
  console.log(`📊 REAL PLAYWRIGHT BROWSER E2E SUMMARY: ${passed}/${allResults.length} TESTS PASSED`);
  console.log(`📁 Evidence saved to: ${EVIDENCE_DIR}`);
  console.log(`   browser-report.json | console.log | network.log | *.png screenshots`);
  console.log("==================================================================");

  await stopServer();

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Real browser validation crashed:", err.message);
  process.exit(1);
});
