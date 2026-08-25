/**
 * ANTIGRAVITY PRODUCTION ALERT ENGINE
 *
 * Dispatches structured alerts for critical events:
 * - Production unhealthy
 * - Deployment failure / Rollback triggered
 * - High 5xx error rate
 * - AI Provider outage
 * - Budget limit exceeded
 * - Security violation / Sandbox escape attempt
 */
import { secretRedactor } from "../security/secret-redactor";

export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL" | "FATAL";

export interface ProductionAlert {
  alertId: string;
  severity: AlertSeverity;
  category:
    | "HEALTH_FAILURE"
    | "DEPLOYMENT_FAILURE"
    | "ROLLBACK_TRIGGERED"
    | "SECURITY_VIOLATION"
    | "BUDGET_EXCEEDED"
    | "AI_OUTAGE"
    | "SYSTEM";
  summary: string;
  details: string;
  timestamp: string;
  environment: string;
  releaseId?: string;
  recommendedAction: string;
  acknowledged: boolean;
}

export class AlertEngine {
  private static instance: AlertEngine;
  private alerts: ProductionAlert[] = [];

  private constructor() {}

  public static getInstance(): AlertEngine {
    if (!AlertEngine.instance) {
      AlertEngine.instance = new AlertEngine();
    }
    return AlertEngine.instance;
  }

  public dispatchAlert(params: {
    severity: AlertSeverity;
    category: ProductionAlert["category"];
    summary: string;
    details: string;
    environment?: string;
    releaseId?: string;
    recommendedAction?: string;
  }): ProductionAlert {
    const alertId = `alt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const sanitizedDetails = secretRedactor.redactString(params.details);

    const alert: ProductionAlert = {
      alertId,
      severity: params.severity,
      category: params.category,
      summary: params.summary,
      details: sanitizedDetails,
      timestamp: new Date().toISOString(),
      environment: params.environment || process.env.NODE_ENV || "production",
      releaseId: params.releaseId,
      recommendedAction: params.recommendedAction || "Investigate telemetry logs and verify component state",
      acknowledged: false,
    };

    this.alerts.unshift(alert);
    if (this.alerts.length > 200) {
      this.alerts.pop();
    }

    return alert;
  }

  public getActiveAlerts(): ProductionAlert[] {
    return this.alerts;
  }

  public acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find((a) => a.alertId === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }
}

export const alertEngine = AlertEngine.getInstance();
