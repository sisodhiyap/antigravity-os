import fs from "fs";
import path from "path";

export interface AuditLogEntry {
  requestId: string;
  timestamp: string;
  toolId: string;
  provider: string;
  model: string;
  executionMode: "LIVE" | "LOCAL" | "SIMULATION" | "FALLBACK" | "FAILED" | "AUTH_REQUIRED" | "QUOTA_LIMITED";
  userId: string;
  projectId: string;
  durationMs: number;
  status: "SUCCESS" | "FAILED" | "UNAUTHORIZED" | "TIMEOUT";
  error?: string;
  estimatedCost: number | "COST_UNKNOWN";
  actualCost: number | "COST_UNKNOWN";
  currency: string;
}

export class ToolAuditLogger {
  private static instance: ToolAuditLogger;
  private logFilePath: string;

  private constructor() {
    this.logFilePath = path.join(process.cwd(), "public", "generated-assets", "tool-audit.json");
    const dir = path.dirname(this.logFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  public static getInstance(): ToolAuditLogger {
    if (!ToolAuditLogger.instance) {
      ToolAuditLogger.instance = new ToolAuditLogger();
    }
    return ToolAuditLogger.instance;
  }

  /**
   * Appends execution trace record to persistent log
   */
  public logExecution(entry: AuditLogEntry): void {
    console.log(`[AUDIT] ${entry.timestamp} | Tool: ${entry.toolId} | Mode: ${entry.executionMode} | Status: ${entry.status} | Cost: ${entry.actualCost} ${entry.currency}`);
    
    try {
      let logs: AuditLogEntry[] = [];
      if (fs.existsSync(this.logFilePath)) {
        const raw = fs.readFileSync(this.logFilePath, "utf-8");
        logs = JSON.parse(raw);
      }
      logs.push(entry);
      fs.writeFileSync(this.logFilePath, JSON.stringify(logs, null, 2), "utf-8");
    } catch (err: any) {
      console.error("Failed to write tool audit log to disk:", err.message);
    }
  }

  public getLogs(): AuditLogEntry[] {
    try {
      if (fs.existsSync(this.logFilePath)) {
        const raw = fs.readFileSync(this.logFilePath, "utf-8");
        return JSON.parse(raw);
      }
    } catch {}
    return [];
  }
}

export const toolAuditLogger = ToolAuditLogger.getInstance();
