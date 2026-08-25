import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public paths that do not require authentication
const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/api/health",
  "/api/omnicraft/auth",
  "/favicon.ico",
];

// Sensitive file patterns that must never be served publicly
const SENSITIVE_PATH_PATTERNS = [
  /^\/\.env/,
  /^\/\.git/,
  /\.db(-shm|-wal)?$/,
  /^\/prisma\/.*\.db/,
  /^\/scripts\//,
];

/**
 * Sanitizes callback URL to ensure it is strictly an internal relative path.
 */
function sanitizeCallbackUrl(url: string | null): string {
  if (!url) return "/";
  const trimmed = url.trim();
  if (
    trimmed.startsWith("/") &&
    !trimmed.startsWith("//") &&
    !trimmed.startsWith("/\\") &&
    !trimmed.includes(":")
  ) {
    return trimmed;
  }
  return "/";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Explicitly block sensitive filesystem and config paths
  if (SENSITIVE_PATH_PATTERNS.some((pattern) => pattern.test(pathname))) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // 2. CSRF / Origin Validation for State-Changing Requests (POST, PUT, DELETE, PATCH)
  if (["POST", "PUT", "DELETE", "PATCH"].includes(request.method) && pathname.startsWith("/api/")) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");

    if (origin && host) {
      try {
        const originUrl = new URL(origin);
        // Compare hostnames
        if (originUrl.host !== host) {
          return NextResponse.json(
            {
              success: false,
              error: "Forbidden: Origin validation failed (CSRF defense).",
              code: "CSRF_ORIGIN_MISMATCH",
            },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          { success: false, error: "Forbidden: Malformed request origin header." },
          { status: 403 }
        );
      }
    }
  }

  // 3. Allow public static assets and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    (pathname.includes(".") && !pathname.endsWith(".db")) || // static icons, webmanifest
    PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + "/"))
  ) {
    return applySecurityHeaders(NextResponse.next());
  }

  // 4. Session Validation
  const sessionToken =
    request.cookies.get("omnicraft_session")?.value ||
    request.headers.get("Authorization")?.replace("Bearer ", "");

  const isProtectedPath =
    pathname.startsWith("/api/") ||
    pathname === "/" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/ai") ||
    pathname.startsWith("/factory") ||
    pathname.startsWith("/media") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/terminal") ||
    pathname.startsWith("/agents") ||
    pathname.startsWith("/mcp") ||
    pathname.startsWith("/deployments") ||
    pathname.startsWith("/files") ||
    pathname.startsWith("/todo-notes") ||
    pathname.startsWith("/health-center") ||
    pathname.startsWith("/certification") ||
    pathname.startsWith("/projects");

  if (isProtectedPath && !sessionToken) {
    // If it's an API request, return 401 Unauthorized JSON
    if (pathname.startsWith("/api/")) {
      const response = NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Active operator session required",
          code: "AUTH_SESSION_REQUIRED",
        },
        { status: 401 }
      );
      return applySecurityHeaders(response);
    }

    // Redirect to /login with sanitized callbackUrl
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("callbackUrl", sanitizeCallbackUrl(pathname));
    }
    return applySecurityHeaders(NextResponse.redirect(loginUrl));
  }

  // If user is already authenticated and visits /login or /signup, redirect to /
  if ((pathname === "/login" || pathname === "/signup") && sessionToken) {
    return applySecurityHeaders(NextResponse.redirect(new URL("/", request.url)));
  }

  return applySecurityHeaders(NextResponse.next());
}

/**
 * Injects enterprise HTTP security headers and CSP
 */
function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), browsing-topics=()"
  );

  // Content Security Policy
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com data:;
    img-src 'self' data: blob: https:;
    connect-src 'self' ws: wss: http: https:;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  response.headers.set("Content-Security-Policy", cspHeader);

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
