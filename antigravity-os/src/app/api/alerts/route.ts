import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-response";
import { alertEngine } from "@/server/alerts/alert-engine";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const alerts = alertEngine.getActiveAlerts();
    return apiSuccess({
      alerts,
      total: alerts.length,
      unacknowledgedCount: alerts.filter((a) => !a.acknowledged).length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return apiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.action === "ACKNOWLEDGE" && body.alertId) {
      const ack = alertEngine.acknowledgeAlert(body.alertId);
      return apiSuccess({ acknowledged: ack, alertId: body.alertId });
    }

    const alert = alertEngine.dispatchAlert({
      severity: body.severity || "INFO",
      category: body.category || "SYSTEM",
      summary: body.summary || "System Notification",
      details: body.details || "Details",
      environment: body.environment,
      releaseId: body.releaseId,
      recommendedAction: body.recommendedAction,
    });

    return apiSuccess(alert, undefined, 201);
  } catch (err) {
    return apiError(err);
  }
}
