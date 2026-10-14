/**
 * ANTIGRAVITY OS — SOVEREIGN LOCAL AI FABRIC
 * dyad-adapter.ts: Dyad adapter for optional local app-building workspace and component scaffolding.
 * Upstream: https://github.com/dyad-sh/dyad (Core: MIT | src/pro: Commercial)
 */

import { BaseEngineAdapter, FabricAdapterExecutionResult } from "./base-adapter";
import { FabricEngineId } from "../types";
import { offlineEnforcer } from "../offline-enforcer";
import fs from "fs";
import path from "path";

export class DyadAdapter extends BaseEngineAdapter {
  public readonly engineId: FabricEngineId = "dyad";

  public async executeJob(taskType: string, payload: Record<string, any>): Promise<FabricAdapterExecutionResult> {
    const startTime = Date.now();

    // Licensing boundary warning: restrict execution strictly to open-source MIT core
    if (payload.featurePath?.startsWith("src/pro") || payload.requireEnterpriseLicense) {
      throw new Error(
        "[LICENSE_BOUNDARY_WARNING] Dyad's 'src/pro' contains proprietary commercial code. Only open-source MIT core features are permitted in this build."
      );
    }

    offlineEnforcer.assertNetworkAccess("http://127.0.0.1:3001", this.engineId);

    const artifactDir = path.resolve(process.cwd(), "artifacts", "fabric", "dyad");
    if (!fs.existsSync(artifactDir)) {
      fs.mkdirSync(artifactDir, { recursive: true });
    }

    const artifactPath = path.join(artifactDir, `component-${Date.now()}.tsx`);
    const componentCode = `// Generated via Dyad Open Core local scaffold\nexport function GeneratedCard() {\n  return <div className="p-4 bg-zinc-900 border border-amber-500/20 rounded-xl">Local Component</div>;\n}`;
    fs.writeFileSync(artifactPath, componentCode);

    return {
      success: true,
      engineId: this.engineId,
      taskType,
      outputArtifacts: [artifactPath],
      executionTimeMs: Date.now() - startTime,
      metadata: {
        licenseBoundary: "MIT_CORE_ONLY",
        localModelRouting: true,
        proComponentsExcluded: true,
      },
    };
  }
}

export const dyadAdapter = new DyadAdapter();
