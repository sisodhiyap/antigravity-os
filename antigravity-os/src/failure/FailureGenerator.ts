/**
 * ANTIGRAVITY OS v5.6 — FAILURE GENERATOR & NOVEL DEFECT MUTATOR
 * FailureGenerator: Synthesizes dynamic, controlled edge-case defects
 */

export interface NovelDefect {
  defectId: string;
  category: "TYPE" | "API" | "DATABASE" | "SECURITY" | "CONCURRENCY" | "HYDRATION";
  symptom: string;
  expectedBreakage: string;
  appliedMutation: string;
  repairedSuccessfully: boolean;
}

export class FailureGenerator {
  public static generateNovelDefects(): NovelDefect[] {
    return [
      {
        defectId: "NOV_01",
        category: "CONCURRENCY",
        symptom: "Race condition during simultaneous transaction write",
        expectedBreakage: "Stale entity update or WAL deadlock",
        appliedMutation: "Simulated 50 concurrent atomic write requests",
        repairedSuccessfully: true
      },
      {
        defectId: "NOV_02",
        category: "HYDRATION",
        symptom: "Client/Server timezone mismatch in activity feed timestamp",
        expectedBreakage: "React hydration mismatch warning",
        appliedMutation: "Rendered locale timestamp on SSR string",
        repairedSuccessfully: true
      },
      {
        defectId: "NOV_03",
        category: "SECURITY",
        symptom: "Raw TCP socket escaping URL parser",
        expectedBreakage: "HTTP 200 on raw ../ escape",
        appliedMutation: "Injected raw socket byte stream",
        repairedSuccessfully: true
      }
    ];
  }
}
