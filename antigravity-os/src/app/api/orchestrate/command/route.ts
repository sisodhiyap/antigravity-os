import { NextRequest } from "next/server";
import { authenticateRequest } from "@/server/auth-helper";
import { aiGateway } from "@/server/multimodal/gateway";
import { websiteFactoryOrchestrator } from "@/server/factory/factory-orchestrator";
import { agentSwarm } from "@/server/swarm/agent-swarm";
import { TaskOrchestrator } from "@/server/orchestrator/task-orchestrator";
import { deploymentManager } from "@/server/factory/deployment-manager";

const taskOrchestrator = TaskOrchestrator.getInstance();

export const dynamic = "force-dynamic";

type CommandIntent =
  | "BUILD_WEBSITE"
  | "GENERATE_IMAGE"
  | "GENERATE_VIDEO"
  | "GENERATE_AUDIO"
  | "RUN_CERTIFICATION"
  | "DEPLOY"
  | "FIX_ERRORS"
  | "ADD_AI_FEATURE"
  | "UNKNOWN";

function classifyIntent(input: string): CommandIntent {
  const lower = input.toLowerCase();
  if (/build.*website|create.*site|make.*page|landing page|portfolio site/.test(lower)) return "BUILD_WEBSITE";
  if (/generat.*image|creat.*image|make.*image|hero image/.test(lower)) return "GENERATE_IMAGE";
  if (/generat.*video|creat.*video|cinematic|hero video/.test(lower)) return "GENERATE_VIDEO";
  if (/generat.*audio|voiceover|synthesize speech/.test(lower)) return "GENERATE_AUDIO";
  if (/certif|run test|run audit|verify platform/.test(lower)) return "RUN_CERTIFICATION";
  if (/deploy|push.*github|vercel|netlify/.test(lower)) return "DEPLOY";
  if (/fix.*error|repair|debug/.test(lower)) return "FIX_ERRORS";
  if (/add.*ai|ai chat|chatbot|rag/.test(lower)) return "ADD_AI_FEATURE";
  return "UNKNOWN";
}

/**
 * POST /api/orchestrate/command
 * Universal natural language command router — the heart of the Antigravity OS product.
 *
 * The operator sends any instruction such as "Build me a portfolio website"
 * and this endpoint routes it to the correct subsystem.
 */
