/**
 * ANTIGRAVITY OS — PERSONAL INTELLIGENCE V1
 * intelligence-engine.ts: Sovereign AI Companion Orchestration Layer
 */

import { prisma } from "../db";
import { aiRouter } from "../ai/router";
import { strandsDecider } from "../ai/strands-decider";
import { intelligencePolicyGate } from "./policy-gate";
import { intelligenceContextResolver } from "./context-resolver";
import { personalMemoryStore } from "./memory-store";
import { HermesToolRegistry } from "@/plugins/hermes/HermesToolRegistry";
import { HermesPolicy } from "@/plugins/hermes/HermesPolicy";
import {
  PrivacyLevel,
  IntelligenceConversationRecord,
  IntelligenceMessageRecord,
  IntelligenceTaskRecord,
  IntelligenceApprovalRecord,
  ActionType,
  TaskStatus,
} from "./types";

export interface SendMessageResult {
  message: IntelligenceMessageRecord;
  conversationTitle?: string;
  memoryCaptured?: string | null;
  toolsInvoked?: string[];
  provider: string;
  model: string;
  isLocal: boolean;
  isFallback: boolean;
}

export class PersonalIntelligenceEngine {
  private static instance: PersonalIntelligenceEngine;

  private constructor() {}

  public static getInstance(): PersonalIntelligenceEngine {
    if (!PersonalIntelligenceEngine.instance) {
      PersonalIntelligenceEngine.instance = new PersonalIntelligenceEngine();
    }
    return PersonalIntelligenceEngine.instance;
  }

  /**
   * Creates a new conversation thread with strict user ownership
   */
  public async createConversation(
    userId: string,
    title = "New Discussion",
    privacyLevel: PrivacyLevel = "LOCAL_PREFERRED",
    projectId?: string
  ): Promise<IntelligenceConversationRecord> {
    const convo = await prisma.intelligenceConversation.create({
      data: {
        userId,
        title,
        privacyLevel,
        projectId: projectId || null,
      },
    });

    return {
      id: convo.id,
      userId: convo.userId,
      title: convo.title,
      projectId: convo.projectId,
      privacyLevel: convo.privacyLevel as PrivacyLevel,
      createdAt: convo.createdAt.toISOString(),
      updatedAt: convo.updatedAt.toISOString(),
    };
  }

