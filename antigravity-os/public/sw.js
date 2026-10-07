/**
 * Antigravity OS v7.0 Production Service Worker
 * Secure Offline Shell & Safe Cache Strategy
 * 
 * STRICT PRIVACY RULE:
 * NEVER cache secrets, tokens, private credentials, or protected evidence.
 */

const CACHE_NAME = "antigravity-os-v7-shell-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/assets/icons/icon-192.png",
  "/assets/icons/icon-512.png"
];

// URLs that MUST NEVER be cached
const SENSITIVE_PATTERNS = [
  /\/api\/auth/,
  /\/api\/omnicraft\/auth/,
  /\/api\/secrets/,
  /\/api\/evidence\/private/,
  /\/api\/keys/,
  /\/api\/env/
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("[SW] Pre-caching non-fatal warning:", err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // Strictly skip caching sensitive endpoints
  if (SENSITIVE_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    return;
  }

  // Network-first with stale-while-revalidate fallback for app shell navigation
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            return cached || caches.match("/");
          });
        })
    );
    return;
  }

  // Cache static assets (CSS, JS, Fonts, Images)
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/assets/") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg")
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
  }
});
