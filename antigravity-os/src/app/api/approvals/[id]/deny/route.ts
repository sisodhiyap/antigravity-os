import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-response";
import { policyEngine } from "@/server/policy/policy-engine";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let body = {};
    try {
      body = await req.json();
    } catch (_) {}

    const decidedBy = (body as any).decidedBy || "Operator";
    const note = (body as any).note || "Denied by operator policy decision";

    const updated = policyEngine.recordDecision(id, "DENIED", decidedBy, note);
    return apiSuccess(updated);
  } catch (error) {
    return apiError(error);
  }
}
