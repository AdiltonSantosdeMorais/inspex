const CACHE_NAME = 'inspex-static-cache-v2';

// Lista exata de todos os seus arquivos para o tablet decorar de uma vez só
const assetsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/logo-elecnor.png',
  '/static/inspex.png',
  '/static/config.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  
  // Todos os 24 checklists mapeados estaticamente
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
  '/checklist/taladro_de_rocka.html',
  '/checklist/tractor_de_neumaticos.html',
  '/checklist/tractor_orugas_motoniveladora.html',
  '/checklist/transporte_colectivo_furgonetas.html',
  '/checklist/vehiculos_ligeros_camionetas.html'
];

// Instala o Service Worker e força o download de tudo para o aparelho
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Baixando todos os checklists para o modo offline...');
      return cache.addAll(assetsToCache);
    }).then(() => self.skipWaiting())
  );
});

// Ativa e limpa caches antigos para não dar conflito
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => clients.claim())
  );
});

// Gerenciamento de requisições: Puxa do Cache Primeiro (Cache-First) para evitar tremer a tela
self.addEventListener('fetch', e => {
  // Ignora requisições de extensões de navegador ou esquemas estranhos
  if (!e.request.url.startsWith(self.location.origin) && !e.request.url.startsWith('https://cdnjs.cloudflare.com')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      // Se já estiver salvo na memória do tablet, entrega na hora sem ir para a internet
      if (cachedResponse) {
        return cachedResponse;
      }
      // Se não estiver, vai buscar na rede
      return fetch(e.request);
    })
  );
});