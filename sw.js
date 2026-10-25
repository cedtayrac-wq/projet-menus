const CACHE_NAME = 'menu-semaine-v254';
const CORE_ASSETS = [
  './',
  './index.html',
  './tts-relay.html',
  './styles.css',
  './data/config.js',
  './data/recipes.js',
  './app.js',
  './manifest.json',
  './assets/icon.svg',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

const MEDIA_ASSETS = [
  './assets/personas/maite.jpg',
  './assets/personas/lignac.jpg',
  './assets/personas/bocuse.jpg',
  './assets/personas/marx.jpg',
  './assets/personas/etchebest.png',
  './assets/personas/coffe.jpg',
  './assets/personas/ia_homme.jpg',
  './assets/personas/ia_femme.jpg',
  './assets/voices/maite.mp3',
  './assets/voices/lignac.mp3',
  './assets/voices/bocuse.mp3',
  './assets/voices/marx.mp3',
  './assets/voices/etchebest.mp3',
  './assets/voices/coffe.mp3',
  './assets/voices/ia_homme.mp3',
  './assets/voices/ia_femme.mp3'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // 1. Précharger immédiatement la coquille de l'application en contournant le cache HTTP
      await Promise.all(
        CORE_ASSETS.map(async (url) => {
          try {
            const resp = await fetch(url, { cache: 'reload' });
            if (resp && resp.ok) {
              await cache.put(url, resp);
            }
          } catch (e) {}
        })
      );
      // 2. Précharger les médias en arrière-plan sans bloquer l'activation PWA
      MEDIA_ASSETS.forEach((url) => {
        fetch(url)
          .then((resp) => {
            if (resp && resp.ok) cache.put(url, resp);
          })
          .catch(() => {});
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Stratégie Network-First sans erreur sur les requêtes de navigation (mode: 'navigate')
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const reqUrl = event.request.url || '';
  if (
    !reqUrl.startsWith(self.location.origin) ||
    reqUrl.includes('/api/') ||
    event.request.headers.has('range')
  ) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // Pour les requêtes de navigation ou scripts/CSS, passer l'URL avec cache: 'no-cache'
        // (ne jamais passer un objet Request avec mode: 'navigate' et un RequestInit non vide)
        const networkResponse =
          event.request.mode === 'navigate'
            ? await fetch(event.request.url, { cache: 'no-cache' })
            : await fetch(event.request);

        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      } catch (err) {
        const cachedResponse = await caches.match(event.request, { ignoreSearch: true });
        if (cachedResponse) return cachedResponse;
        if (event.request.mode === 'navigate') {
          const fallback = await caches.match('./index.html', { ignoreSearch: true });
          if (fallback) return fallback;
        }
        throw err;
      }
    })()
  );
});
