// Atualizado para v16 para forçar o tablet a resetar as permissões de pasta
const CACHE_NAME = 'inspex-cache-v16';
const urlsToCache = [
  '/',                     // Tela inicial (index.html)
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

// ESTRATÉGIA CACHE-FIRST ADAPTADA PARA SUBPASTAS:
self.addEventListener('fetch', event => {
  // Ignora requisições de envio do formulário (POST)
  if (event.request.method !== 'GET') {
    return;
  }

  // CORREÇÃO CRÍTICA: Permite o carregamento da raiz OU de qualquer arquivo dentro da pasta /checklist/
  const url = event.request.url;
  const isLocal = url.startsWith(self.location.origin);
  const isChecklist = url.includes('/checklist/');

  if (!isLocal && !isChecklist) {
    return; // Bloqueia apenas o que for realmente externo e estranho
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        // Se a página do checklist já estiver na memória, entrega na hora sem tremer!
        return cachedResponse;
      }

      // Se não estiver no cache ainda, busca na rede e guarda uma cópia na memória do tablet
      return fetch(event.request).then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Se estiver totalmente sem internet e o arquivo não foi aberto antes, volta para a lista
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});