/**
 * ANTIGRAVITY OS v7.0 — PLUGIN & ADAPTER PROTOCOL
 * PluginAdapterManager: Manages isolated plugin lifecycles above the Frozen V7 Core
 * DISCOVER -> REGISTER -> ISOLATE -> VALIDATE -> SECURITY TEST -> REALITY TEST -> CERTIFY -> OWNER APPROVAL -> PROMOTE
 */

export type PluginCategory =
  | "INPUT_ADAPTER"
  | "PARSER_ADAPTER"
  | "MODEL_ADAPTER"
  | "FRAMEWORK_ADAPTER"
  | "DATABASE_ADAPTER"
  | "INTEGRATION_ADAPTER"
  | "EXPORTER_ADAPTER"
  | "DEPLOYMENT_ADAPTER"
  | "TESTING_ADAPTER";

export interface PluginDefinition {
  pluginId: string;
  name: string;
  version: string;
  category: PluginCategory;
  isSandboxed: boolean;
  securityAudited: boolean;
  realityTested: boolean;
  ownerApproved: boolean;
  status: "REGISTERED" | "SANDBOXED" | "CERTIFIED" | "ACTIVE" | "REJECTED";
}

export class PluginAdapterManager {
  private static instance: PluginAdapterManager;
  private readonly plugins: Map<string, PluginDefinition> = new Map();

  public static getInstance(): PluginAdapterManager {
    if (!PluginAdapterManager.instance) {
      PluginAdapterManager.instance = new PluginAdapterManager();
    }
    return PluginAdapterManager.instance;
  }

  public registerPlugin(plugin: PluginDefinition): void {
    this.plugins.set(plugin.pluginId, plugin);
  }

  public getPlugin(pluginId: string): PluginDefinition | undefined {
    return this.plugins.get(pluginId);
  }

  public getAllPlugins(): PluginDefinition[] {
    return Array.from(this.plugins.values());
  }

  public certifyAndPromote(pluginId: string, ownerApprovalGiven: boolean): boolean {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;

    if (plugin.isSandboxed && plugin.securityAudited && plugin.realityTested && ownerApprovalGiven) {
      plugin.ownerApproved = true;
      plugin.status = "ACTIVE";
      return true;
    }
    return false;
  }
}
