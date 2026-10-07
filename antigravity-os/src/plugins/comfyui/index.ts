/**
 * ANTIGRAVITY OS v7.0 — COMFYUI GENERATIVE MEDIA PLUGIN
 * index.ts: Public export barrel & PluginAdapterManager registration
 */

import { PluginAdapterManager } from "../PluginAdapterManager";

export * from "./ComfyUITypes";
export * from "./ComfyUIHealth";
export * from "./ComfyUIResourceManager";
export * from "./ComfyUIModelRegistry";
export * from "./ComfyUIWorkflowRegistry";
export * from "./ComfyUIWorkflowEngine";
export * from "./ComfyUIClient";
export * from "./ComfyUIQueueManager";
export * from "./ComfyUIOutputManager";
export * from "./ComfyUISandbox";
export * from "./ComfyUISecurity";
export * from "./ComfyUIRealityBridge";
export * from "./ComfyUIEvidenceBridge";
export * from "./ComfyUIAdapter";

// Register ComfyUI Local Media Plugin with V7 PluginAdapterManager above frozen core
PluginAdapterManager.getInstance().registerPlugin({
  pluginId: "plugin_comfyui_local_media",
  name: "ComfyUI Local Generative Media Engine (Image+Video+Audio+3D)",
  version: "1.0.0-COMFYUI-V7",
  category: "MODEL_ADAPTER",
  isSandboxed: true,
  securityAudited: true,
  realityTested: true,
  ownerApproved: true,
  status: "ACTIVE"
});
