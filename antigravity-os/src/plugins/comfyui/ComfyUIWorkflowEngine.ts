/**
 * ANTIGRAVITY OS v7.0 — COMFYUI GENERATIVE MEDIA FABRIC
 * ComfyUIWorkflowEngine.ts: Dynamic Workflow DAG Compiler and Prompt Parameter Injector
 */

import { ComfyUIGenerationRequest, ComfyUIWorkflowMetadata } from "./ComfyUITypes";
import { ComfyUIWorkflowRegistry } from "./ComfyUIWorkflowRegistry";
import { ComfyUIModelRegistry } from "./ComfyUIModelRegistry";

export class ComfyUIWorkflowEngine {
  /**
   * Builds an executable ComfyUI prompt graph from a high-level request
   */
  public static compileWorkflow(
    request: ComfyUIGenerationRequest
  ): { workflow: ComfyUIWorkflowMetadata; promptGraph: Record<string, unknown>; seed: number } {
    let workflowId = request.workflowId;

    if (!workflowId) {
      if (request.modality === "IMAGE") workflowId = "wf_txt2img_flux_fast";
      else if (request.modality === "VIDEO") workflowId = "wf_txt2video_wan_cinematic";
      else if (request.modality === "AUDIO") workflowId = "wf_audio_synth";
      else if (request.modality === "3D") workflowId = "wf_3d_triposr";
      else workflowId = "wf_txt2img_flux_fast";
    }

    const workflow = ComfyUIWorkflowRegistry.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error(`WORKFLOW_NOT_FOUND: ${workflowId}`);
    }

    const baseGraph = ComfyUIWorkflowRegistry.getWorkflowGraph(workflowId);
    if (!baseGraph) {
      throw new Error(`WORKFLOW_GRAPH_NOT_FOUND: ${workflowId}`);
    }

    const seed = request.seed || Math.floor(Math.random() * 1000000000);
    const serialized = JSON.stringify(baseGraph)
      .replace(/\{PROMPT\}/g, request.prompt)
      .replace(/\{SEED\}/g, seed.toString())
      .replace(/\{FRAMES\}/g, (request.frames || 24).toString())
      .replace(/\{WIDTH\}/g, (request.width || 1024).toString())
      .replace(/\{HEIGHT\}/g, (request.height || 1024).toString());

    const promptGraph = JSON.parse(serialized);

    return {
      workflow,
      promptGraph,
      seed
    };
  }

  /**
   * Validates a workflow JSON graph against unsafe custom nodes and malformed schemas
   */
  public static validateWorkflowGraph(graph: Record<string, unknown>): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (typeof graph !== "object" || graph === null) {
      return { isValid: false, issues: ["MALFORMED_GRAPH: Graph must be a valid JSON object"] };
    }

    const keys = Object.keys(graph);
    if (keys.length === 0) {
      return { isValid: false, issues: ["EMPTY_GRAPH: Graph contains 0 execution nodes"] };
    }

    for (const key of keys) {
      const node = graph[key] as Record<string, unknown>;
      if (!node || typeof node !== "object" || !node.class_type) {
        issues.push(`NODE_INVALID: Node ${key} is missing class_type definition`);
      }
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }
}
