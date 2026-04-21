const CACHE_NAME = 'proserpine-v4.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/auth.html',
  '/home.html',
  '/product.html',
  '/guide.html',
  '/guide-detail.html',
  '/tips.html',
  '/profile.html',
  '/algo.html',
  '/css/style.css',
  '/js/firebase-config.js',
  '/js/scoring_engine.js',
  '/js/logic.js',
  '/js/dataManager.js',
  '/js/auth.js',
  '/js/home.js',
  '/js/product.js',
  '/js/guide-detail.js',
  '/js/profile.js',
  '/manifest.json'
];

// Installation : Mise en cache des fichiers de base et activation immédiate
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activation : Nettoyage & Contrôle immédiat
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }));
    })
  );
  self.clients.claim();
});

// Stratégies de Mise en cache avancées
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Proxy API Vercel : Network First (on veut les données fraîches)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 2. Google Fonts & Static Assets : Cache First
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com' || STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((fetchRes) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, fetchRes.clone());
            return fetchRes;
          });
        });
      })
    );
    return;
  }

  // 3. Autres (Images, etc) : Stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      });
      return cachedResponse || fetchPromise;
    })
  );
});