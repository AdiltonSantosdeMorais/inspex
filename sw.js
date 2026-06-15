const CACHE_NAME = 'inspex-cache-v1';

// O Service Worker intercepta e salva tudo o que o app abrir automaticamente
self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

// A MÁGICA: Sempre que abrir uma página, ele guarda uma cópia no tablet.
// Se o técnico estiver sem internet, ele carrega essa cópia salva!
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse; // Retorna do cache se estiver offline
      }
      return fetch(e.request).then(response => {
        // Guarda no cache para a próxima vez que estiver offline
        if (response.status === 200 && e.request.url.includes('.html')) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, responseClone);
          });
        }
        return response;
      });
    }).catch(() => caches.match('/'))
  );
});