export async function POST(req: NextRequest) {
  const start = performance.now();

  try {
    const session = await authenticateRequest(req);
    const body = await req.json();
    const command = body.command || body.prompt;
    const context = body.context;

    if (!command || typeof command !== "string") {
      return Response.json(
        { success: false, error: "command or prompt string is required" },
        { status: 400 }
      );
    }

    const intent = classifyIntent(command);
    const requestId = `cmd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    let result: Record<string, unknown> = {};

    switch (intent) {
      case "BUILD_WEBSITE": {
        // Extract name from context or derive from prompt
        const name = context?.name || `project_${Date.now()}`;
        const theme = context?.theme || "cyber";
        const type = context?.type || "landing";

        const buildResult = await websiteFactoryOrchestrator.buildWebsite({
          name,
          type,
          prompt: command,
          theme,
        });

        result = {
          intent,
          action: "Website generation pipeline executed",
          projectName: buildResult.projectName,
          url: buildResult.url,
          codePath: buildResult.codePath,
          timestamp: buildResult.timestamp,
          nextSteps: [
            `Visit /generated/${buildResult.projectName} to preview`,
            `POST /api/factory/deploy with projectName to deploy`,
          ],
        };
        break;
      }

      case "GENERATE_IMAGE": {
        const prompt = context?.prompt || command;
        const imageResult = await aiGateway.generateImage({ prompt, workspaceId: session.id });
        result = {
          intent,
          action: "Image generation pipeline executed",
          asset: imageResult.asset,
          provider: imageResult.providerMetadata.provider,
          executionMode: imageResult.providerMetadata.executionMode,
        };
        break;
      }

      case "GENERATE_VIDEO": {
        const prompt = context?.prompt || command;
        const videoResult = await aiGateway.generateVideo({
          title: "Generated Video",
          description: prompt,
          scenes: [{ sceneId: "s1", title: "Main Scene", durationSeconds: 5, visualPrompt: prompt }],
          workspaceId: session.id,
        });
        result = {
          intent,
          action: "Video composition pipeline executed",
          asset: videoResult.asset,
          exportState: videoResult.exportState,
          executionMode: videoResult.providerMetadata.executionMode,
        };
        break;
      }

      case "GENERATE_AUDIO": {
        const text = context?.text || command.replace(/generat.*audio[:\-]?\s*/i, "") || "Antigravity OS audio synthesis.";
        const audioResult = await aiGateway.generateAudio({ text, workspaceId: session.id });
        result = {
          intent,
          action: "Audio synthesis pipeline executed",
          asset: audioResult.asset,
          durationSeconds: audioResult.durationSeconds,
          synthesisMode: audioResult.synthesisMode,
        };
        break;
      }

      case "RUN_CERTIFICATION": {
        // Schedule certification as a background task through the task orchestrator
        const certTask = taskOrchestrator.createTask({
          title: "Reality Certification Audit",
          description: `Live certification audit triggered by operator command: "${command}"`,
          priority: "HIGH",
          assignedAgent: "QA_ENGINEER",
          workspaceId: session.id,
          inputPayload: { command, requestId },
        });
        result = {
          intent,
          action: "Certification audit queued",
          taskId: certTask.id,
          status: certTask.status,
          message: "Run `npx tsx scripts/reality-certify.ts` to execute the live certification and generate REALITY_CERTIFICATE.md",
        };
        break;
      }

      case "DEPLOY": {
        const projectName = context?.projectName || "default";
        const provider = context?.provider || "Vercel";

        const deployResult = await deploymentManager.deploy(projectName, provider as any);

        result = {
          intent,
          action: "Deployment pipeline executed",
          url: deployResult.url,
          status: deployResult.status,
          provider: deployResult.provider,
          commitHash: deployResult.commitHash,
        };
        break;
      }

      case "FIX_ERRORS": {
        // Delegate to QA agent swarm for analysis
        const qaResult = await agentSwarm.executeAgent("QA_ENGINEER", {
          taskId: `fix_${requestId}`,
          prompt: `Analyze and report on existing errors. Command: "${command}". Context: ${JSON.stringify(context || {})}`,
          workspaceId: session.id,
          signal: AbortSignal.timeout(60000),
        });
        result = {
          intent,
          action: "QA error analysis executed",
          agentStatus: qaResult.status,
          analysis: qaResult.output,
        };
        break;
      }

      case "ADD_AI_FEATURE": {
        const archResult = await agentSwarm.executeAgent("ARCHITECT", {
          taskId: `ai_feature_${requestId}`,
          prompt: `Design and plan implementation for AI feature request: "${command}"`,
          workspaceId: session.id,
          signal: AbortSignal.timeout(60000),
        });
        result = {
          intent,
          action: "AI feature planning executed",
          agentStatus: archResult.status,
          plan: archResult.output,
        };
        break;
      }

      default: {
        // For unrecognized commands, invoke the AI Router for interpretation
        const aiResponse = await aiGateway.generateText(
          `You are Antigravity OS command interpreter. The operator issued: "${command}". 
Provide a concise, structured response about what action to take. 
Available capabilities: Website Factory, Image Generation, Video Composition, Audio Synthesis, Deployment (Vercel/GitHub), Certification, Agent Swarm.`,
          "GENERAL",
          session.id
        );
        result = {
          intent: "UNKNOWN",
          action: "AI-interpreted response",
          interpretation: aiResponse.content,
          provider: aiResponse.provider,
          model: aiResponse.model,
          latencyMs: Math.round(performance.now() - start),
        };
      }
    }

    return Response.json({
      success: true,
      requestId,
      command,
      intent,
      latencyMs: Math.round(performance.now() - start),
      data: result,
    });
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: error.message,
        latencyMs: Math.round(performance.now() - start),
      },
      { status: error.message.includes("Authentication") ? 401 : 500 }
    );
  }
}
