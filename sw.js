// Vågen offline cache. Bump VERSION on every deploy that changes files.
const VERSION = "vagen-2026-10-27-1";
const SHELL = [
  "./",
  "index.html",
  "firebase-config.js",
  "manifest.webmanifest",
  "vendor/firebase-app-compat.js",
  "vendor/firebase-auth-compat.js",
  "vendor/firebase-firestore-compat.js",
  "vendor/zxing.min.js",
  "data/off-se.json",
  "data/livsmedel.json",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png"
];
const FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith("vagen-") && k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Fonts: cache first.
  if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(caches.open(VERSION).then(async c => {
      const hit = await c.match(req); if (hit) return hit;
      const res = await fetch(req); if (res.ok || res.type === "opaque") c.put(req, res.clone()); return res;
    }));
    return;
  }
  // Firebase and everything else off-site: leave to the network (Firestore keeps its own offline copy).
  if (url.origin !== self.location.origin) return;

  // The page and its config: network first so updates arrive, cache when offline.
  const isPage = req.mode === "navigate" || url.pathname.endsWith("/index.html") || url.pathname.endsWith("/firebase-config.js");
  if (isPage) {
    event.respondWith(fetch(req).then(res => {
      if (res.ok) caches.open(VERSION).then(c => c.put(req.mode === "navigate" ? "index.html" : req, res.clone()));
      return res;
    }).catch(async () => (await caches.match(req)) || (await caches.match("index.html"))));
    return;
  }
  // Other files from this app: cache first, refresh in the background.
  event.respondWith(caches.open(VERSION).then(async c => {
    const hit = await c.match(req);
    const fresh = fetch(req).then(res => { if (res.ok) c.put(req, res.clone()); return res; }).catch(() => null);
    return hit || (await fresh) || new Response("", { status: 504 });
  }));
});
