const CACHE_NAME = "pizarron-pwa-v1";

const APP_SHELL = [
  "./",
  "./indice.html",
  "./reporte.html",
  "./shared.js",
  "./manifest.json",

  // CDN (Chart.js + SheetJS)
  "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js",
  "https://cdn.jsdelivr.net/npm/xlsx@0.19.3/dist/xlsx.full.min.js"
];

// ===== INSTALL =====
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

// ===== ACTIVATE =====
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

// ===== FETCH =====
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Solo GET
  if (req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((res) => {
          // Guardar en cache dinámico
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, res.clone());
            return res;
          });
        })
        .catch(() => {
          // Fallback básico
          if (req.destination === "document") {
            return caches.match("./indice.html");
          }
        });
    })
  );
});