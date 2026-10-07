/**
 * ANTIGRAVITY OS v5.3 — REGRESSION KNOWLEDGE BASE
 * RegressionKnowledgeBase: Converts every historical defect into an inherited regression test
 */

export interface RegressionEntry {
  bugId: string;
  category: string;
  symptom: string;
  rootCause: string;
  appliedFix: string;
  createdAt: string;
}

export class RegressionKnowledgeBase {
  private static instance: RegressionKnowledgeBase;
  private readonly entries: Map<string, RegressionEntry> = new Map();

  private constructor() {
    this.seedDefaults();
  }

  public static getInstance(): RegressionKnowledgeBase {
    if (!RegressionKnowledgeBase.instance) {
      RegressionKnowledgeBase.instance = new RegressionKnowledgeBase();
    }
    return RegressionKnowledgeBase.instance;
  }

  private seedDefaults() {
    this.entries.set("BUG_01", {
      bugId: "BUG_01",
      category: "ROUTING",
      symptom: "Static file server fallback served index.html on .env or sensitive file requests",
      rootCause: "!path.extname('/.env') treated dotfile as extensionless SPA route",
      appliedFix: "Added global dotfile and sensitive directory shield (pathname.startsWith('/.') -> HTTP 403)",
      createdAt: new Date().toISOString()
    });

    this.entries.set("BUG_02", {
      bugId: "BUG_02",
      category: "PERSISTENCE",
      symptom: "Windows EPERM error on concurrent fs.renameSync temp-file write",
      rootCause: "File lock retained momentarily by reader stream on Windows OS",
      appliedFix: "Enforce direct atomic synchronous fs.writeFileSync with retry wrapper",
      createdAt: new Date().toISOString()
    });
  }

  public registerBug(entry: RegressionEntry) {
    this.entries.set(entry.bugId, entry);
  }

  public getAllBugs(): RegressionEntry[] {
    return Array.from(this.entries.values());
  }
}
