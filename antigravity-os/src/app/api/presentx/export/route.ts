import { NextRequest, NextResponse } from "next/server";
import { PresentationProject, ExportQualityMode } from "@/presentx/types";
import { PresentXExporter } from "@/presentx/engine/PresentXExporter";
import { PresentXExportQualityDirector } from "@/presentx/quality/PresentXExportQualityDirector";

export async function POST(req: NextRequest) {
  try {
    const body: {
      project: PresentationProject;
      format: "HTML" | "PPTX" | "JSON" | "PDF";
      mode?: ExportQualityMode;
    } = await req.json();

    if (!body.project) {
      return NextResponse.json({ success: false, error: "Missing project payload" }, { status: 400 });
    }

    const format = body.format || "HTML";
    const mode = body.mode || "PREMIUM";

    // Run Intelligent Export Quality Gate
    const qualityDirector = PresentXExportQualityDirector.getInstance();
    const qualityResult = await qualityDirector.executeQualityGate(body.project, format, mode);

    if (qualityResult.decision === "REJECTED") {
      return NextResponse.json(
        {
          success: false,
          error: "Export rejected by Quality Director due to critical defects.",
          qualityResult,
        },
        { status: 422 }
      );
    }

    const workingProject = qualityResult.repairedProject;

    if (format === "HTML" || format === "PDF") {
      const html = PresentXExporter.exportToHtml(workingProject);
      return new NextResponse(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(workingProject.title || "presentation")}.html"`,
          "x-presentx-certificate-id": qualityResult.certificate.certificateId,
          "x-presentx-decision": qualityResult.decision,
          "x-presentx-quality-score": String(qualityResult.certificate.exportScore),
        },
      });
    }

    if (format === "PPTX") {
      const buffer = qualityResult.exportBuffer || (await PresentXExporter.exportToPptx(workingProject));
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(workingProject.title || "presentation")}.pptx"`,
          "x-presentx-certificate-id": qualityResult.certificate.certificateId,
          "x-presentx-decision": qualityResult.decision,
          "x-presentx-quality-score": String(qualityResult.certificate.exportScore),
        },
      });
    }

    if (format === "JSON") {
      const json = PresentXExporter.exportToJsonBundle(workingProject);
      return new NextResponse(json, {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(workingProject.title || "presentation")}.evidence.json"`,
          "x-presentx-certificate-id": qualityResult.certificate.certificateId,
          "x-presentx-decision": qualityResult.decision,
          "x-presentx-quality-score": String(qualityResult.certificate.exportScore),
        },
      });
    }

    return NextResponse.json({ success: false, error: "Unsupported format" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
