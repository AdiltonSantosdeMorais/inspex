const CACHE_NAME = 'inspex-cache-v2'; // Mudando o nome da versão o tablet é forçado a atualizar

// Arquivos para carregar inicialmente
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/logo-elecnor.png',
  '/static/inspex.png'
];

// Instalação e ativação imediata (ignora esperas)
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// LIMPEZA CRÍTICA: Deleta absolutamente todos os caches velhos que estão travando o tablet
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Deletando cache antigo travado:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estratégia Network-First: Sempre tenta buscar a versão nova do servidor primeiro. 
// Se estiver offline, aí sim ele usa o cache. Isso impede o erro de travar novamente.
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).then(response => {
      // Se a rede responder, atualiza o cache com a versão nova
      if (response && response.status === 200 && event.request.method === 'GET') {
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
      }
      return response;
    }).catch(() => {
      // Se estiver totalmente sem internet (Offline), usa o cache
      return caches.match(event.request);
    })
  );
});
