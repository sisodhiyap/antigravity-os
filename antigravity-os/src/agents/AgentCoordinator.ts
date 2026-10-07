/**
 * ANTIGRAVITY OS v5.3 — AGENT COORDINATOR
 * AgentCoordinator: Coordinates multi-agent structured artifact pipelines & handoffs
 */

import { AgentGraph, SpecialistAgent, AgentArtifactPayload } from "./AgentGraph";

export class AgentCoordinator {
  private readonly artifacts: Map<string, AgentArtifactPayload[]> = new Map();

  public submitArtifact(payload: AgentArtifactPayload) {
    const list = this.artifacts.get(payload.taskId) || [];
    list.push(payload);
    this.artifacts.set(payload.taskId, list);
  }

  public getArtifactsForTask(taskId: string): AgentArtifactPayload[] {
    return this.artifacts.get(taskId) || [];
  }

  public routeTaskToAgent(agentRole: string): SpecialistAgent {
    const agent = AgentGraph.getAgentById(agentRole);
    if (!agent) {
      // Return Backend Engineer as default fallback
      return AgentGraph.SPECIALIST_ROSTER[3];
    }
    return agent;
  }
}
