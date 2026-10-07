/**
 * ANTIGRAVITY OS v5.3 — MISSION EXECUTOR
 * MissionExecutor: Concurrent DAG execution worker with resource limits & self-healing
 */

import { MissionGraph } from "./MissionGraph";
import { MissionNode, NodeStatus } from "./MissionNode";
import { MissionState } from "./MissionState";

export interface ExecutionOptions {
  maxConcurrency?: number;
  autoApproveHumanGates?: boolean;
  onNodeStart?: (node: MissionNode) => void;
  onNodeComplete?: (node: MissionNode) => void;
  onNodeFail?: (node: MissionNode, error: any) => void;
}

export class MissionExecutor {
  private isPaused: boolean = false;
  private isStopped: boolean = false;

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    this.isPaused = false;
  }

  public stop() {
    this.isStopped = true;
  }

  public async executeGraph(
    graph: MissionGraph,
    state: MissionState,
    options: ExecutionOptions = {}
  ): Promise<{ success: boolean; graph: MissionGraph; state: MissionState }> {
    const maxConcurrency = options.maxConcurrency || 3;
    const autoApprove = !!options.autoApproveHumanGates;

    state.transition("EXECUTION_STARTED", "Mission graph execution started");

    while (graph.hasPendingWork() && !this.isStopped) {
      if (this.isPaused) {
        state.transition("MISSION_PAUSED", "Mission execution is paused by operator");
        await new Promise((r) => setTimeout(r, 200));
        continue;
      }

      const activeNodes = graph.getActiveNodes();
      if (activeNodes.length >= maxConcurrency) {
        await new Promise((r) => setTimeout(r, 50));
        continue;
      }

      const readyNodes = graph.getReadyNodes();
      if (readyNodes.length === 0 && activeNodes.length === 0) {
        // No ready nodes and none running: check if blocked on human approval or failed
        const waitingApproval = graph.getAllNodes().find((n) => n.requiresHumanApproval && n.status === "WAITING");
        if (waitingApproval) {
          state.transition("TASKS_RUNNING", `Waiting for human owner approval on node ${waitingApproval.id}`);
          if (autoApprove) {
            waitingApproval.status = "SUCCESS";
            state.addEvent("TASKS_RUNNING", `Human approval auto-granted for ${waitingApproval.id}`);
            continue;
          }
          break;
        }

        if (graph.hasFailures()) {
          state.transition("MISSION_FAILED", "Mission graph has unrecoverable failed nodes");
          return { success: false, graph, state };
        }
        break;
      }

      // Launch available ready nodes up to concurrency limit
      const availableSlots = maxConcurrency - activeNodes.length;
      const nodesToRun = readyNodes.slice(0, availableSlots);

      for (const node of nodesToRun) {
        if (node.requiresHumanApproval && !autoApprove) {
          node.status = "WAITING";
          state.addEvent("TASKS_RUNNING", `Node ${node.id} is waiting for human owner approval`);
          continue;
        }

        // Run node asynchronously
        this.runSingleNode(node, graph, state, options);
      }

      await new Promise((r) => setTimeout(r, 50));
    }

    const hasFailures = graph.hasFailures();
    if (hasFailures) {
      state.transition("MISSION_FAILED", "Mission completed with failures");
      return { success: false, graph, state };
    }

    state.transition("MISSION_COMPLETE", "All graph nodes executed successfully");
    return { success: true, graph, state };
  }

  private async runSingleNode(
    node: MissionNode,
    graph: MissionGraph,
    state: MissionState,
    options: ExecutionOptions
  ) {
    node.status = "RUNNING";
    state.addEvent("TASKS_RUNNING", `Node ${node.id} (${node.title}) started by ${node.ownerAgent}`, node.id);
    options.onNodeStart?.(node);

    const t0 = Date.now();
    try {
      let result = {};
      if (node.handler) {
        result = await node.handler(node.inputs, { graph, state });
      } else {
        // Default simulated work if no custom handler attached
        await new Promise((r) => setTimeout(r, 60));
        result = { executed: true, timestamp: new Date().toISOString() };
      }

      const latencyMs = Date.now() - t0;
      node.recordSuccess(result, latencyMs, {
        timestamp: new Date().toISOString(),
        assertionsPassed: 1,
        metrics: { latencyMs }
      });

      state.addEvent("TASKS_RUNNING", `Node ${node.id} succeeded in ${latencyMs}ms`, node.id);
      options.onNodeComplete?.(node);
    } catch (err: any) {
      const latencyMs = Date.now() - t0;
      const errorMsg = err?.message || String(err);
      node.recordFailure(errorMsg, "EXECUTION_ERROR");

      state.addEvent("REPAIR", `Node ${node.id} failed: ${errorMsg}. Attempting retry ${node.retryCount}/${node.maxRetries}`, node.id);
      options.onNodeFail?.(node, err);

      // If retry limit reached, mark as failed
      if ((node.status as NodeStatus) === "FAILED") {
        state.addEvent("MISSION_FAILED", `Node ${node.id} exhausted all ${node.maxRetries} retries`, node.id);
      }
    }
  }
}
