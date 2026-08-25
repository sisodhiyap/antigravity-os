/**
 * ANTIGRAVITY LEVEL-5 EVIDENCE GRAPH & TRACEABILITY ENGINE
 *
 * Implements a permanent, cryptographic evidence lineage graph connecting:
 * REQUIREMENT -> SPEC -> UX -> ARCHITECTURE -> CODE -> TEST -> SECURITY -> RELEASE -> DEPLOYMENT -> INCIDENT -> POSTMORTEM
 */

export type EvidenceNodeType =
  | "REQUIREMENT"
  | "SPEC"
  | "UX_DECISION"
  | "ARCHITECTURE"
  | "CODE_CHANGE"
  | "TEST"
  | "SECURITY"
  | "ARTIFACT"
  | "RELEASE"
  | "DEPLOYMENT"
  | "INCIDENT"
  | "REMEDIATION"
  | "POSTMORTEM";

export type EvidenceEdgeType =
  | "DERIVED_FROM"
  | "IMPLEMENTS"
  | "VALIDATES"
  | "DEPENDS_ON"
  | "DEPLOYED_AS"
  | "CAUSED_BY"
  | "REMEDIATES"
  | "SUPERSEDES";

export interface EvidenceNode {
  nodeId: string;
  type: EvidenceNodeType;
  title: string;
  projectId: string;
  workspaceId: string;
  taskId?: string;
  source: "USER" | "AI" | "SYSTEM" | "TEST" | "SECURITY" | "OPERATOR";
  checksum: string;
  confidence: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface EvidenceEdge {
  edgeId: string;
  sourceNodeId: string;
  targetNodeId: string;
  relation: EvidenceEdgeType;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export class EvidenceGraph {
  private static instance: EvidenceGraph;
  private nodes: Map<string, EvidenceNode> = new Map();
  private edges: EvidenceEdge[] = [];

  private constructor() {
    this.seedBaselineNodes();
  }

  public static getInstance(): EvidenceGraph {
    if (!EvidenceGraph.instance) {
      EvidenceGraph.instance = new EvidenceGraph();
    }
    return EvidenceGraph.instance;
  }

  private seedBaselineNodes() {
    const rootReq: EvidenceNode = {
      nodeId: "ev_node_root_req",
      type: "REQUIREMENT",
      title: "Antigravity Autonomous Software Factory Core Architecture",
      projectId: "global",
      workspaceId: "global",
      source: "USER",
      checksum: "0000000000000000000000000000000000000000000000000000000000000000",
      confidence: 1.0,
      createdAt: new Date().toISOString(),
    };
    this.nodes.set(rootReq.nodeId, rootReq);
  }

  public addNode(node: Omit<EvidenceNode, "createdAt">): EvidenceNode {
    const fullNode: EvidenceNode = {
      ...node,
      createdAt: new Date().toISOString(),
    };
    this.nodes.set(fullNode.nodeId, fullNode);
    return fullNode;
  }

  public addEdge(
    sourceNodeId: string,
    targetNodeId: string,
    relation: EvidenceEdgeType,
    metadata?: Record<string, unknown>
  ): EvidenceEdge {
    const edgeId = `edge_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const edge: EvidenceEdge = {
      edgeId,
      sourceNodeId,
      targetNodeId,
      relation,
      metadata,
      createdAt: new Date().toISOString(),
    };
    this.edges.push(edge);
    return edge;
  }

  public getNode(nodeId: string): EvidenceNode | undefined {
    return this.nodes.get(nodeId);
  }

  public listNodes(projectId?: string): EvidenceNode[] {
    const all = Array.from(this.nodes.values());
    if (projectId) return all.filter((n) => n.projectId === projectId || n.projectId === "global");
    return all;
  }

  public listEdges(): EvidenceEdge[] {
    return this.edges;
  }

  /**
   * Traceability query: "Why does this code/artifact exist?"
   * Traverses backward through DERIVED_FROM and IMPLEMENTS edges to find the root REQUIREMENT.
   */
  public traceWhyCodeExists(nodeId: string): EvidenceNode[] {
    const lineage: EvidenceNode[] = [];
    const visited = new Set<string>();

    const traverse = (currentId: string) => {
      if (visited.has(currentId)) return;
      visited.add(currentId);

      const node = this.nodes.get(currentId);
      if (node) lineage.push(node);

      // Find edges where currentId is the source
      const incoming = this.edges.filter(
        (e) =>
          e.sourceNodeId === currentId &&
          (e.relation === "DERIVED_FROM" || e.relation === "IMPLEMENTS" || e.relation === "DEPENDS_ON")
      );

      for (const edge of incoming) {
        traverse(edge.targetNodeId);
      }
    };

    traverse(nodeId);
    return lineage;
  }

  /**
   * Traceability query: "Which tests validate this requirement?"
   */
  public getTestsForRequirement(reqNodeId: string): EvidenceNode[] {
    const tests: EvidenceNode[] = [];
    const visited = new Set<string>();

    // Find all nodes that derive from or implement this requirement
    const downstreamNodes = new Set<string>([reqNodeId]);
    for (const edge of this.edges) {
      if (edge.targetNodeId === reqNodeId) {
        downstreamNodes.add(edge.sourceNodeId);
      }
    }

    // Find TEST nodes that VALIDATE any of the downstream nodes
    for (const edge of this.edges) {
      if (edge.relation === "VALIDATES" && downstreamNodes.has(edge.targetNodeId)) {
        const testNode = this.nodes.get(edge.sourceNodeId);
        if (testNode && testNode.type === "TEST" && !visited.has(testNode.nodeId)) {
          visited.add(testNode.nodeId);
          tests.push(testNode);
        }
      }
    }

    return tests;
  }
}

export const evidenceGraph = EvidenceGraph.getInstance();
