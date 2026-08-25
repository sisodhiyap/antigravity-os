import { NextRequest } from "next/server";
import { aiGateway } from "@/server/multimodal/gateway";
import { prisma } from "@/server/db";
import { authenticateRequest } from "@/server/auth-helper";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.prompt) {
      return Response.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    const workspaceId = body.workspaceId || "default";
    const start = performance.now();

    // Authenticate (optional: don't block chat if unauthenticated)
    let userId: string | null = null;
    try {
      const user = await authenticateRequest(req);
      userId = user.id;
    } catch {
      // Allow unauthenticated chat fallback
    }

    // Execute through AI Gateway
    const response = await aiGateway.generateText(
      body.prompt,
      body.category || "GENERAL",
      workspaceId
    );

    const latencyMs = Math.round(performance.now() - start);

    // Persist conversation to database if we have a real project workspace
    if (userId && workspaceId !== "default") {
      try {
        const project = await prisma.project.findUnique({ where: { id: workspaceId } });
        if (project) {
          // Find or create conversation for this workspace
          let conversation = await prisma.aIConversation.findFirst({
            where: { projectId: workspaceId, userId },
          });

          if (!conversation) {
            conversation = await prisma.aIConversation.create({
              data: {
                projectId: workspaceId,
                userId,
                title: "Workspace AI Assistant",
              },
            });
          }

          // Save user message
          await prisma.aIMessage.create({
            data: {
              conversationId: conversation.id,
              role: "user",
              content: body.prompt,
            },
          });

          // Save assistant message with provenance
          await prisma.aIMessage.create({
            data: {
              conversationId: conversation.id,
              role: "assistant",
              content: response.content,
              provider: response.provider,
              model: response.model,
              latencyMs,
            },
          });
        }
      } catch (dbErr) {
        // DB persistence failure is non-critical — still return the AI response
        console.warn("Chat DB persistence failed:", dbErr);
      }
    }

    return Response.json({
      success: true,
      data: {
        text: response.content,
        providerMetadata: {
          provider: response.provider,
          model: response.model,
          latencyMs,
          promptTokens: response.promptTokens,
          completionTokens: response.completionTokens,
          fallbackChainUsed: (response as any).fallbackChainUsed,
        },
      },
    });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * GET: Retrieve conversation history for a project workspace
 */
export async function GET(req: NextRequest) {
  try {
    await authenticateRequest(req);
    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId");

    if (!projectId) {
      return Response.json({ success: false, error: "projectId required" }, { status: 400 });
    }

    const conversations = await prisma.aIConversation.findMany({
      where: { projectId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return Response.json({ success: true, data: conversations });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 401 });
  }
}
