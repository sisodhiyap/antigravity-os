/**
 * ANTIGRAVITY OS v5.3 — GRAPH ENGINEERING ENGINE
 * MissionGraph: Direct Acyclic Graph Execution & Dependency Management Engine
 */

import { MissionNode, NodeEdge, NodeStatus } from "./MissionNode";

export class MissionGraph {
  public readonly id: string;
  public readonly missionId: string;
  public readonly nodes: Map<string, MissionNode> = new Map();
  public readonly edges: NodeEdge[] = [];
  public createdAt: string = new Date().toISOString();
  public updatedAt: string = new Date().toISOString();

  constructor(id: string, missionId: string) {
    this.id = id;
    this.missionId = missionId;
  }

  public addNode(node: MissionNode): this {
    if (this.nodes.has(node.id)) {
      throw new Error(`Node with id ${node.id} already exists in graph ${this.id}`);
    }
    this.nodes.set(node.id, node);
    this.updatedAt = new Date().toISOString();
    return this;
  }

  public addEdge(edge: NodeEdge): this {
    if (!this.nodes.has(edge.fromNodeId)) {
      throw new Error(`Edge source node ${edge.fromNodeId} does not exist`);
    }
    if (!this.nodes.has(edge.toNodeId)) {
      throw new Error(`Edge target node ${edge.toNodeId} does not exist`);
    }
    this.edges.push(edge);
    this.updatedAt = new Date().toISOString();
    return this;
  }

  public getNode(nodeId: string): MissionNode | undefined {
    return this.nodes.get(nodeId);
  }

  public getAllNodes(): MissionNode[] {
    return Array.from(this.nodes.values());
  }

  public getResolvedNodeIds(): Set<string> {
    const resolved = new Set<string>();
    for (const [id, node] of this.nodes.entries()) {
      if (node.status === "SUCCESS" || node.status === "VERIFIED" || node.status === "REPAIRED" || node.status === "SKIPPED") {
        resolved.add(id);
      }
    }
    return resolved;
  }

  public getReadyNodes(): MissionNode[] {
    const resolved = this.getResolvedNodeIds();
    const ready: MissionNode[] = [];

    for (const node of this.nodes.values()) {
      if (node.status === "PENDING" || node.status === "WAITING") {
        if (node.isReady(resolved)) {
          ready.push(node);
        }
      }
    }
    return ready;
  }

  public getActiveNodes(): MissionNode[] {
    return Array.from(this.nodes.values()).filter(
      (n) => n.status === "RUNNING" || n.status === "RETRYING"
    );
  }

  public hasPendingWork(): boolean {
    for (const node of this.nodes.values()) {
      if (
        node.status === "PENDING" ||
        node.status === "READY" ||
        node.status === "RUNNING" ||
        node.status === "RETRYING" ||
        node.status === "WAITING"
      ) {
        return true;
      }
    }
    return false;
  }

  public hasFailures(): boolean {
    return Array.from(this.nodes.values()).some((n) => n.status === "FAILED" || n.status === "ESCALATED");
  }

  public isComplete(): boolean {
    return !this.hasPendingWork();
  }

  /**
   * Topological sorting with cycle detection
   */
  public getTopologicalOrder(): string[] {
    const inDegree = new Map<string, number>();
    const adj = new Map<string, string[]>();

    for (const id of this.nodes.keys()) {
      inDegree.set(id, 0);
      adj.set(id, []);
    }

    for (const node of this.nodes.values()) {
      for (const depId of node.dependencies) {
        if (this.nodes.has(depId)) {
          adj.get(depId)!.push(node.id);
          inDegree.set(node.id, (inDegree.get(node.id) || 0) + 1);
        }
      }
    }

    const queue: string[] = [];
    for (const [id, deg] of inDegree.entries()) {
      if (deg === 0) queue.push(id);
    }

    const order: string[] = [];
    while (queue.length > 0) {
      const u = queue.shift()!;
      order.push(u);

      for (const v of adj.get(u) || []) {
        inDegree.set(v, inDegree.get(v)! - 1);
        if (inDegree.get(v) === 0) queue.push(v);
      }
    }

    if (order.length !== this.nodes.size) {
      throw new Error(`Graph ${this.id} contains a cyclic dependency loop!`);
    }

    return order;
  }

  public toJSON() {
    return {
      id: this.id,
      missionId: this.missionId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      totalNodes: this.nodes.size,
      totalEdges: this.edges.length,
      resolvedNodes: this.getResolvedNodeIds().size,
      nodes: Array.from(this.nodes.values()).map((n) => n.toJSON()),
      edges: this.edges
    };
  }
}
