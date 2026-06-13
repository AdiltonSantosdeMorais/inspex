const CACHE_NAME = 'inspex-v2';

// Lista completa de arquivos que o celular vai salvar para abrir sem internet
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/service-worker.js',
    '/static/logo-elecnor.png',
    '/static/inspex.jpg',
    '/ambulancia.html',
    '/camion_aljibe.html',
    '/camion_cama_baja.html',
    '/camion_de_petroleo.html',
    '/camion_tolva.html',
    '/camiones_3_4.html',
    '/camion_betonera.html',
    '/eslingas_y_grilletes.html',
    '/excavadora_hidraulica.html',
    '/grua_y_pluma.html',
    '/manipuladora_telescopica.html',
    '/maquina_perforadora.html',
    '/mini_rodillo_compactador.html',
    '/miniexcavadora_mini_carregadora.html',
    '/motor_generador.html',
    '/plataforma_altura.html',
    '/remolque_tanque.html',
    '/retroexcavadora.html',
    '/rodillo_compactador.html',
    '/taladro_roca.html',
    '/tractor_neumaticos.html',
    '/tractor_orugas_motoniveladora.html',
    '/transporte_colectivo.html',
    '/vehiculos_ligeros.html'
];

// Instala o Service Worker e guarda os arquivos no cache do celular
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('InspeX: Salvando arquivos para uso offline...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Remove caches antigos quando houver atualização do app
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('InspeX: Limpando cache antigo...');
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Intercepta a rede: Se estiver sem internet, puxa direto da memória do celular
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).catch(() => {
                // Se a rota limpa falhar (ex: /checklist/miniexcavadora), tenta achar o HTML correspondente
                const url = new URL(event.request.url);
                if (url.pathname.startsWith('/checklist/')) {
                    const nomeArquivo = url.pathname.replace('/checklist/', '') + '.html';
                    return caches.match('/' + nomeArquivo);
                }
            });
        })
    );
});