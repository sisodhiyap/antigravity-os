import { NextRequest } from "next/server";
import { aiGateway } from "@/server/multimodal/gateway";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.prompt) {
      return Response.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    const result = await aiGateway.generate3D({
      prompt: body.prompt,
      category: body.category || "PROP",
      workspaceId: body.workspaceId || "default",
    });

    return Response.json({ success: true, data: result });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
