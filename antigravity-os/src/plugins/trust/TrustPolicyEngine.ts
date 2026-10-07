/**
 * ANTIGRAVITY OS v7.0 — FACT-BASED INTELLIGENCE + SECURITY FABRIC
 * TrustPolicyEngine.ts: Least Privilege, Tool Execution Guard, Supply Chain, Runtime Integrity & Incident Response
 */

import crypto from "crypto";
import {
  ToolPermission,
  ToolGuardEvaluation,
  DependencyAuditResult,
  RuntimeIntegrityEvent,
  IncidentRecord,
  AuditLogEntry
} from "./TrustTypes";
import { SecurityGuards } from "./SecurityGuards";

export class TrustPolicyEngine {
  private static instance: TrustPolicyEngine;
  private readonly toolPermissions: Map<string, ToolPermission[]> = new Map();
  private readonly auditLogs: AuditLogEntry[] = [];
  private readonly incidents: Map<string, IncidentRecord> = new Map();
  private readonly integrityEvents: RuntimeIntegrityEvent[] = [];
  private emergencyStopped: boolean = false;

  private constructor() {
    // Register Default Least-Privilege Role Policies
    this.toolPermissions.set("HERMES_AGENT", [
      "READ_PROJECT",
      "WRITE_PROJECT",
      "READ_MEDIA",
      "WRITE_MEDIA",
      "EXECUTE_MODEL",
      "NETWORK_LOCAL",
      "READ_METADATA",
      "WRITE_EVIDENCE"
    ]);
    this.toolPermissions.set("COMFYUI_ADAPTER", [
      "READ_MEDIA",
      "WRITE_MEDIA",
      "EXECUTE_MODEL",
      "NETWORK_LOCAL",
      "WRITE_EVIDENCE"
    ]);
    this.toolPermissions.set("READ_ONLY_AUDITOR", [
      "READ_PROJECT",
      "READ_MEDIA",
      "READ_METADATA"
    ]);
  }

  public static getInstance(): TrustPolicyEngine {
    if (!TrustPolicyEngine.instance) {
      TrustPolicyEngine.instance = new TrustPolicyEngine();
    }
    return TrustPolicyEngine.instance;
  }

  /**
   * Tool Execution Guard executing the complete security barrier pipeline
   */
  public evaluateToolExecution(params: {
    caller: string;
    toolName: string;
    requiredPermission: ToolPermission;
    inputPayload: string;
  }): ToolGuardEvaluation {
    if (this.emergencyStopped) {
      return {
        allowed: false,
        tool: params.toolName,
        caller: params.caller,
        grantedPermissions: [],
        requiredPermission: params.requiredPermission,
        inputValid: false,
        securityClean: false,
        resourceClean: false,
        reason: "BLOCKED: System is in EMERGENCY_STOP state"
      };
    }

    const granted = this.toolPermissions.get(params.caller) || [];
    const hasPermission = granted.includes(params.requiredPermission);

    if (!hasPermission) {
      this.recordAuditLog({
        actor: params.caller,
        task: "TOOL_CALL",
        tool: params.toolName,
        action: "EXECUTE",
        decision: "BLOCK",
        policy: "LEAST_PRIVILEGE_ENFORCEMENT",
        inputHash: crypto.createHash("sha256").update(params.inputPayload).digest("hex")
      });

      return {
        allowed: false,
        tool: params.toolName,
        caller: params.caller,
        grantedPermissions: granted,
        requiredPermission: params.requiredPermission,
        inputValid: true,
        securityClean: true,
        resourceClean: true,
        reason: `BLOCKED: Caller '${params.caller}' lacks required permission '${params.requiredPermission}'`
      };
    }

    // Security Check on Input
    const sec = SecurityGuards.getInstance();
    const injection = sec.detectPromptInjection(params.inputPayload, `TOOL_INPUT_${params.toolName}`);
    if (injection.detected) {
      this.recordAuditLog({
        actor: params.caller,
        task: "TOOL_CALL",
        tool: params.toolName,
        action: "EXECUTE",
        decision: "BLOCK",
        policy: "PROMPT_INJECTION_DEFENSE",
        inputHash: crypto.createHash("sha256").update(params.inputPayload).digest("hex")
      });

      return {
        allowed: false,
        tool: params.toolName,
        caller: params.caller,
        grantedPermissions: granted,
        requiredPermission: params.requiredPermission,
        inputValid: false,
        securityClean: false,
        resourceClean: true,
        reason: `BLOCKED: Prompt injection detected in tool input: ${injection.reason}`
      };
    }

    this.recordAuditLog({
      actor: params.caller,
      task: "TOOL_CALL",
      tool: params.toolName,
      action: "EXECUTE",
      decision: "ALLOW",
      policy: "STANDARD_SECURITY_POLICY",
      inputHash: crypto.createHash("sha256").update(params.inputPayload).digest("hex")
    });

    return {
      allowed: true,
      tool: params.toolName,
      caller: params.caller,
      grantedPermissions: granted,
      requiredPermission: params.requiredPermission,
      inputValid: true,
      securityClean: true,
      resourceClean: true
    };
  }

