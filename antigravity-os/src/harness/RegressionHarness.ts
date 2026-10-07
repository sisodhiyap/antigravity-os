/**
 * ANTIGRAVITY OS v5.3 — REGRESSION HARNESS
 * RegressionHarness: Re-runs historical regression suites to prevent bug recurrence
 */

export interface RegressionTestCase {
  id: string;
  defectCategory: string;
  originalBugDescription: string;
  repairStrategyApplied: string;
  verifier: () => Promise<boolean>;
}

export class RegressionHarness {
  private static testCases: Map<string, RegressionTestCase> = new Map();

  public static registerCase(testCase: RegressionTestCase) {
    this.testCases.set(testCase.id, testCase);
  }

  public static async executeAll(): Promise<{ total: number; passed: number; failed: number; results: any[] }> {
    const results: any[] = [];
    let passed = 0;
    let failed = 0;

    for (const [id, tc] of this.testCases.entries()) {
      const t0 = Date.now();
      try {
        const pass = await tc.verifier();
        const latencyMs = Date.now() - t0;
        if (pass) {
          passed++;
          results.push({ id, status: "PASS", category: tc.defectCategory, latencyMs });
        } else {
          failed++;
          results.push({ id, status: "FAIL", category: tc.defectCategory, latencyMs, error: "Assertion returned false" });
        }
      } catch (err: any) {
        failed++;
        results.push({ id, status: "FAIL", category: tc.defectCategory, error: err?.message || String(err) });
      }
    }

    return {
      total: this.testCases.size,
      passed,
      failed,
      results
    };
  }
}
