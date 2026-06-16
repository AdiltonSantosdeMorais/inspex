const CACHE_NAME = 'inspex-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/logo-elecnor.png',
  '/static/inspex.png',
  
  // 🔥 ADICIONE ESTAS LINHAS ABAIXO NO SEU sw.js PARA ARMAZENAR OS CHECKLISTS NO TABLET:
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

// Evento de Instalação: Guarda tudo no dispositivo
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Evento de Busca: Serve os arquivos direto do cache local (mesmo sem internet)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
