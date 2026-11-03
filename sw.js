// Offline-Cache für die App-Hülle. Produktdaten werden nie zwischengespeichert.
const CACHE = "schwanger-check-v12";
const SHELL = ["./", "index.html", "app.js", "engine.js", "weeks.js", "baby3d.js", "tools.js", "meds.js", "vendor/three.min.js", "vendor/zxing.min.js", "manifest.webmanifest",
  "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return; // Datenbank & Fonts direkt aus dem Netz
  // Erst Netz (für Updates), bei Offline aus dem Cache
  e.respondWith(
    fetch(e.request.url, { cache: "no-cache" }).then((res) => {
      if (!res.ok) return caches.match(e.request, { ignoreSearch: true }).then((r) => r || res);
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match("index.html")))
  );
});
