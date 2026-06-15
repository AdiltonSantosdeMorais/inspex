// Atualizado para v15 para forçar o tablet a limpar o loop que fazia a tela tremer
const CACHE_NAME = 'inspex-cache-v15';
const urlsToCache = [
  '/',                     // Tela principal (index.html)
  '/static/logo-elecnor.png',
  '/static/inspex.png',
  '/manifest.json'
];

// Instalação do Service Worker e armazenamento das rotas essenciais
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Armazenando recursos essenciais do InspeX...');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); 
});

// Limpeza de caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Removendo cache antigo do InspeX:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ESTRATÉGIA CACHE-FIRST IDENTICA AO SEU OUTRO APP:
self.addEventListener('fetch', event => {
  // Ignora requisições de envio do formulário (POST)
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        // Se encontrou no cache (HTML, Ícones, subpáginas), entrega imediatamente sem tremer
        return cachedResponse;
      }

      // Se não estiver no cache, busca na rede e salva uma cópia automaticamente na memória
      return fetch(event.request).then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Fallback offline se a rede falhar
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});