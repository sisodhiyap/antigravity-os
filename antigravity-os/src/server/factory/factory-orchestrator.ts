import fs from "fs";
import path from "path";
import crypto from "crypto";
import { WebsiteBlueprint, WebsiteCodeSynthesizer, websiteCodeSynthesizer } from "./code-synthesizer";
import { imageService } from "../multimodal/image-service";
import { videoService } from "../multimodal/video-service";
import { audioService } from "../multimodal/audio-service";
import { assetRegistry } from "../multimodal/asset-registry";
import { prisma } from "../db";

export interface BuildProjectRequest {
  name: string;
  type: "portfolio" | "landing" | "agency" | "studio";
  prompt: string;
  theme?: "cyber" | "neon" | "glass" | "retro";
}

export interface BuildProjectResponse {
  projectName: string;
  blueprint: WebsiteBlueprint;
  codePath: string;
  url: string;
  timestamp: string;
}

export class WebsiteFactoryOrchestrator {
  private static instance: WebsiteFactoryOrchestrator;

  private constructor() {}

  public static getInstance(): WebsiteFactoryOrchestrator {
    if (!WebsiteFactoryOrchestrator.instance) {
      WebsiteFactoryOrchestrator.instance = new WebsiteFactoryOrchestrator();
    }
    return WebsiteFactoryOrchestrator.instance;
  }

  /**
   * Generates coherent design system tokens based on theme
   */
  private generateDesignSystem(theme: string = "cyber") {
    switch (theme) {
      case "neon":
        return {
          primaryColor: "#ec4899", // Fuchsia
          secondaryColor: "#10b981", // Emerald
          accentColor: "#f59e0b", // Amber
          bgGradient: "from-fuchsia-500 to-emerald-500",
          fontFamily: "font-mono"
        };
      case "glass":
        return {
          primaryColor: "#38bdf8",
          secondaryColor: "#818cf8",
          accentColor: "#c084fc",
          bgGradient: "from-sky-400 via-indigo-400 to-purple-400",
          fontFamily: "font-sans"
        };
      case "retro":
        return {
          primaryColor: "#f97316", // Orange
          secondaryColor: "#eab308", // Yellow
          accentColor: "#ef4444", // Red
          bgGradient: "from-orange-500 to-yellow-500",
          fontFamily: "font-serif"
        };
      case "cyber":
      default:
        return {
          primaryColor: "#00f0ff", // Cyber Cyan
          secondaryColor: "#7000ff", // Cyber Purple
          accentColor: "#ff0070", // Pink
          bgGradient: "from-cyber-cyan to-cyber-purple",
          fontFamily: "font-mono"
        };
    }
  }

  /**
   * Main build website pipeline
   */
  public async buildWebsite(req: BuildProjectRequest): Promise<BuildProjectResponse> {
    const timestamp = new Date().toISOString();
    const cleanName = req.name.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();

    // 1. Initialize design system tokens
    const designSystem = this.generateDesignSystem(req.theme);

    // 2. Formulate blueprint configuration
    const blueprint: WebsiteBlueprint = {
      name: cleanName,
      type: req.type,
      title: `Project ${req.name}`,
      description: `A next-generation digital interface synthesized from instructions: "${req.prompt}"`,
      designSystem,
      pages: ["index", "about", "features", "contact"],
      features: [
        "Dynamic Media Streaming",
        "Unified Cognitive AI Routing",
        "Sovereign WAL Mode Database",
        "Glassmorphism Cyber Theme Layout"
      ],
      hasChat: true,
      hasVideo: true
    };

    // 3. Generate Image Visual Asset
    let imageUrl = "/generated-assets/images/img_1787464656222_33869123.svg";
    try {
      const imgRes = await imageService.generateImage({
        prompt: `Beautiful futuristic hero illustration for ${blueprint.title} website`,
        aspectRatio: "16:9",
        workspaceId: "factory"
      });
      imageUrl = imgRes.asset.path;
    } catch (err: any) {
      console.warn("Factory image asset generation failed, using fallback:", err.message);
    }

    // 4. Generate Video Visual Asset
    let videoUrl = "/generated-assets/video/vid_1787464656314_70f4d4e0.webm";
    try {
      const vidRes = await videoService.generateVideo({
        title: blueprint.title,
        description: blueprint.description,
        scenes: [{
          sceneId: "scene_001",
          durationSeconds: 5,
          title: `Opening scene of ${blueprint.title}`,
          visualPrompt: `Opening scene of ${blueprint.title} video`,
          voiceoverText: "System initialized"
        }],
        workspaceId: "factory"
      });
      videoUrl = vidRes.asset.path;
    } catch (err: any) {
      console.warn("Factory video asset generation failed, using fallback:", err.message);
    }

    blueprint.imageUrl = imageUrl;
    blueprint.videoUrl = videoUrl;

    // 5. Generate Component TSX code
    const pageCode = websiteCodeSynthesizer.generateMainPageCode(blueprint);

    // 6. Write code to dynamic route directory: src/app/generated/[projectName]/page.tsx
    const generatedDir = path.resolve(process.cwd(), "src", "app", "generated", cleanName);
    if (!fs.existsSync(generatedDir)) {
      fs.mkdirSync(generatedDir, { recursive: true });
    }
    const codePath = path.join(generatedDir, "page.tsx");
    fs.writeFileSync(codePath, pageCode, "utf-8");

    // 7. Write project metadata in .antigravity/projects/[projectName]/
    const projectDir = path.resolve(process.cwd(), ".antigravity", "projects", cleanName);
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(projectDir, "project.json"),
      JSON.stringify({ projectName: cleanName, blueprint, generatedAt: timestamp }, null, 2),
      "utf-8"
    );

    // 8. Log registration inside SQLite Database as a persistent asset metadata tracking event
    try {
      // Find or create default user for tracking
      const defaultUser = await prisma.user.findFirst();
      const defaultProject = await prisma.project.findFirst();
      if (defaultUser && defaultProject) {
        await prisma.asset.create({
          data: {
            projectId: defaultProject.id,
            ownerId: defaultUser.id,
            type: "CODE",
            mimeType: "text/typescript",
            format: "TSX",
            sizeBytes: pageCode.length,
            hashSha256: crypto.createHash("sha256").update(pageCode).digest("hex"),
            path: `/generated/${cleanName}`,
            prompt: req.prompt,
            executionMode: "LOCAL"
          }
        }).catch(() => {});
      }
    } catch (dbErr) {
      console.warn("Failed to persist factory code asset event inside SQLite:", dbErr);
    }

    return {
      projectName: cleanName,
      blueprint,
      codePath: `src/app/generated/${cleanName}/page.tsx`,
      url: `/generated/${cleanName}`,
      timestamp
    };
  }
}

export const websiteFactoryOrchestrator = WebsiteFactoryOrchestrator.getInstance();
