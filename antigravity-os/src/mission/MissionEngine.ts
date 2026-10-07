/**
 * ANTIGRAVITY OS v5.3 — MISSION ENGINE
 * MissionEngine: Master Coordinator for Autonomous Engineering Intelligence
 */

import { MissionGraph } from "./MissionGraph";
import { MissionPlanner, PlanOptions } from "./MissionPlanner";
import { MissionState, ResourceBudget } from "./MissionState";
import { MissionExecutor, ExecutionOptions } from "./MissionExecutor";

export interface CreateMissionRequest {
  id?: string;
  prompt: string;
  targetAppDir: string;
  budget?: Partial<ResourceBudget>;
  requireHumanApproval?: boolean;
  modelPreference?: string;
}

export class MissionEngine {
  private static instance: MissionEngine;
  private readonly missions: Map<string, { graph: MissionGraph; state: MissionState }> = new Map();
  private readonly executor: MissionExecutor = new MissionExecutor();

  public static getInstance(): MissionEngine {
    if (!MissionEngine.instance) {
      MissionEngine.instance = new MissionEngine();
    }
    return MissionEngine.instance;
  }

  public createMission(req: CreateMissionRequest): { missionId: string; graph: MissionGraph; state: MissionState } {
    const missionId = req.id || `msn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const state = new MissionState(missionId, req.budget);
    
    state.transition("REQUIREMENTS_ANALYZED", "Analyzing mission prompt specifications");
    const graph = MissionPlanner.buildStandardEngineeringGraph({
      missionId,
      prompt: req.prompt,
      targetAppDir: req.targetAppDir,
      requireHumanApprovalForDeploy: req.requireHumanApproval !== undefined ? req.requireHumanApproval : false,
      modelPreference: req.modelPreference
    });

    state.transition("GRAPH_BUILT", `Constructed DAG graph with ${graph.getAllNodes().length} nodes and ${graph.edges.length} edges`);
    this.missions.set(missionId, { graph, state });

    return { missionId, graph, state };
  }

  public getMission(missionId: string): { graph: MissionGraph; state: MissionState } | undefined {
    return this.missions.get(missionId);
  }

  public getAllMissions(): Array<{ missionId: string; state: any; graph: any }> {
    return Array.from(this.missions.entries()).map(([id, m]) => ({
      missionId: id,
      state: m.state.toJSON(),
      graph: m.graph.toJSON()
    }));
  }

  public async startMission(
    missionId: string,
    options: ExecutionOptions = {}
  ): Promise<{ success: boolean; graph: MissionGraph; state: MissionState }> {
    const mission = this.missions.get(missionId);
    if (!mission) {
      throw new Error(`Mission ${missionId} not found`);
    }

    return this.executor.executeGraph(mission.graph, mission.state, options);
  }

  public pauseMission(missionId: string) {
    this.executor.pause();
    const m = this.missions.get(missionId);
    if (m) m.state.transition("MISSION_PAUSED", "Mission paused by operator");
  }

  public resumeMission(missionId: string) {
    this.executor.resume();
    const m = this.missions.get(missionId);
    if (m) m.state.transition("TASKS_RUNNING", "Mission resumed by operator");
  }

  public stopMission(missionId: string) {
    this.executor.stop();
    const m = this.missions.get(missionId);
    if (m) m.state.transition("MISSION_FAILED", "Mission stopped by operator");
  }

  public approveNode(missionId: string, nodeId: string): boolean {
    const mission = this.missions.get(missionId);
    if (!mission) return false;

    const node = mission.graph.getNode(nodeId);
    if (!node || node.status !== "WAITING") return false;

    node.status = "SUCCESS";
    mission.state.addEvent("TASKS_RUNNING", `Operator approved node ${nodeId}`);
    return true;
  }
}