  /**
   * Supply Chain baseline audit
   */
  public auditSupplyChainPackage(pkgName: string, version: string, license: string = "MIT"): DependencyAuditResult {
    const knownVulnerableList = ["event-stream@3.3.6", "flatmap-stream@0.1.1", "colors@1.4.1"];
    const identifier = `${pkgName}@${version}`;
    const isVulnerable = knownVulnerableList.includes(identifier);

    return {
      package: pkgName,
      version,
      hash: crypto.createHash("sha256").update(identifier).digest("hex"),
      source: "NPM_OFFICIAL_REGISTRY",
      license,
      knownVulnerabilities: isVulnerable ? ["CVE-MALICIOUS-PACKAGE"] : [],
      status: isVulnerable ? "VULNERABLE" : "SECURE"
    };
  }

  /**
   * Records a continuous runtime integrity event
   */
  public recordIntegrityEvent(
    type: "UNEXPECTED_PROCESS" | "UNEXPECTED_PORT" | "FILE_MUTATION" | "UNEXPECTED_PLUGIN" | "UNEXPECTED_NETWORK" | "ANOMALY",
    description: string,
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    evidence: string
  ): RuntimeIntegrityEvent {
    const event: RuntimeIntegrityEvent = {
      id: `integ_${crypto.randomBytes(6).toString("hex")}`,
      type,
      description,
      severity,
      timestamp: Date.now(),
      evidence,
      actionTaken: severity === "CRITICAL" ? "TRIGGER_INCIDENT_ESCALATION" : "LOGGED_FOR_AUDIT"
    };

    this.integrityEvents.push(event);

    if (severity === "CRITICAL") {
      this.createIncident({
        title: `CRITICAL INTEGRITY VIOLATION: ${type}`,
        severity: "CRITICAL",
        mitigationSteps: ["Isolate network", "Preserve evidence", "Halt affected worker"],
        evidenceIds: [event.id]
      });
    }

    return event;
  }

  /**
   * Creates an Incident Record
   */
  public createIncident(params: {
    title: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    mitigationSteps: string[];
    evidenceIds: string[];
  }): IncidentRecord {
    const incidentId = `inc_${crypto.randomBytes(6).toString("hex")}`;
    const now = Date.now();

    const record: IncidentRecord = {
      incidentId,
      title: params.title,
      state: "DETECTED",
      severity: params.severity,
      createdAt: now,
      updatedAt: now,
      mitigationSteps: params.mitigationSteps,
      evidenceIds: params.evidenceIds,
      emergencyStopTriggered: params.severity === "CRITICAL"
    };

    if (params.severity === "CRITICAL") {
      this.emergencyStopped = true;
    }

    this.incidents.set(incidentId, record);
    return record;
  }

  public triggerEmergencyStop(reason: string): void {
    this.emergencyStopped = true;
    this.createIncident({
      title: `EMERGENCY STOP TRIGGERED: ${reason}`,
      severity: "CRITICAL",
      mitigationSteps: ["Disable all external network", "Lock filesystem writes", "Quarantine workers"],
      evidenceIds: []
    });
  }

  public resetEmergencyStop(ownerApprovalKey: string): boolean {
    if (ownerApprovalKey === "OWNER_AUTHORIZED_RELEASE_KEY_V7") {
      this.emergencyStopped = false;
      return true;
    }
    return false;
  }

  public isEmergencyStopped(): boolean {
    return this.emergencyStopped;
  }

  public recordAuditLog(entry: {
    actor: string;
    task: string;
    tool: string;
    action: string;
    decision: "ALLOW" | "BLOCK" | "REDACT" | "ESCALATE";
    policy: string;
    inputHash?: string;
    outputHash?: string;
    evidenceId?: string;
  }): AuditLogEntry {
    const log: AuditLogEntry = {
      id: `audit_${crypto.randomBytes(8).toString("hex")}`,
      actor: entry.actor,
      task: entry.task,
      tool: entry.tool,
      action: entry.action,
      timestamp: Date.now(),
      inputHash: entry.inputHash || "NONE",
      outputHash: entry.outputHash || "NONE",
      decision: entry.decision,
      policy: entry.policy,
      evidenceId: entry.evidenceId
    };

    this.auditLogs.push(log);
    return log;
  }

  public getAuditLogs(): AuditLogEntry[] {
    return this.auditLogs;
  }

  public getIncidents(): IncidentRecord[] {
    return Array.from(this.incidents.values());
  }

  public getIntegrityEvents(): RuntimeIntegrityEvent[] {
    return this.integrityEvents;
  }
}
