import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { imageProvider } from "../src/lib/providers/image";

const execAsync = promisify(exec);

async function generateCreativeAssets() {
  const targetDir = path.resolve(process.cwd(), "public", "assets", "creative");
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // 1. Refined geometric gold SVG emblem
  const svgEmblem = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
    <defs>
      <linearGradient id="goldGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFD978"/>
        <stop offset="50%" stop-color="#F5C451"/>
        <stop offset="100%" stop-color="#B88622"/>
      </linearGradient>
      <linearGradient id="darkBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#11100D"/>
        <stop offset="100%" stop-color="#050505"/>
      </linearGradient>
    </defs>
    <rect width="120" height="120" rx="28" fill="url(#darkBg)" stroke="#F5C451" stroke-width="2"/>
    <circle cx="60" cy="60" r="42" fill="none" stroke="#B88622" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.6"/>
    <!-- Outer sovereign polygon -->
    <polygon points="60,22 92,40 92,78 60,96 28,78 28,40" fill="none" stroke="url(#goldGlow)" stroke-width="2.5"/>
    <!-- Inner orbital core -->
    <circle cx="60" cy="60" r="14" fill="#17140D" stroke="#FFD978" stroke-width="2"/>
    <polygon points="60,50 69,65 51,65" fill="url(#goldGlow)"/>
  </svg>`;

  fs.writeFileSync(path.join(targetDir, "antigravity-sovereign-emblem.svg"), svgEmblem, "utf8");
  console.log("Created antigravity-sovereign-emblem.svg");

  const assetSpecs = [
    {
      name: "sovereign-creative-studio-hero.webp",
      prompt: "Wide black and gold orbital landscape with a giant ringed planet and golden command station, cinematic 8k",
      aspectRatio: "16:9" as const,
    },
    {
      name: "sovereign-image-preview.webp",
      prompt: "Original cinematic golden holographic subject on an obsidian black background, photorealistic",
      aspectRatio: "1:1" as const,
    },
    {
      name: "sovereign-audio-visual.webp",
      prompt: "Elegant abstract sound wave acoustic visualization in polished metallic gold, dark studio lighting",
      aspectRatio: "16:9" as const,
    },
    {
      name: "sovereign-video-preview.webp",
      prompt: "Cinematic futuristic environment with a gold lit horizon and atmospheric nebula particles",
      aspectRatio: "16:9" as const,
    },
    {
      name: "sovereign-creative-empty-state.webp",
      prompt: "Minimal golden orbital geometric object floating with clean obsidian negative space",
      aspectRatio: "1:1" as const,
    },
  ];

  for (const spec of assetSpecs) {
    const destPath = path.join(targetDir, spec.name);
    try {
      console.log(`Synthesizing asset: ${spec.name}...`);
      const imgRes = await imageProvider.generateImage({
        prompt: spec.prompt,
        aspectRatio: spec.aspectRatio,
        allowFallback: true,
      });

      if (imgRes.success && fs.existsSync(imgRes.localPath)) {
        // Convert to WebP using native FFmpeg
        await execAsync(`ffmpeg -y -i "${imgRes.localPath}" -c:v libwebp -quality 85 "${destPath}"`);
        console.log(`Saved WebP: ${spec.name} (${fs.statSync(destPath).size} bytes)`);
      }
    } catch (err) {
      console.warn(`Could not synthesize ${spec.name}:`, err);
    }
  }

  console.log("Creative assets generation completed.");
}

generateCreativeAssets().catch(console.error);
