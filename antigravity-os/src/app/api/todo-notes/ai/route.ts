import { NextRequest } from "next/server";
import { aiGateway } from "@/server/multimodal/gateway";
import { authenticateRequest } from "@/server/auth-helper";

/**
 * POST /api/todo-notes/ai
 * Provides AI assistance (summarization or task extraction) using the AI Gateway.
 */
export async function POST(req: NextRequest) {
  try {
    await authenticateRequest(req);
    const { prompt, content } = await req.json();
    if (!prompt) {
      return Response.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    // Synthesize target prompt
    const fullPrompt = content
      ? `You are an AI assistant. Context note content:\n"${content}"\n\nTask: ${prompt}`
      : prompt;

    const start = performance.now();
    const response = await aiGateway.generateText(fullPrompt, "GENERAL", "todo_notes_workspace");
    const latencyMs = Math.round(performance.now() - start);

    return Response.json({
      success: true,
      data: {
        text: response.content,
        provider: response.provider,
        model: response.model,
        latencyMs,
      },
    });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
