import { NextRequest, NextResponse } from "next/server";
import { PresentXOrchestrator } from "@/presentx/engine/PresentXOrchestrator";
import path from "path";
import fs from "fs";

function getStorageDir(): string {
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  const targetDir = isServerless
    ? path.resolve("/tmp", "presentx-vault")
    : path.resolve(process.cwd(), "workspaces", "presentx-vault");
  if (!fs.existsSync(targetDir)) {
    try {
      fs.mkdirSync(targetDir, { recursive: true });
    } catch {
      return path.resolve("/tmp", "presentx-vault");
    }
  }
  return targetDir;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawIdea = body.rawIdea || body.idea;
    if (!rawIdea || typeof rawIdea !== "string") {
      return NextResponse.json({ success: false, error: "Prompt 'rawIdea' is required." }, { status: 400 });
    }

    const orchestrator = PresentXOrchestrator.getInstance();
    const project = await orchestrator.generatePresentation({
      rawIdea,
      presentationType: body.presentationType,
      visualDirection: body.visualDirection,
      slideCount: body.slideCount,
      brandName: body.brandName,
    });

    const STORAGE_DIR = getStorageDir();
    fs.writeFileSync(path.join(STORAGE_DIR, `${project.id}.json`), JSON.stringify(project, null, 2));

    return NextResponse.json({
      success: true,
      project,
      evidence: {
        status: project.evidenceStatus,
        provenanceHash: project.provenanceHash,
        overallQuality: project.qualityAudit.overallScore,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
