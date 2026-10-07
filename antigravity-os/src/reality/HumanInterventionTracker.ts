/**
 * ANTIGRAVITY OS v5.5 — HUMAN INTERVENTION TRACKER
 * HumanInterventionTracker: Tracks operator approvals, manual repairs, and autonomy percentage
 */

export interface HumanInterventionEvent {
  id: string;
  missionId: string;
  taskName: string;
  reason: "DESTRUCTIVE_APPROVAL" | "SECURITY_OVERRIDE" | "MANUAL_REPAIR" | "SCHEMA_CHANGE";
  wasMandatory: boolean;
  timestamp: string;
}

export interface HumanInterventionStats {
  missionId: string;
  totalInterventions: number;
  mandatoryApprovals: number;
  manualRepairs: number;
  autonomousCompletionPercent: number;
}

export class HumanInterventionTracker {
  private static readonly events: Map<string, HumanInterventionEvent[]> = new Map();

  public static recordIntervention(event: Omit<HumanInterventionEvent, "id" | "timestamp">): HumanInterventionEvent {
    const fullEvent: HumanInterventionEvent = {
      id: `int_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      ...event,
      timestamp: new Date().toISOString()
    };

    const list = this.events.get(event.missionId) || [];
    list.push(fullEvent);
    this.events.set(event.missionId, list);
    return fullEvent;
  }

  public static getStats(missionId: string, totalTasksCount: number = 12): HumanInterventionStats {
    const list = this.events.get(missionId) || [];
    const mandatory = list.filter((e) => e.wasMandatory).length;
    const manualRepairs = list.filter((e) => e.reason === "MANUAL_REPAIR").length;

    const autonomousCompletionPercent = Number(
      (((totalTasksCount - manualRepairs) / Math.max(1, totalTasksCount)) * 100).toFixed(1)
    );

    return {
      missionId,
      totalInterventions: list.length,
      mandatoryApprovals: mandatory,
      manualRepairs,
      autonomousCompletionPercent
    };
  }
}
