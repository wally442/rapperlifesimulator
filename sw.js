// =====================================================================
// SERVICE WORKER BSG — cache PWA limité aux ressources statiques
// Version 5 — chemin GitHub Pages : /rapperlifesimulator/
// =====================================================================

const CACHE_NAME = 'bsg-cache-v5';
const APP_BASE = '/rapperlifesimulator/';
const APP_SHELL = [
  APP_BASE,
  APP_BASE + 'manifest.json'
];
const STATIC_ASSET = /\.(?:js|css|png|jpe?g|webp|svg|ico|woff2?|ttf|otf)$/i;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith('bsg-cache-') && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

function isCacheableAppRequest(request, url) {
  if (request.method !== 'GET') return false;
  if (url.origin !== self.location.origin) return false;
  if (!url.pathname.startsWith(APP_BASE)) return false;
  if (url.search || url.hash) return false;
  if (request.headers.has('authorization')) return false;

  // Seuls le shell PWA et les fichiers statiques sont mis en cache.
  // Les réponses métier/API ne sont jamais stockées par ce service worker.
  return APP_SHELL.includes(url.pathname) ||
    url.pathname === APP_BASE + 'index.html' ||
    STATIC_ASSET.test(url.pathname);
}

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (!isCacheableAppRequest(request, url)) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(async cache => {
              await cache.put(request, copy);
              if (url.pathname === APP_BASE || url.pathname === APP_BASE + 'index.html') {
                await cache.put(APP_BASE, response.clone());
              }
            });
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request) || await caches.match(APP_BASE);
          return cached || new Response('Application indisponible hors ligne.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request).then(response => {
        if (response && response.ok) {
          caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
        }
        return response;
      });
      return cached || network;
    })
  );
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
