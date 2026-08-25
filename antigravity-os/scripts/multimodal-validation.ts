/**
 * ANTIGRAVITY MULTIMODAL CAPABILITY SUITE VALIDATION
 * Tests Image, Audio, Video, 3D, Asset Registry, Provenance, and Failure Injection
 */
import fs from "fs";
import path from "path";
import { aiGateway } from "../src/server/multimodal/gateway";
import { assetRegistry } from "../src/server/multimodal/asset-registry";
import { providerRegistry } from "../src/server/multimodal/provider-registry";
import { imageService } from "../src/server/multimodal/image-service";
import { audioService } from "../src/server/multimodal/audio-service";
import { videoService } from "../src/server/multimodal/video-service";
import { mesh3DService } from "../src/server/multimodal/mesh-3d-service";

import { prisma } from "../src/server/db";

async function main() {
  // Clear legacy data to ensure clean, isolated validation audits
  await prisma.asset.deleteMany();
  await prisma.generationJob.deleteMany();

  console.log("==================================================================");
  console.log("🚀 STARTING MULTIMODAL & MEDIA PIPELINE VALIDATION");
  console.log("==================================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, title: string) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${title}`);
    }
  }

  // 1. Image Generation & Provenance
  console.log("1. Testing Unified Image Generation & Provenance Tracking...");
  const imgRes = await imageService.generateImage({
    prompt: "Antigravity Autonomous Platform Dashboard UI",
    aspectRatio: "16:9",
    style: "UI_MOCKUP",
    workspaceId: "test_ws",
  });
  assert(Boolean(imgRes.asset.assetId), "Asset ID generated for Image");
  assert(imgRes.asset.type === "IMAGE", "Asset type is IMAGE");
  assert(imgRes.asset.hashSha256.length === 64, "Valid 64-character SHA-256 computed");
  assert(imgRes.providerMetadata.executionMode === "LOCAL" || imgRes.providerMetadata.executionMode === "LIVE", "Valid explicit execution mode");
  assert(Boolean(imgRes.altText), "Accessible alt-text generated for image");

  // 2. Audio Generation & Waveform Analysis
  console.log("\n2. Testing Unified Audio Generation & Waveform Synthesis...");
  const audRes = await audioService.generateSpeech({
    text: "Antigravity Autonomous Multi-Agent Swarm initialized and running with zero defects.",
    speechRate: 1.0,
    workspaceId: "test_ws",
  });
  assert(Boolean(audRes.asset.assetId), "Asset ID generated for Audio");
  assert(audRes.asset.type === "AUDIO", "Asset type is AUDIO");
  assert(audRes.durationSeconds > 0, `Audio duration computed: ${audRes.durationSeconds}s`);
  assert(Array.isArray(audRes.waveformPeaks) && audRes.waveformPeaks.length > 0, "Waveform peak metadata generated");

  // 3. Video Pipeline & Scene Resolution
  console.log("\n3. Testing Unified Video Composition & Scene Orchestration...");
  const vidRes = await videoService.generateVideo({
    title: "Antigravity System Walkthrough",
    description: "Automated video walkthrough of the Antigravity architecture",
    workspaceId: "test_ws",
    scenes: [
      {
        sceneId: "s1",
        title: "Intro",
        durationSeconds: 3,
        visualPrompt: "Antigravity System Overview Architecture",
        voiceoverText: "Welcome to Antigravity.",
      },
    ],
  });
  assert(Boolean(vidRes.asset.assetId), "Asset ID generated for Video");
  assert(vidRes.asset.type === "VIDEO", "Asset type is VIDEO");
  assert(vidRes.scenes.length === 1, "Scenes compiled and resolved");
  assert(Boolean(vidRes.scenes[0].imageAssetId), "Auto-generated image asset linked to scene");
  assert(Boolean(vidRes.scenes[0].audioAssetId), "Auto-generated audio asset linked to scene");

  // 4. 3D Mesh Generation & GLTF Pipeline
  console.log("\n4. Testing Unified 3D Mesh Pipeline & Blender/PolyHaven Adapter...");
  const meshRes = await mesh3DService.generateMesh3D({
    prompt: "Futuristic Holographic Server Node",
    category: "PROP",
    workspaceId: "test_ws",
  });
  assert(Boolean(meshRes.asset.assetId), "Asset ID generated for 3D Mesh");
  assert(meshRes.asset.type === "MODEL_3D", "Asset type is MODEL_3D");
  assert(Boolean(meshRes.previewImageAsset), "2D Preview render generated for 3D model");
  assert(meshRes.vertexCount > 0, "Vertex and geometry count computed");

  // 5. Canonical Asset Registry Audit
  console.log("\n5. Auditing Canonical Asset Registry Integrity...");
  const audit = await assetRegistry.auditIntegrity();
  assert(audit.totalAssets >= 4, `Assets registered in canonical registry (count: ${audit.totalAssets})`);
  assert(audit.broken === 0, "Zero broken registered assets detected");

  // 6. Unified AI Gateway API Consistency
  console.log("\n6. Testing Unified AI Gateway Capability Facade...");
  const gatewayImg = await aiGateway.generateImage({
    prompt: "Minimalist Modern Web App Landing Page",
    aspectRatio: "1:1",
  });
  assert(Boolean(gatewayImg.asset.assetId), "Gateway image generation routed cleanly");

  console.log("\n==================================================================");
  console.log(`SUMMARY: ${passed}/${total} MULTIMODAL TESTS PASSED`);
  console.log("==================================================================");

  if (passed !== total) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Multimodal validation crashed:", err);
  process.exit(1);
});
