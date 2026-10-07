/**
 * ANTIGRAVITY OS v7.0 — HERMES AGENT SUBSYSTEM
 * HermesAgent.ts: Autonomous Agent Controller orchestrating the full execution loop
 */

import { HermesSessionManager, HermesSession } from "./HermesSessionManager";
import { HermesPlanner } from "./HermesPlanner";
import { HermesExecutor } from "./HermesExecutor";
import { HermesPermissionManager } from "./HermesPermissionManager";
import { HermesMemory } from "./HermesMemory";
import { HermesObservability } from "./HermesObservability";
import { HermesAutonomyLevel } from "./HermesTypes";

export class HermesAgent {
  private readonly permissionManager: HermesPermissionManager;
  private readonly memory: HermesMemory;

  constructor() {
    this.permissionManager = new HermesPermissionManager();
    this.memory = new HermesMemory();
  }

  public getPermissionManager(): HermesPermissionManager {
    return this.permissionManager;
  }

  public getMemory(): HermesMemory {
    return this.memory;
  }

  /**
   * Executes the full Hermes Core Loop for an objective:
   * OBSERVE -> UNDERSTAND -> PLAN -> DECOMPOSE -> ROUTE -> SANDBOX EXECUTE -> OBSERVE -> CRITIQUE -> REPAIR -> VERIFY -> EVIDENCE -> REALITY -> PROMOTE / ROLLBACK
   */
  public async runObjective(
    objective: string,
    autonomyLevel: HermesAutonomyLevel = 2
  ): Promise<HermesSession> {
    const session = HermesSessionManager.createSession(objective, autonomyLevel);
    this.permissionManager.setAutonomyLevel(autonomyLevel);

    HermesSessionManager.addTimelineEvent(session, "OBSERVE", `Received objective: "${objective}"`);

    // 1. Plan & Decompose DAG
    HermesSessionManager.addTimelineEvent(session, "PLAN", "Decomposing objective into task DAG");
    const taskGraph = HermesPlanner.planObjective(objective, session.sessionId);
    session.taskGraph = taskGraph;

    // 2. Sequential / DAG Execution
    let executableTasks = taskGraph.getExecutableTasks();

    while (executableTasks.length > 0) {
      if (this.permissionManager.isEmergencyStopped()) {
        HermesSessionManager.addTimelineEvent(session, "EMERGENCY_STOP", "Execution halted by Emergency Stop", "WARNING");
        session.status = "EMERGENCY_STOPPED";
        break;
      }

      for (const task of executableTasks) {
        taskGraph.updateTaskStatus(task.id, "RUNNING");
        HermesSessionManager.addTimelineEvent(session, "EXECUTE", `Executing task ${task.id} (${task.objective})`);

        const execContext = {
          sessionId: session.sessionId,
          taskId: task.id,
          sandboxDir: task.sandbox,
          autonomyLevel: this.permissionManager.getAutonomyLevel(),
          isEmergencyStopped: this.permissionManager.isEmergencyStopped(),
          tokenBudgetRemaining: 500000,
          auditTrail: session.timeline
        };

        const result = await HermesExecutor.executeTask(task, execContext);

        if (result.status === "PASSED") {
          taskGraph.updateTaskStatus(task.id, "PASSED", {
            outputs: typeof result.output === "object" && result.output !== null ? (result.output as Record<string, unknown>) : { value: result.output },
            evidenceIds: result.evidenceId ? [result.evidenceId] : []
          });
          HermesSessionManager.addTimelineEvent(session, "VERIFIED", `Task ${task.id} passed reality & evidence check`, "SUCCESS");
          HermesObservability.recordTaskCompletion(25, true);
        } else if (result.status === "ROLLED_BACK") {
          taskGraph.updateTaskStatus(task.id, "ROLLED_BACK", { failureReason: result.error });
          HermesSessionManager.addTimelineEvent(session, "ROLLBACK", `Task ${task.id} rolled back to checkpoint: ${result.error}`, "WARNING");
          HermesObservability.recordTaskCompletion(30, false);
        } else {
          taskGraph.updateTaskStatus(task.id, "FAILED", { failureReason: result.error });
          HermesSessionManager.addTimelineEvent(session, "FAILURE", `Task ${task.id} failed: ${result.error}`, "ERROR");
          HermesObservability.recordTaskCompletion(30, false);
        }
      }

      // Check next round of tasks ready for execution
      executableTasks = taskGraph.getExecutableTasks();
    }

    const progress = taskGraph.getProgress();
    if (progress.failed === 0 && progress.passed > 0) {
      session.status = "COMPLETED";
      HermesSessionManager.addTimelineEvent(session, "COMPLETE", "All DAG tasks completed and verified", "SUCCESS");
    } else if (session.status !== "EMERGENCY_STOPPED") {
      session.status = "FAILED";
      HermesSessionManager.addTimelineEvent(session, "INCOMPLETE", `DAG execution ended with ${progress.failed} failures`, "ERROR");
    }

    return session;
  }
}
