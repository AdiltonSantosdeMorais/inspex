const CACHE_NAME = 'inspex-cache-v3'; // Versão atualizada para forçar o tablet a renovar o cache

// LISTA COMPLETA DOS SEUS ARQUIVOS (Baseado na estrutura das suas pastas)
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/logo-elecnor.png',
  '/static/inspex.png',
  
  // Rotas dos arquivos da sua pasta /checklist
  '/checklist/ambulancia.html',
  '/checklist/camion_aljibe.html',
  '/checklist/camion_betonera.html',
  '/checklist/camion_cama_baja.html',
  '/checklist/camion_de_petroleo.html',
  '/checklist/camion_tolva.html',
  '/checklist/camiones_3_4.html',
  '/checklist/eslingas_y_grilletes.html',
  '/checklist/excavadora_hidraulica.html',
  '/checklist/grua_y_pluma.html',
  '/checklist/manipuladora_telescopica.html',
  '/checklist/maquina_perforadora.html',
  '/checklist/mini_rodillo_compactador.html',
  '/checklist/miniexcavadora_mini_carregadora.html',
  '/checklist/motor_generador.html',
  '/checklist/plataforma_pta.html',
  '/checklist/remolque_tanque_de_petroleo.html',
  '/checklist/retroexcavadora.html',
  '/checklist/rodillo_compactador.html',
  '/checklist/taladro_de_roca.html',
  '/checklist/tractor_de_neumaticos.html',
  '/checklist/tractor_orugas_motoniveladora.html',
  '/checklist/transporte_colectivo_furgonetas.html',
  '/checklist/vehiculos_ligeros_camionetas.html'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Limpa caches antigos e ativa o novo imediatamente
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estratégia Network-First com Fallback para Cache Offline
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).then(response => {
      if (response && response.status === 200 && event.request.method === 'GET') {
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
      }
      return response;
    }).catch(() => {
      return caches.match(event.request);
    })
  );
});
