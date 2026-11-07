// BSG Préproduction — Service Worker isolé
// Ne met en cache que la coque publique de préproduction.
const CACHE_NAME = 'bsg-preproduction-v1';
const APP_BASE = '/rapperlifesimulator/';
const APP_SHELL = [
  APP_BASE,
  APP_BASE + 'index.html',
  APP_BASE + 'manifest.json',
  '/bsg-app/icon-192.png',
  '/bsg-app/icon-512.png'
];

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
      .then(keys => Promise.all(keys
        .filter(key => key.startsWith('bsg-preproduction-') && key !== CACHE_NAME)
        .map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isShellAsset = APP_SHELL.includes(url.pathname);
  if (!isShellAsset && !(request.mode === 'navigate' && url.pathname.startsWith(APP_BASE))) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    if (isShellAsset) {
      const cached = await cache.match(request);
      if (cached) {
        fetch(request).then(response => {
          if (response && response.ok) cache.put(request, response.clone());
        }).catch(() => {});
        return cached;
      }
    }
    try {
      const response = await fetch(request);
      if (response && response.ok && isShellAsset) await cache.put(request, response.clone());
      return response;
    } catch (error) {
      if (request.mode === 'navigate') {
        return (await cache.match(APP_BASE + 'index.html')) || new Response('Préproduction indisponible hors ligne', {status:503});
      }
      return new Response('', {status:503, statusText:'Ressource indisponible hors ligne'});
    }
  })());
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
