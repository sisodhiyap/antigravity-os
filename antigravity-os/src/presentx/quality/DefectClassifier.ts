/**
 * PRESENTX STUDIO — DEFECT CLASSIFIER & TAXONOMY ENGINE
 * src/presentx/quality/DefectClassifier.ts
 * 
 * Standardizes defect categorization, severity scoring, prioritization, and resolution tracking.
 */

import { QualityDefect, DefectSeverity, DefectCategory } from "../types";

export class DefectClassifier {
  /**
   * Deduplicates and orders defects by severity (CRITICAL -> HIGH -> MEDIUM -> LOW -> INFO)
   */
  public static prioritizeDefects(defects: QualityDefect[]): QualityDefect[] {
    const seen = new Set<string>();
    const unique: QualityDefect[] = [];

    const severityWeight: Record<DefectSeverity, number> = {
      CRITICAL: 5,
      HIGH: 4,
      MEDIUM: 3,
      LOW: 2,
      INFO: 1,
    };

    for (const defect of defects) {
      const key = `${defect.slideId}_${defect.category}_${defect.affectedElements.sort().join(",")}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(defect);
      }
    }

    return unique.sort((a, b) => severityWeight[b.severity] - severityWeight[a.severity]);
  }

  /**
   * Determines if a defect requires mandatory human approval before auto-repair
   */
  public static requiresOwnerApproval(defect: QualityDefect): boolean {
    // High risk changes (e.g. deleting slides, replacing entire datasets) require approval
    return defect.risk === "HIGH" && defect.severity === "CRITICAL";
  }

  /**
   * Filters defects by severity threshold
   */
  public static filterByMinSeverity(defects: QualityDefect[], minSeverity: DefectSeverity): QualityDefect[] {
    const severityWeight: Record<DefectSeverity, number> = {
      CRITICAL: 5,
      HIGH: 4,
      MEDIUM: 3,
      LOW: 2,
      INFO: 1,
    };

    const targetWeight = severityWeight[minSeverity];
    return defects.filter((d) => severityWeight[d.severity] >= targetWeight);
  }
}
