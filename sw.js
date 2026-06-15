// Atualizado para v22 para forçar o tablet a regravar as funções dos botões
const CACHE_NAME = 'inspex-cache-v22';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/logo-elecnor.png',
  '/static/inspex.png',
  '/static/config.js' // Garante que o arquivo de configuração rode sem internet
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Gravando pacotes offline do InspeX...');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); 
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Limpando cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request);
    })
  );
});
