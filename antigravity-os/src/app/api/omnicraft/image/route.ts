import { NextRequest } from "next/server";
import { aiGateway } from "@/server/multimodal/gateway";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.prompt) {
      return Response.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    const result = await aiGateway.generateImage({
      prompt: body.prompt,
      aspectRatio: body.aspectRatio || "1:1",
      style: body.style || "UI_MOCKUP",
      workspaceId: body.workspaceId || "default",
      preferredProvider: body.preferredProvider,
    });

    return Response.json({ success: true, data: result });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
