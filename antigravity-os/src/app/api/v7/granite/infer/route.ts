import { NextRequest, NextResponse } from "next/server";
import { GraniteEngine, GraniteInferenceRequest } from "@/plugins/granite";

export async function POST(req: NextRequest) {
  try {
    const body: GraniteInferenceRequest = await req.json();
    if (!body.prompt) {
      return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    const engine = GraniteEngine.getInstance();
    const result = await engine.executeInference(body);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
