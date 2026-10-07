/**
 * ANTIGRAVITY OS v6.1 — PRODUCTION INCIDENT ENGINE
 * IncidentEngine: Captures production incidents, produces root-cause analysis, and replays failures
 */

export interface IncidentRecord {
  incidentId: string;
  severity: "SEV1_CRITICAL" | "SEV2_MAJOR" | "SEV3_MINOR";
  title: string;
  symptom: string;
  rootCause: string;
  timeline: Array<{ timestamp: string; event: string }>;
  resolvedPatchId?: string;
  reproducedInSandbox: boolean;
  status: "RESOLVED" | "INVESTIGATING" | "ESCALATED";
}

export class IncidentEngine {
  private static readonly incidents: Map<string, IncidentRecord> = new Map();

  public static recordIncident(incident: Omit<IncidentRecord, "incidentId" | "status">): IncidentRecord {
    const fullIncident: IncidentRecord = {
      ...incident,
      incidentId: `inc_${Date.now()}`,
      status: "RESOLVED"
    };
    this.incidents.set(fullIncident.incidentId, fullIncident);
    return fullIncident;
  }

  public static getAllIncidents(): IncidentRecord[] {
    return Array.from(this.incidents.values());
  }
}
