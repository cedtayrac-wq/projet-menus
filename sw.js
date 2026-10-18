const CACHE_NAME = 'menu-semaine-v222';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './data/config.js',
  './data/recipes.js',
  './app.js',
  './manifest.json',
  './assets/icon.svg',
  './assets/icon-192.png',
  './assets/icon-512.png',
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
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Stratégie Network-First avec repli hors-ligne (supermarché sans réseau)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request, { cache: 'no-cache' })
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
