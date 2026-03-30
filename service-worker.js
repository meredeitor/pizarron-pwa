const CACHE_NAME = "pizarron-pwa-v2";

const APP_SHELL = [
  "./",
  "./index.html",
  "./reporte.html",
  "./shared.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// INSTALL
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch((err) => console.error("Cache error:", err))
  );
  self.skipWaiting();
});

// ACTIVATE
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// FETCH
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;

  // HTML → network first (con fallback offline correcto)
  if (req.destination === "document") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() =>
          caches.match(req, { ignoreSearch: true })
            .then((match) => match || caches.match("./index.html"))
        )
    );
    return;
  }

  // Assets → cache first (solo mismo origen)
  if (!isSameOrigin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req).then((res) => {
        if (!res || res.status !== 200) return res;

        // Micro-regla segura: no cachear si el server lo marca como no-store
        const cc = res.headers.get("Cache-Control") || "";
        if (cc.includes("no-store")) return res;

        const copy = res.clone();
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(req, copy);
          return res;
        });
      });
    })
  );
});
