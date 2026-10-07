/**
 * ANTIGRAVITY OS v7.0 — HERMES AGENT SUBSYSTEM
 * HermesTaskGraph.ts: Directed Acyclic Graph (DAG) Task Engine with Cycle & Loop Protection
 */

import { HermesTaskNode, HermesTaskStatus } from "./HermesTypes";

export class HermesTaskGraph {
  private readonly nodes: Map<string, HermesTaskNode> = new Map();

  public addTask(task: Omit<HermesTaskNode, "createdAt" | "updatedAt">): HermesTaskNode {
    const fullNode: HermesTaskNode = {
      ...task,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Check for direct self dependency
    if (fullNode.dependencies.includes(fullNode.id)) {
      throw new Error(`DAG_CYCLE_DETECTED: Task ${fullNode.id} cannot depend on itself`);
    }

    this.nodes.set(fullNode.id, fullNode);
    this.detectCycles(); // Ensure graph remains acyclic
    return fullNode;
  }

  public getTask(taskId: string): HermesTaskNode | undefined {
    return this.nodes.get(taskId);
  }

  public getAllTasks(): HermesTaskNode[] {
    return Array.from(this.nodes.values());
  }

  public updateTaskStatus(
    taskId: string,
    status: HermesTaskStatus,
    extra?: Partial<HermesTaskNode>
  ): HermesTaskNode {
    const task = this.nodes.get(taskId);
    if (!task) throw new Error(`TASK_NOT_FOUND: ${taskId}`);

    task.status = status;
    task.updatedAt = new Date().toISOString();
    if (extra) {
      Object.assign(task, extra);
    }
    return task;
  }

  /**
   * Returns tasks in topological order ready for execution
   */
  public getExecutableTasks(): HermesTaskNode[] {
    const executable: HermesTaskNode[] = [];

    for (const task of this.nodes.values()) {
      if (task.status === "PENDING" || task.status === "PLANNED") {
        const depsSatisfied = task.dependencies.every((depId) => {
          const dep = this.nodes.get(depId);
          return dep && dep.status === "PASSED";
        });

        if (depsSatisfied) {
          executable.push(task);
        }
      }
    }

    return executable;
  }

  /**
   * Kahn's algorithm or DFS cycle detector
   */
  public detectCycles(): boolean {
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      recStack.add(nodeId);

      const node = this.nodes.get(nodeId);
      if (node) {
        for (const depId of node.dependencies) {
          if (!visited.has(depId)) {
            if (dfs(depId)) return true;
          } else if (recStack.has(depId)) {
            return true; // Cycle detected
          }
        }
      }

      recStack.delete(nodeId);
      return false;
    };

    for (const nodeId of this.nodes.keys()) {
      if (!visited.has(nodeId)) {
        if (dfs(nodeId)) {
          throw new Error("DAG_CYCLE_DETECTED: Graph contains circular task dependencies");
        }
      }
    }

    return false;
  }

  /**
   * Returns execution progress metrics
   */
  public getProgress(): {
    total: number;
    passed: number;
    failed: number;
    running: number;
    pending: number;
    isComplete: boolean;
  } {
    const tasks = Array.from(this.nodes.values());
    const passed = tasks.filter((t) => t.status === "PASSED" || t.status === "PROMOTED").length;
    const failed = tasks.filter((t) => t.status === "FAILED" || t.status === "REJECTED").length;
    const running = tasks.filter((t) => t.status === "RUNNING" || t.status === "VERIFYING").length;
    const pending = tasks.filter((t) => t.status === "PENDING" || t.status === "PLANNED").length;

    return {
      total: tasks.length,
      passed,
      failed,
      running,
      pending,
      isComplete: tasks.length > 0 && passed + failed === tasks.length
    };
  }
}
