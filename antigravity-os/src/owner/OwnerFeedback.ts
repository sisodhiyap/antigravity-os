/**
 * ANTIGRAVITY OS v5.4 — OWNER FEEDBACK LEARNING
 * OwnerFeedback: Collects, classifies, and interprets explicit human operator feedback
 */

export interface OwnerFeedbackItem {
  id: string;
  missionId: string;
  sentiment: "GOOD" | "BAD" | "FIXED" | "NOT_WHAT_I_WANTED" | "ACCEPT" | "REJECT";
  userNotes: string;
  interpretedCategory: "UI_PREFERENCE" | "SECURITY_CONSTRAINT" | "ARCHITECTURE_CHOICE" | "DEFECT_REPORT";
  status: "CANDIDATE" | "VERIFIED" | "REJECTED";
  timestamp: string;
}

export class OwnerFeedback {
  private static instance: OwnerFeedback;
  private readonly feedbackList: Map<string, OwnerFeedbackItem> = new Map();

  public static getInstance(): OwnerFeedback {
    if (!OwnerFeedback.instance) {
      OwnerFeedback.instance = new OwnerFeedback();
    }
    return OwnerFeedback.instance;
  }

  public submitFeedback(
    missionId: string,
    sentiment: OwnerFeedbackItem["sentiment"],
    userNotes: string
  ): OwnerFeedbackItem {
    let category: OwnerFeedbackItem["interpretedCategory"] = "UI_PREFERENCE";
    if (userNotes.toLowerCase().includes("security") || userNotes.toLowerCase().includes("auth")) {
      category = "SECURITY_CONSTRAINT";
    } else if (userNotes.toLowerCase().includes("db") || userNotes.toLowerCase().includes("schema")) {
      category = "ARCHITECTURE_CHOICE";
    } else if (sentiment === "BAD" || sentiment === "FIXED") {
      category = "DEFECT_REPORT";
    }

    const item: OwnerFeedbackItem = {
      id: `fdb_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      missionId,
      sentiment,
      userNotes,
      interpretedCategory: category,
      status: "CANDIDATE",
      timestamp: new Date().toISOString()
    };

    this.feedbackList.set(item.id, item);
    return item;
  }

  public getAllFeedback(): OwnerFeedbackItem[] {
    return Array.from(this.feedbackList.values());
  }
}
