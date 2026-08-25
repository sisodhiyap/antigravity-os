import { NextRequest } from "next/server";
import { aiGateway } from "@/server/multimodal/gateway";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title || !body.scenes) {
      return Response.json({ success: false, error: "Title and scenes are required" }, { status: 400 });
    }

    const result = await aiGateway.generateVideo({
      title: body.title,
      description: body.description || "",
      scenes: body.scenes,
      aspectRatio: body.aspectRatio || "16:9",
      workspaceId: body.workspaceId || "default",
    });

    return Response.json({ success: true, data: result });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
