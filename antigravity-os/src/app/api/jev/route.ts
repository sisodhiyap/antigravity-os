import { NextRequest, NextResponse } from "next/server";
import { jevAdapter } from "@/server/ai/jev-adapter";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const health = await jevAdapter.checkHealth();
    return NextResponse.json({
      success: true,
      data: health,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to inspect Jev System One status",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { state, questions, model } = body;

    if (!state || typeof state !== "string") {
      return NextResponse.json(
        { success: false, error: "Field 'state' must be a non-empty string" },
        { status: 400 }
      );
    }

    if (!questions || typeof questions !== "object") {
      return NextResponse.json(
        { success: false, error: "Field 'questions' must be an object map of question definitions" },
        { status: 400 }
      );
    }

    const response = await jevAdapter.executeSystemOne({
      state,
      questions,
      model,
    });

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to execute Jev System One request",
      },
      { status: 500 }
    );
  }
}
