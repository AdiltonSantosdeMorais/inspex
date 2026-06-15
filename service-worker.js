const CACHE_NAME = 'inspex-v6-cache';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/logo-elecnor.png',
  '/static/inspex.jpg',
  '/static/config.js'
];

// Instalación del Service Worker y almacenamiento en cache de recursos locales
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Estratégia: Red con Fallback a Cache (Garantiza funcionamiento en la app y validación limpia en PWABuilder)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

// Limpieza de versiones obsoletas de cache
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});