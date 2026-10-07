/**
 * ANTIGRAVITY OS v7.0 — HERMES AGENT SUBSYSTEM
 * HermesSessionManager.ts: Isolated session lifecycle and state management
 */

import { HermesTaskGraph } from "./HermesTaskGraph";
import { HermesAutonomyLevel, HermesTimelineEvent } from "./HermesTypes";

export interface HermesSession {
  sessionId: string;
  objective: string;
  autonomyLevel: HermesAutonomyLevel;
  taskGraph: HermesTaskGraph;
  createdAt: string;
  status: "ACTIVE" | "COMPLETED" | "EMERGENCY_STOPPED" | "FAILED";
  timeline: HermesTimelineEvent[];
}

export class HermesSessionManager {
  private static readonly activeSessions: Map<string, HermesSession> = new Map();

  public static createSession(
    objective: string,
    autonomyLevel: HermesAutonomyLevel = 2
  ): HermesSession {
    const sessionId = `hermes_ses_${Date.now()}`;
    const session: HermesSession = {
      sessionId,
      objective,
      autonomyLevel,
      taskGraph: new HermesTaskGraph(),
      createdAt: new Date().toISOString(),
      status: "ACTIVE",
      timeline: []
    };

    this.addTimelineEvent(session, "SESSION_INIT", `Session created with Autonomy Level ${autonomyLevel}`);
    this.activeSessions.set(sessionId, session);
    return session;
  }

  public static getSession(sessionId: string): HermesSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  public static getAllSessions(): HermesSession[] {
    return Array.from(this.activeSessions.values());
  }

  public static addTimelineEvent(
    session: HermesSession,
    phase: string,
    message: string,
    status: "INFO" | "SUCCESS" | "WARNING" | "ERROR" = "INFO",
    metadata?: Record<string, unknown>
  ): HermesTimelineEvent {
    const ev: HermesTimelineEvent = {
      id: `tl_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
      phase,
      message,
      status,
      metadata
    };
    session.timeline.push(ev);
    return ev;
  }
}
