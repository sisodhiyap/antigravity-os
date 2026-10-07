/**
 * ANTIGRAVITY OS v7.0 — HERMES AGENT SUBSYSTEM
 * HermesPlanner.ts: Goal decomposition and task planning
 */

import { HermesTaskGraph } from "./HermesTaskGraph";
import { HermesModelRouter } from "./HermesModelRouter";

export class HermesPlanner {
  /**
   * Decomposes a high-level user/owner objective into an executable DAG
   */
  public static planObjective(
    objective: string,
    sessionId: string
  ): HermesTaskGraph {
    const graph = new HermesTaskGraph();

    // 1. Understand input
    const t1 = graph.addTask({
      id: "task_01_understand",
      objective: `Understand user intent: ${objective}`,
      dependencies: [],
      inputs: { rawObjective: objective },
      model: HermesModelRouter.routeCapability("DOCUMENT").selectedModel,
      tools: ["hermes_fs_read"],
      permissions: 1,
      sandbox: `sbx_${sessionId}`,
      status: "PENDING",
      confidence: 0.98,
      evidenceIds: [],
      retries: 0,
      provenance: "OBSERVED"
    });

    // 2. Build product model
    const t2 = graph.addTask({
      id: "task_02_product_model",
      parentId: t1.id,
      objective: "Build Canonical UIR & Product Twin Model",
      dependencies: [t1.id],
      inputs: { spec: "UIR_3.0" },
      model: HermesModelRouter.routeCapability("REASONING").selectedModel,
      tools: ["hermes_fs_read", "hermes_fs_write"],
      permissions: 2,
      sandbox: `sbx_${sessionId}`,
      status: "PENDING",
      confidence: 0.95,
      evidenceIds: [],
      retries: 0,
      provenance: "INFERRED"
    });

    // 3. Design architecture
    const t3 = graph.addTask({
      id: "task_03_architecture",
      parentId: t2.id,
      objective: "Synthesize Architecture Decision Records (ADRs)",
      dependencies: [t2.id],
      inputs: { targets: ["React", "TypeScript", "SQLite WAL"] },
      model: HermesModelRouter.routeCapability("ARCHITECTURE").selectedModel,
      tools: ["hermes_fs_write"],
      permissions: 2,
      sandbox: `sbx_${sessionId}`,
      status: "PENDING",
      confidence: 0.96,
      evidenceIds: [],
      retries: 0,
      provenance: "GENERATED"
    });

    // 4. Generate Code & DB
    const t4 = graph.addTask({
      id: "task_04_code_gen",
      parentId: t3.id,
      objective: "Compile frontend, backend routes & database schema in sandbox",
      dependencies: [t3.id],
      inputs: { framework: "Next.js/React" },
      model: HermesModelRouter.routeCapability("CODE").selectedModel,
      tools: ["hermes_fs_write"],
      permissions: 2,
      sandbox: `sbx_${sessionId}`,
      status: "PENDING",
      confidence: 0.97,
      evidenceIds: [],
      retries: 0,
      provenance: "GENERATED"
    });

    // 5. Run Tests & QA
    const t5 = graph.addTask({
      id: "task_05_tests_qa",
      parentId: t4.id,
      objective: "Execute Unit, Regression, Browser & Security Red-Team QA",
      dependencies: [t4.id],
      inputs: { suites: ["unit", "regression", "security", "browser"] },
      model: HermesModelRouter.routeCapability("TESTING").selectedModel,
      tools: ["hermes_test_runner", "hermes_security_scan", "hermes_browser_qa"],
      permissions: 3,
      sandbox: `sbx_${sessionId}`,
      status: "PENDING",
      confidence: 0.99,
      evidenceIds: [],
      retries: 0,
      provenance: "VERIFIED"
    });

    // 6. Generate Evidence
    const t6 = graph.addTask({
      id: "task_06_evidence",
      parentId: t5.id,
      objective: "Record cryptographic hash-chain evidence & claims in Reality Kernel",
      dependencies: [t5.id],
      inputs: { verifier: "ZeroTrustRealityKernel" },
      model: HermesModelRouter.routeCapability("LOCAL_INFERENCE").selectedModel,
      tools: ["hermes_fs_read"],
      permissions: 3,
      sandbox: `sbx_${sessionId}`,
      status: "PENDING",
      confidence: 1.0,
      evidenceIds: [],
      retries: 0,
      provenance: "VERIFIED"
    });

    // 7. Request Promotion (Gate 4)
    graph.addTask({
      id: "task_07_promotion_request",
      parentId: t6.id,
      objective: "Request Owner Approval for Production Promotion",
      dependencies: [t6.id],
      inputs: { target: "PROD_RELEASE" },
      model: HermesModelRouter.routeCapability("LOCAL_INFERENCE").selectedModel,
      tools: ["hermes_production_promote"],
      permissions: 4,
      sandbox: `sbx_${sessionId}`,
      status: "PENDING",
      confidence: 1.0,
      evidenceIds: [],
      retries: 0,
      provenance: "VERIFIED"
    });

    return graph;
  }
}
