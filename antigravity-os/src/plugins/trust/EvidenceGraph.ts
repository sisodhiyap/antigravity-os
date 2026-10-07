/**
 * ANTIGRAVITY OS v7.0 — FACT-BASED INTELLIGENCE + SECURITY FABRIC
 * EvidenceGraph.ts: Topological knowledge, source, and empirical evidence relationship graph
 */

import { EvidenceNode, EvidenceEdge, EvidenceNodeType, EvidenceEdgeType } from "./TrustTypes";

export class EvidenceGraph {
  private static instance: EvidenceGraph;
  private readonly nodes: Map<string, EvidenceNode> = new Map();
  private readonly edges: Map<string, EvidenceEdge> = new Map();

  public static getInstance(): EvidenceGraph {
    if (!EvidenceGraph.instance) {
      EvidenceGraph.instance = new EvidenceGraph();
    }
    return EvidenceGraph.instance;
  }

  public addNode(id: string, type: EvidenceNodeType, label: string, metadata: Record<string, unknown> = {}): EvidenceNode {
    const existing = this.nodes.get(id);
    if (existing) return existing;

    const node: EvidenceNode = {
      id,
      type,
      label,
      metadata,
      createdAt: Date.now()
    };
    this.nodes.set(id, node);
    return node;
  }

  public addEdge(fromId: string, toId: string, type: EvidenceEdgeType, weight: number = 1.0, metadata?: Record<string, unknown>): EvidenceEdge {
    const edgeId = `${fromId}_${type}_${toId}`;
    const existing = this.edges.get(edgeId);
    if (existing) return existing;

    // Verify nodes exist or create placeholders
    if (!this.nodes.has(fromId)) {
      this.addNode(fromId, "EXTERNAL_REFERENCE", `Auto-Node ${fromId}`);
    }
    if (!this.nodes.has(toId)) {
      this.addNode(toId, "EXTERNAL_REFERENCE", `Auto-Node ${toId}`);
    }

    const edge: EvidenceEdge = {
      id: edgeId,
      fromId,
      toId,
      type,
      weight,
      metadata,
      createdAt: Date.now()
    };
    this.edges.set(edgeId, edge);
    return edge;
  }

  public getNode(id: string): EvidenceNode | undefined {
    return this.nodes.get(id);
  }

  public getAllNodes(): EvidenceNode[] {
    return Array.from(this.nodes.values());
  }

  public getAllEdges(): EvidenceEdge[] {
    return Array.from(this.edges.values());
  }

  /**
   * Retrieves the full provenance lineage trace for a given node (upstream ancestors)
   */
  public getProvenanceLineage(nodeId: string, maxDepth: number = 10): Array<{ node: EvidenceNode; edge: EvidenceEdge; depth: number }> {
    const lineage: Array<{ node: EvidenceNode; edge: EvidenceEdge; depth: number }> = [];
    const visited = new Set<string>();

    const dfs = (currentId: string, currentDepth: number) => {
      if (currentDepth > maxDepth || visited.has(currentId)) return;
      visited.add(currentId);

      const incomingEdges = Array.from(this.edges.values()).filter((e) => e.toId === currentId);
      for (const edge of incomingEdges) {
        const sourceNode = this.nodes.get(edge.fromId);
        if (sourceNode) {
          lineage.push({ node: sourceNode, edge, depth: currentDepth });
          dfs(sourceNode.id, currentDepth + 1);
        }
      }
    };

    dfs(nodeId, 1);
    return lineage;
  }

  /**
   * Returns all supporting evidence nodes for a claim
   */
  public getSupportingEvidence(claimId: string): EvidenceNode[] {
    const supportEdges = Array.from(this.edges.values()).filter(
      (e) => e.toId === claimId && (e.type === "SUPPORTS" || e.type === "VERIFIED_BY" || e.type === "OBSERVED_IN")
    );
    return supportEdges.map((e) => this.nodes.get(e.fromId)!).filter(Boolean);
  }

  /**
   * Returns all contradicting evidence nodes for a claim
   */
  public getContradictingEvidence(claimId: string): EvidenceNode[] {
    const contradictEdges = Array.from(this.edges.values()).filter(
      (e) => (e.toId === claimId || e.fromId === claimId) && e.type === "CONTRADICTS"
    );
    return contradictEdges.map((e) => {
      const otherId = e.toId === claimId ? e.fromId : e.toId;
      return this.nodes.get(otherId)!;
    }).filter(Boolean);
  }

  public exportGraphJSON(): { nodes: EvidenceNode[]; edges: EvidenceEdge[]; stats: { totalNodes: number; totalEdges: number } } {
    const nodes = this.getAllNodes();
    const edges = this.getAllEdges();
    return {
      nodes,
      edges,
      stats: {
        totalNodes: nodes.length,
        totalEdges: edges.length
      }
    };
  }
}
