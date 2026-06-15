// Atualizado para v17 para forçar o tablet a limpar o cache velho e gravar a lista estática
const CACHE_NAME = 'inspex-cache-v17';

const urlsToCache = [
  '/',                     // Tela inicial (index.html)
  '/index.html',
  '/manifest.json',
  '/static/logo-elecnor.png',
  '/static/inspex.png',
  
  // Lista dos checklists para o tablet baixar e salvar direto no armazenamento interno:
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

// Instalação: Baixa absolutamente tudo para o armazenamento do tablet
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Gravando de forma estática todos os recursos do InspeX...');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); 
});

// Ativação: Deleta qualquer cache antigo para não travar a tela
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estratégia Cache-First pura (Igual ao seu outro app de sucesso)
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Se o arquivo estiver na lista estática gravada no tablet, entrega na hora sem tremer e sem precisar de rede
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Se não estiver (ex: link externo), busca na rede
      return fetch(event.request);
    })
  );
});