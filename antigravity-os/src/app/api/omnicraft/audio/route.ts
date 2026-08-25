import { NextRequest } from "next/server";
import { aiGateway } from "@/server/multimodal/gateway";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.text) {
      return Response.json({ success: false, error: "Text content is required" }, { status: 400 });
    }

    const result = await aiGateway.generateSpeech({
      text: body.text,
      speechRate: body.speechRate || 1.0,
      workspaceId: body.workspaceId || "default",
      preferredMode: body.preferredMode,
    });

    return Response.json({ success: true, data: result });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