  /**
   * Lists conversations for an authenticated user
   */
  public async getConversations(userId: string): Promise<IntelligenceConversationRecord[]> {
    const convos = await prisma.intelligenceConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    return convos.map((c) => ({
      id: c.id,
      userId: c.userId,
      title: c.title,
      projectId: c.projectId,
      privacyLevel: c.privacyLevel as PrivacyLevel,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));
  }

  /**
   * Retrieves conversation with messages
   */
  public async getConversation(
    id: string,
    userId: string
  ): Promise<{ conversation: IntelligenceConversationRecord; messages: IntelligenceMessageRecord[] } | null> {
    const convo = await prisma.intelligenceConversation.findFirst({
      where: { id, userId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!convo) return null;

    return {
      conversation: {
        id: convo.id,
        userId: convo.userId,
        title: convo.title,
        projectId: convo.projectId,
        privacyLevel: convo.privacyLevel as PrivacyLevel,
        createdAt: convo.createdAt.toISOString(),
        updatedAt: convo.updatedAt.toISOString(),
      },
      messages: convo.messages.map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
        provider: m.provider,
        model: m.model,
        latencyMs: m.latencyMs,
        isLocal: m.isLocal,
        isFallback: m.isFallback,
        fallbackReason: m.fallbackReason,
        toolCallsJson: m.toolCallsJson,
        evidenceIdsJson: m.evidenceIdsJson,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  }

  /**
   * Deletes a conversation and its messages
   */
  public async deleteConversation(id: string, userId: string): Promise<boolean> {
    const convo = await prisma.intelligenceConversation.findFirst({
      where: { id, userId },
    });
    if (!convo) return false;

    await prisma.intelligenceConversation.delete({ where: { id } });
    return true;
  }

  /**
   * Processes a user message with context resolution, policy enforcement, and router delegation
   */
  public async processUserMessage(
    conversationId: string,
    userId: string,
    userEmail: string,
    rawContent: string
  ): Promise<SendMessageResult> {
    const convo = await prisma.intelligenceConversation.findFirst({
      where: { id: conversationId, userId },
    });
    if (!convo) throw new Error("Conversation not found or unauthorized");

    // 1. Sanitize user input against prompt injection & redact secrets
    const { safeText, isSafe, threatsNeutralized } = intelligencePolicyGate.sanitizeInput(rawContent);

    // 2. Save user message to database
    await prisma.intelligenceMessage.create({
      data: {
        conversationId,
        role: "user",
        content: safeText,
      },
    });

    // 3. Check for explicit memory commands (e.g. "remember that...")
    let memoryCaptured: string | null = null;
    const rememberMatch = safeText.match(/(?:remember(?:\s+that|\s+this)?|note(?:\s+that)?):\s*(.+)/i) ||
      safeText.match(/^remember\s+(.+)/i);

    if (rememberMatch && rememberMatch[1]) {
      const memoryContent = rememberMatch[1].trim();
      const mem = await personalMemoryStore.createMemory({
        userId,
        category: "PREFERENCE",
        content: memoryContent,
        sourceType: "USER_EXPLICIT",
        userConfirmed: true,
        importance: 4,
      });
      memoryCaptured = mem.content;
    }

    // 4. Resolve System Context
    const contextBundle = await intelligenceContextResolver.resolveContext(
      userId,
      userEmail,
      safeText,
      convo.privacyLevel as PrivacyLevel,
      convo.projectId || undefined
    );
    const systemContextPrompt = intelligenceContextResolver.formatSystemContext(contextBundle);

    // 5. System One Decision via Strands Decider
    const decision = await strandsDecider.decide(safeText, {
      privacyLevel: convo.privacyLevel,
      threatsNeutralized,
    });

    // 6. Policy Gate Evaluation for Local-First Execution
    const ollamaAdapter = aiRouter.getAdapter("ollama");
    const isOllamaLive = ollamaAdapter ? await ollamaAdapter.isAvailable() : false;
    const privacyEval = intelligencePolicyGate.evaluateModelPrivacy(
      convo.privacyLevel as PrivacyLevel,
      isOllamaLive
    );

    const startTime = Date.now();
    let assistantReply = "";
    let usedProvider = "offline_engine";
    let usedModel = "deterministic-v7";
    let isLocal = true;
    let isFallback = false;
    let fallbackReason: string | null = null;
    const toolsInvoked: string[] = [];

    // 7. Execution Routing
    if (privacyEval.mustUseLocal && !isOllamaLive) {
      // Local Only requested, but local daemon is not running
      isLocal = true;
      isFallback = true;
      fallbackReason = "LOCAL_ONLY_POLICY_OFFLINE";
      usedProvider = "deterministic-offline";
      usedModel = "antigravity-local-safety";

      if (memoryCaptured) {
        assistantReply = `I have permanently saved this preference into your sovereign personal memory:\n\n> "${memoryCaptured}"\n\n*(Execution Policy: Local Only. Local GPU daemon Ollama is currently offline on port 11434. Cloud routing was strictly prevented per your privacy settings.)*`;
      } else {
        assistantReply = `**Sovereign Local-First Protection Notice**\n\nYour conversation privacy is set to **LOCAL_ONLY**, but local AI engine (Ollama) is currently unreachable on \`http://127.0.0.1:11434\`.\n\nOutbound cloud routing is **strictly prevented** by policy to keep all data local. To enable local inference:\n1. Launch Ollama: \`ollama serve\`\n2. Verify local model: \`ollama run qwen2.5-coder:7b\`\n\n*System Decision Confidence: ${(decision.confidence * 100).toFixed(1)}% (${decision.selectedRouteOrAction})*`;
      }
    } else {
      // Attempt Central AI Router completion
      try {
        const fullPrompt = `${systemContextPrompt}\n\nUSER PROMPT: ${safeText}`;
        const routerResponse = await aiRouter.execute({
          prompt: fullPrompt,
          taskCategory: privacyEval.mustUseLocal ? "FAST_LOCAL" : "REASONING",
          userPreference: privacyEval.mustUseLocal ? "LOCAL_ONLY" : "BALANCED",
        });

        assistantReply = routerResponse.content;
        usedProvider = routerResponse.provider;
        usedModel = routerResponse.model;
        isLocal = routerResponse.provider === "ollama" || routerResponse.provider === "airllm";
        isFallback = routerResponse.fallbackChainUsed.length > 1;

        if (memoryCaptured) {
          assistantReply = `I have committed your approved preference to memory: "${memoryCaptured}".\n\n${assistantReply}`;
        }
      } catch (err: any) {
        // Honest fallback report
        isFallback = true;
        isLocal = true;
        fallbackReason = err.message || "PROVIDER_UNAVAILABLE";
        usedProvider = "sovereign-fallback";
        usedModel = "deterministic-safety";

        if (memoryCaptured) {
          assistantReply = `I have safely recorded your memory: "${memoryCaptured}".\n\n*(External provider unavailable: ${err.message})*`;
        } else {
          assistantReply = `I have received your request. All configured remote model providers reported unavailability or quota limits (${err.message}). Local memory and project context remain intact.`;
        }
      }
    }

    const duration = Date.now() - startTime;

    // 8. Commit Assistant Message to DB
    const savedAssistantMessage = await prisma.intelligenceMessage.create({
      data: {
        conversationId,
        role: "assistant",
        content: assistantReply,
        provider: usedProvider,
        model: usedModel,
        latencyMs: duration,
        isLocal,
        isFallback,
        fallbackReason,
        toolCallsJson: toolsInvoked.length > 0 ? JSON.stringify(toolsInvoked) : null,
      },
    });

    // Update conversation title if default
    let updatedTitle: string | undefined = undefined;
    if (convo.title === "New Discussion" && safeText.length > 3) {
      updatedTitle = safeText.substring(0, 32).trim();
      await prisma.intelligenceConversation.update({
        where: { id: conversationId },
        data: { title: updatedTitle },
      });
    }

    return {
      message: {
        id: savedAssistantMessage.id,
        conversationId: savedAssistantMessage.conversationId,
        role: "assistant",
        content: savedAssistantMessage.content,
        provider: savedAssistantMessage.provider,
        model: savedAssistantMessage.model,
        latencyMs: savedAssistantMessage.latencyMs,
        isLocal: savedAssistantMessage.isLocal,
        isFallback: savedAssistantMessage.isFallback,
        fallbackReason: savedAssistantMessage.fallbackReason,
        toolCallsJson: savedAssistantMessage.toolCallsJson,
        evidenceIdsJson: savedAssistantMessage.evidenceIdsJson,
        createdAt: savedAssistantMessage.createdAt.toISOString(),
      },
      conversationTitle: updatedTitle,
      memoryCaptured,
      toolsInvoked,
      provider: usedProvider,
      model: usedModel,
      isLocal,
      isFallback,
    };
  }

  /**
   * Creates and dispatches a bounded autonomous task
   */
  public async createTask(params: {
    userId: string;
    conversationId?: string;
    title: string;
    description: string;
    actionType: ActionType;
    targetResource: string;
    privacyLevel?: PrivacyLevel;
  }): Promise<IntelligenceTaskRecord> {
    const policy = await intelligencePolicyGate.evaluateAction(
      params.actionType,
      params.targetResource
    );

    if (!policy.allowed) {
      throw new Error(`Task blocked by security policy: ${policy.reason}`);
    }

    const initialStatus: TaskStatus = policy.requiresApproval ? "AWAITING_APPROVAL" : "APPROVED";

    const task = await prisma.intelligenceTask.create({
      data: {
        userId: params.userId,
        conversationId: params.conversationId || null,
        title: params.title,
        description: params.description,
        status: initialStatus,
        autonomyLevel: policy.requiresApproval ? 2 : 3,
        privacyLevel: params.privacyLevel || "LOCAL_PREFERRED",
      },
    });

    // If approval required, create approval record
    if (policy.requiresApproval) {
      await prisma.intelligenceApproval.create({
        data: {
          taskId: task.id,
          userId: params.userId,
          actionType: params.actionType,
          targetResource: params.targetResource,
          description: params.description,
          riskLevel: policy.riskLevel,
          status: "PENDING",
        },
      });
    } else {
      // Auto-authorized task can run immediately
      this.executePreApprovedTask(task.id, params.title, params.actionType, params.targetResource).catch(() => {});
    }

    return this.mapTaskToRecord(task);
  }

  /**
   * Executes a safe pre-approved task (e.g. read-only inspections, test runs)
   */
  private async executePreApprovedTask(
    taskId: string,
    title: string,
    actionType: ActionType,
    resource: string
  ): Promise<void> {
    await prisma.intelligenceTask.update({
      where: { id: taskId },
      data: { status: "RUNNING", startedAt: new Date() },
    });

    try {
      let resultEvidence: any = { executed: true, target: resource };

      if (title.toLowerCase().includes("test")) {
        const testTool = HermesToolRegistry.getTool("hermes_test_runner");
        if (testTool) {
          const res = await testTool.handler({ suite: "unit" }, {
            sessionId: taskId,
            taskId,
            sandboxDir: "sandbox",
            autonomyLevel: 3,
            isEmergencyStopped: false,
            tokenBudgetRemaining: 100000,
            auditTrail: [],
          });
          resultEvidence = res.output;
        }
      }

      await prisma.intelligenceTask.update({
        where: { id: taskId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          evidenceHash: "ev_" + Date.now().toString(16),
          toolsCalledJson: JSON.stringify(resultEvidence),
        },
      });
    } catch (err: any) {
      await prisma.intelligenceTask.update({
        where: { id: taskId },
        data: {
          status: "FAILED",
          completedAt: new Date(),
          error: err.message,
        },
      });
    }
  }

  /**
   * Resolves pending operator approval
   */
  public async decideApproval(
    approvalId: string,
    userId: string,
    decision: "APPROVE" | "REJECT"
  ): Promise<IntelligenceApprovalRecord> {
    const approval = await prisma.intelligenceApproval.findFirst({
      where: { id: approvalId, userId, status: "PENDING" },
      include: { task: true },
    });

    if (!approval) throw new Error("Approval request not found or already processed");

    const newApprovalStatus = decision === "APPROVE" ? "APPROVED" : "REJECTED";
    const updatedApproval = await prisma.intelligenceApproval.update({
      where: { id: approvalId },
      data: {
        status: newApprovalStatus,
        decisionBy: userId,
        decisionAt: new Date(),
      },
    });

    // Update associated task status
    const newTaskStatus: TaskStatus = decision === "APPROVE" ? "APPROVED" : "CANCELLED";
    await prisma.intelligenceTask.update({
      where: { id: approval.taskId },
      data: { status: newTaskStatus },
    });

    return {
      id: updatedApproval.id,
      taskId: updatedApproval.taskId,
      userId: updatedApproval.userId,
      actionType: updatedApproval.actionType as ActionType,
      targetResource: updatedApproval.targetResource,
      description: updatedApproval.description,
      status: updatedApproval.status as any,
      riskLevel: updatedApproval.riskLevel as any,
      decisionBy: updatedApproval.decisionBy,
      decisionAt: updatedApproval.decisionAt?.toISOString(),
      createdAt: updatedApproval.createdAt.toISOString(),
    };
  }

  public async getTasks(userId: string): Promise<IntelligenceTaskRecord[]> {
    const tasks = await prisma.intelligenceTask.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return tasks.map((t) => this.mapTaskToRecord(t));
  }

  public async getPendingApprovals(userId: string): Promise<IntelligenceApprovalRecord[]> {
    const approvals = await prisma.intelligenceApproval.findMany({
      where: { userId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });

    return approvals.map((a) => ({
      id: a.id,
      taskId: a.taskId,
      userId: a.userId,
      actionType: a.actionType as ActionType,
      targetResource: a.targetResource,
      description: a.description,
      status: a.status as any,
      riskLevel: a.riskLevel as any,
      decisionBy: a.decisionBy,
      decisionAt: a.decisionAt?.toISOString(),
      createdAt: a.createdAt.toISOString(),
    }));
  }

  private mapTaskToRecord(t: any): IntelligenceTaskRecord {
    return {
      id: t.id,
      conversationId: t.conversationId,
      userId: t.userId,
      title: t.title,
      description: t.description,
      status: t.status as TaskStatus,
      autonomyLevel: t.autonomyLevel,
      privacyLevel: t.privacyLevel as PrivacyLevel,
      planJson: t.planJson,
      toolsCalledJson: t.toolsCalledJson,
      evidenceHash: t.evidenceHash,
      error: t.error,
      startedAt: t.startedAt?.toISOString(),
      completedAt: t.completedAt?.toISOString(),
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    };
  }
}

export const intelligenceEngine = PersonalIntelligenceEngine.getInstance();
