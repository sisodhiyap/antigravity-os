/**
 * ANTIGRAVITY OS v5.3 — MISSION PLANNER
 * MissionPlanner: Synthesizes complex product prompts into a verified directed execution graph
 */

import { MissionGraph } from "./MissionGraph";
import { MissionNode } from "./MissionNode";

export interface PlanOptions {
  missionId: string;
  prompt: string;
  targetAppDir: string;
  requireHumanApprovalForDeploy?: boolean;
  modelPreference?: string;
}

export class MissionPlanner {
  public static buildStandardEngineeringGraph(options: PlanOptions): MissionGraph {
    const { missionId, prompt, targetAppDir, requireHumanApprovalForDeploy = true, modelPreference = "qwen2.5-coder:7b" } = options;
    const graph = new MissionGraph(`graph_${missionId}`, missionId);

    // 1. Requirements Node
    const reqNode = new MissionNode({
      id: "node_01_requirements",
      type: "REQUIREMENT",
      title: "Analyze Product Requirements",
      description: `Deconstruct user prompt into functional specs, user stories, and acceptance criteria. Prompt: "${prompt.slice(0, 80)}..."`,
      dependencies: [],
      ownerAgent: "Product Architect",
      requiredCapabilities: ["semantic-analysis", "spec-generation"],
      modelPreference,
      inputs: { prompt, targetAppDir }
    });
    graph.addNode(reqNode);

    // 2. Architecture Node
    const archNode = new MissionNode({
      id: "node_02_architecture",
      type: "ARCHITECTURE",
      title: "Synthesize System Architecture",
      description: "Define persistence schemas, RESTful API contracts, security models, and component hierarchies.",
      dependencies: ["node_01_requirements"],
      ownerAgent: "System Architect",
      requiredCapabilities: ["system-architecture", "schema-design"],
      modelPreference,
      inputs: { prompt }
    });
    graph.addNode(archNode);
    graph.addEdge({ fromNodeId: reqNode.id, toNodeId: archNode.id, edgeType: "DEPENDENCY" });

    // 3. Database Node (Parallel branch 1)
    const dbNode = new MissionNode({
      id: "node_03_database",
      type: "DATABASE",
      title: "Scaffold Persistence Engine",
      description: "Provision SQLite WAL schema, indexes, migrations, and atomic ACID transaction engine.",
      dependencies: ["node_02_architecture"],
      ownerAgent: "Database Engineer",
      requiredCapabilities: ["sqlite-wal", "schema-provisioning"],
      modelPreference,
      inputs: { targetAppDir }
    });
    graph.addNode(dbNode);
    graph.addEdge({ fromNodeId: archNode.id, toNodeId: dbNode.id, edgeType: "DEPENDENCY" });

    // 4. Backend API Node (Parallel branch 2)
    const apiNode = new MissionNode({
      id: "node_04_backend_api",
      type: "BACKEND_API",
      title: "Build RESTful API & Auth",
      description: "Implement PBKDF2 cryptography, JWT tokens, RBAC permissions, and CRUD route endpoints.",
      dependencies: ["node_02_architecture"],
      ownerAgent: "Backend Engineer",
      requiredCapabilities: ["node-http", "crypto-auth", "rbac"],
      modelPreference,
      inputs: { targetAppDir }
    });
    graph.addNode(apiNode);
    graph.addEdge({ fromNodeId: archNode.id, toNodeId: apiNode.id, edgeType: "DEPENDENCY" });

    // 5. Frontend UI Node (Parallel branch 3)
    const uiNode = new MissionNode({
      id: "node_05_frontend_ui",
      type: "FRONTEND_UI",
      title: "Assemble Glassmorphic UI",
      description: "Render charcoal/gold responsive layout, Kanban board, charts, modals, and dark/light themes.",
      dependencies: ["node_02_architecture"],
      ownerAgent: "UI Engineer",
      requiredCapabilities: ["vanilla-css-tokens", "hardware-accel", "dom-binding"],
      modelPreference,
      inputs: { targetAppDir }
    });
    graph.addNode(uiNode);
    graph.addEdge({ fromNodeId: archNode.id, toNodeId: uiNode.id, edgeType: "DEPENDENCY" });

    // 6. Integration Node (Joins DB, API, UI)
    const integNode = new MissionNode({
      id: "node_06_integration",
      type: "INTEGRATION",
      title: "End-to-End System Integration",
      description: "Wire frontend event handlers to backend REST routes and verify database data flow.",
      dependencies: ["node_03_database", "node_04_backend_api", "node_05_frontend_ui"],
      ownerAgent: "Integration Engineer",
      requiredCapabilities: ["system-integration", "live-wiring"],
      modelPreference,
      inputs: { targetAppDir }
    });
    graph.addNode(integNode);
    graph.addEdge({ fromNodeId: dbNode.id, toNodeId: integNode.id, edgeType: "DEPENDENCY" });
    graph.addEdge({ fromNodeId: apiNode.id, toNodeId: integNode.id, edgeType: "DEPENDENCY" });
    graph.addEdge({ fromNodeId: uiNode.id, toNodeId: integNode.id, edgeType: "DEPENDENCY" });

    // 7. Unit & API Tests Node
    const testNode = new MissionNode({
      id: "node_07_unit_api_tests",
      type: "UNIT_TEST",
      title: "Execute Functional & API QA",
      description: "Run unit test suite, database transactions, auth token validations, and API lifecycle tests.",
      dependencies: ["node_06_integration"],
      ownerAgent: "QA Engineer",
      requiredCapabilities: ["unit-testing", "api-testing"],
      modelPreference,
      inputs: { targetAppDir }
    });
    graph.addNode(testNode);
    graph.addEdge({ fromNodeId: integNode.id, toNodeId: testNode.id, edgeType: "DEPENDENCY" });

    // 8. Security Red-Team Audit Node
    const secNode = new MissionNode({
      id: "node_08_security_audit",
      type: "SECURITY_AUDIT",
      title: "Execute Red-Team Security Attack Suite",
      description: "Launch 20+ adversarial attack vectors: SQLi, XSS, path traversal, IDOR, forged JWTs.",
      dependencies: ["node_06_integration"],
      ownerAgent: "Red Team Security Agent",
      requiredCapabilities: ["adversarial-testing", "vulnerability-scan"],
      modelPreference,
      inputs: { targetAppDir }
    });
    graph.addNode(secNode);
    graph.addEdge({ fromNodeId: integNode.id, toNodeId: secNode.id, edgeType: "DEPENDENCY" });

    // 9. Performance Audit Node
    const perfNode = new MissionNode({
      id: "node_09_performance_audit",
      type: "PERFORMANCE_AUDIT",
      title: "Profile Latency & System Telemetry",
      description: "Measure cold boot time, API latency distribution, DB query latency, and memory RSS footprint.",
      dependencies: ["node_06_integration"],
      ownerAgent: "Performance Engineer",
      requiredCapabilities: ["profiling", "telemetry-collection"],
      modelPreference,
      inputs: { targetAppDir }
    });
    graph.addNode(perfNode);
    graph.addEdge({ fromNodeId: integNode.id, toNodeId: perfNode.id, edgeType: "DEPENDENCY" });

    // 10. Self-Repair / Regression Node
    const repairNode = new MissionNode({
      id: "node_10_repair_regression",
      type: "SELF_REPAIR",
      title: "Verify Self-Healing & Regression Guards",
      description: "Inject simulated boundary defect, verify diagnostic mapping, apply patch, and run regression tests.",
      dependencies: ["node_07_unit_api_tests", "node_08_security_audit"],
      ownerAgent: "DevOps / Reliability Engineer",
      requiredCapabilities: ["self-repair", "regression-testing"],
      modelPreference,
      inputs: { targetAppDir }
    });
    graph.addNode(repairNode);
    graph.addEdge({ fromNodeId: testNode.id, toNodeId: repairNode.id, edgeType: "DEPENDENCY" });
    graph.addEdge({ fromNodeId: secNode.id, toNodeId: repairNode.id, edgeType: "DEPENDENCY" });

    // 11. Human Approval Gate (Optional/Configurable)
    let lastDep = repairNode.id;
    if (requireHumanApprovalForDeploy) {
      const approvalNode = new MissionNode({
        id: "node_11_human_approval",
        type: "HUMAN_APPROVAL",
        title: "Owner Authorization Gate",
        description: "Gate requiring explicit owner approval before containerization or public certification.",
        dependencies: [repairNode.id, perfNode.id],
        ownerAgent: "Owner Control Gate",
        requiredCapabilities: ["owner-control"],
        requiresHumanApproval: true,
        inputs: {}
      });
      graph.addNode(approvalNode);
      graph.addEdge({ fromNodeId: repairNode.id, toNodeId: approvalNode.id, edgeType: "HUMAN_APPROVAL" });
      graph.addEdge({ fromNodeId: perfNode.id, toNodeId: approvalNode.id, edgeType: "HUMAN_APPROVAL" });
      lastDep = approvalNode.id;
    }

    // 12. Evidence & Certification Node
    const certNode = new MissionNode({
      id: "node_12_certification",
      type: "CERTIFICATION",
      title: "Evidence Hashing & Master Reality Certification",
      description: "Collect all test outputs, compute SHA-256 integrity hashes, generate audit reports and certificate.",
      dependencies: [lastDep, perfNode.id],
      ownerAgent: "Release Engineer",
      requiredCapabilities: ["evidence-hashing", "certification-engine"],
      modelPreference,
      inputs: { targetAppDir }
    });
    graph.addNode(certNode);
    graph.addEdge({ fromNodeId: lastDep, toNodeId: certNode.id, edgeType: "DEPENDENCY" });

    return graph;
  }
}
