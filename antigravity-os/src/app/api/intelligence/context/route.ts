import { NextRequest, NextResponse } from "next/server";
import { resolveIntelligenceUser } from "@/server/intelligence/auth-util";
import { intelligenceContextResolver } from "@/server/intelligence/context-resolver";
import { PrivacyLevel } from "@/server/intelligence/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await resolveIntelligenceUser(req);
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const privacy = (searchParams.get("privacy") as PrivacyLevel) || "LOCAL_PREFERRED";
    const projectId = searchParams.get("projectId") || undefined;

    const bundle = await intelligenceContextResolver.resolveContext(
      user.id,
      user.email,
      query,
      privacy,
      projectId
    );

    return NextResponse.json({ success: true, data: bundle });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to resolve context" },
      { status: 500 }
    );
  }
}
