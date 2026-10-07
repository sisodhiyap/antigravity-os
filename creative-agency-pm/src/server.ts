import http from "http";
import url from "url";
import path from "path";
import fs from "fs";
import { CONFIG } from "./config";
import { seedDatabase } from "./db/seed";
import { handleApiRequest } from "./routes/api";

// Seed sample creative agency records
seedDatabase();

// MIME type dictionary
const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf"
};

export const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url || "/", true);
  const pathname = parsedUrl.pathname || "/";
  const method = req.method || "GET";

  // Global Security Shield: Path Traversal, Dotfiles & Metacharacter Block
  const rawUrl = req.url || "/";
  if (
    rawUrl.includes("..") ||
    rawUrl.includes("%2e%2e") ||
    rawUrl.includes("%2E%2E") ||
    rawUrl.includes("\\") ||
    pathname.startsWith("/.") ||
    pathname.includes("/.")
  ) {
    res.writeHead(403, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Security Exception: Access denied to protected file or directory", code: "SECURITY_ACCESS_DENIED" }));
    return;
  }

  // Global Security & CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Demo-User");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Content-Security-Policy", "default-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://fonts.gstatic.com https://images.unsplash.com data:;");

  if (method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. Check API Routes
  const handled = await handleApiRequest(req, res, pathname, method, parsedUrl.query as any);
  if (handled) return;

  // 2. Static File Server with Path Traversal Defense
  const publicDir = path.resolve(__dirname, "public");
  let safePath = path.normalize(path.join(publicDir, pathname === "/" ? "index.html" : pathname));

  // Security barrier: prevent directory breakout
  if (!safePath.startsWith(publicDir)) {
    res.writeHead(403, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Access Denied: Path traversal detected", code: "SECURITY_PATH_TRAVERSAL_BLOCKED" }));
    return;
  }

  if (fs.existsSync(safePath) && fs.statSync(safePath).isFile()) {
    const ext = path.extname(safePath);
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    fs.createReadStream(safePath).pipe(res);
    return;
  }

  // SPA Fallback ONLY for HTML page routes without file extensions
  if (!path.extname(pathname)) {
    const fallbackIndex = path.join(publicDir, "index.html");
    if (fs.existsSync(fallbackIndex)) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      fs.createReadStream(fallbackIndex).pipe(res);
      return;
    }
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "File or resource not found" }));
});

export function startServer(port = CONFIG.PORT): Promise<http.Server> {
  return new Promise((resolve) => {
    server.listen(port, CONFIG.HOST, () => {
      console.log(`[Aura Studio OS] Running on http://${CONFIG.HOST}:${port}`);
      resolve(server);
    });
  });
}

if (require.main === module) {
  startServer(CONFIG.PORT);
}
