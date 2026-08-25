import { aiGateway } from "./src/server/multimodal/gateway";
import { prisma } from "./src/server/db";

async function run() {
  console.log("=== Testing Image Generation ===");
  try {
    const res = await aiGateway.generateImage({
      prompt: "Test Logo",
      aspectRatio: "1:1",
      workspaceId: "system"
    });
    console.log("Image Success:", res);
  } catch (err: any) {
    console.error("Image Error:", err.message, err.stack);
  }

  console.log("\n=== Testing Audio Generation ===");
  try {
    const res = await aiGateway.generateAudio({
      text: "Test Audio Text",
      workspaceId: "system"
    });
    console.log("Audio Success:", res);
  } catch (err: any) {
    console.error("Audio Error:", err.message, err.stack);
  }

  console.log("\n=== Testing Video Generation ===");
  try {
    const res = await aiGateway.generateVideo({
      prompt: "Test Video",
      workspaceId: "system"
    });
    console.log("Video Success:", res);
  } catch (err: any) {
    console.error("Video Error:", err.message, err.stack);
  }

  console.log("\n=== Testing 3D Generation ===");
  try {
    const res = await aiGateway.generate3D({
      prompt: "Test 3D",
      workspaceId: "system"
    });
    console.log("3D Success:", res);
  } catch (err: any) {
    console.error("3D Error:", err.message, err.stack);
  }
}

run().catch(console.error);
