import { NextRequest, NextResponse } from "next/server";
import { PresentationProject } from "@/presentx/types";
import { PresentXAuditor } from "@/presentx/engine/PresentXAuditor";

export async function POST(req: NextRequest) {
  try {
    const body: { project: PresentationProject } = await req.json();
    if (!body.project) {
      return NextResponse.json({ success: false, error: "Missing project payload" }, { status: 400 });
    }

    const audit = PresentXAuditor.auditPresentation(body.project);
    return NextResponse.json({ success: true, audit });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
