import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-response";
import { policyEngine, ApprovalStatus } from "@/server/policy/policy-engine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = (searchParams.get("status") as ApprovalStatus) || undefined;
    const approvals = policyEngine.getAllApprovals(status);
    return apiSuccess(approvals);
  } catch (error) {
    return apiError(error);
  }
}
