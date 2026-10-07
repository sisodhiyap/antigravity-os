/**
 * ANTIGRAVITY OS v5.4 — OWNER PREFERENCES
 * OwnerPreferences: Manages explicit operator preferences and immutable policies
 */

export interface OwnerPreferenceConfig {
  preferredUITheme: "charcoal-gold" | "dark-slate" | "minimal-light";
  preferredModel: string;
  enforceLocalOnly: boolean;
  blockDestructiveWithoutPrompt: boolean;
  preferDocker: boolean;
  autonomyLevel: number;
}

export class OwnerPreferences {
  private static instance: OwnerPreferences;
  private config: OwnerPreferenceConfig = {
    preferredUITheme: "charcoal-gold",
    preferredModel: "qwen2.5-coder:7b",
    enforceLocalOnly: true,
    blockDestructiveWithoutPrompt: true,
    preferDocker: true,
    autonomyLevel: 2
  };

  public static getInstance(): OwnerPreferences {
    if (!OwnerPreferences.instance) {
      OwnerPreferences.instance = new OwnerPreferences();
    }
    return OwnerPreferences.instance;
  }

  public getPreferences(): OwnerPreferenceConfig {
    return { ...this.config };
  }

  public updatePreferences(partial: Partial<OwnerPreferenceConfig>) {
    this.config = { ...this.config, ...partial };
  }
}
