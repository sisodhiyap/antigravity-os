import { KernelPlugin, PluginManifest } from "./types";
import { PermissionManager } from "./permissionManager";
import { EventBus } from "./eventBus";

export class PluginLoader {
  private static instance: PluginLoader;
  private plugins: Map<string, KernelPlugin> = new Map();

  private constructor() {}

  public static getInstance(): PluginLoader {
    if (!PluginLoader.instance) {
      PluginLoader.instance = new PluginLoader();
    }
    return PluginLoader.instance;
  }

  /**
   * Register a new plugin
   */
  public registerPlugin(plugin: KernelPlugin): void {
    const { manifest } = plugin;
    this.plugins.set(manifest.id, plugin);

    // Grant manifest permissions
    PermissionManager.getInstance().grant(
      manifest.id,
      "PLUGIN",
      manifest.permissions,
      "PLUGIN_LOADER"
    );

    EventBus.getInstance().emit("plugin:registered", "PluginLoader", {
      id: manifest.id,
      name: manifest.name,
      version: manifest.version,
    });
  }

  /**
   * Load and initialize an enabled plugin with Kernel context
   */
  public async loadPlugin(id: string, kernelContext: any): Promise<void> {
    const plugin = this.plugins.get(id);
    if (!plugin) {
      throw new Error(`[PluginLoader] Plugin '${id}' not found.`);
    }

    if (!plugin.manifest.enabled) {
      return;
    }

    try {
      await plugin.initialize(kernelContext);
      EventBus.getInstance().emit("plugin:loaded", "PluginLoader", {
        id: plugin.manifest.id,
        name: plugin.manifest.name,
      });
    } catch (err: any) {
      console.error(`[PluginLoader] Failed to initialize plugin '${id}':`, err);
      EventBus.getInstance().emit("plugin:error", "PluginLoader", {
        id: plugin.manifest.id,
        error: err.message || String(err),
      });
      throw err;
    }
  }

  /**
   * Unload and shutdown a plugin
   */
  public async unloadPlugin(id: string): Promise<void> {
    const plugin = this.plugins.get(id);
    if (!plugin) return;

    try {
      await plugin.shutdown();
      plugin.manifest.enabled = false;
      EventBus.getInstance().emit("plugin:unloaded", "PluginLoader", {
        id: plugin.manifest.id,
      });
    } catch (err: any) {
      console.error(`[PluginLoader] Error shutting down plugin '${id}':`, err);
    }
  }

  /**
   * Load all enabled plugins
   */
  public async loadAll(kernelContext: any): Promise<void> {
    for (const [id, plugin] of this.plugins) {
      if (plugin.manifest.enabled) {
        try {
          await this.loadPlugin(id, kernelContext);
        } catch (err) {
          console.error(`[PluginLoader] Error loading plugin '${id}':`, err);
        }
      }
    }
  }

  public getAllPlugins(): PluginManifest[] {
    return Array.from(this.plugins.values()).map((p) => p.manifest);
  }
}
