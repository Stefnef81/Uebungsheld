const CACHE_NAME = 'uebungsheld-v1';
const ASSETS = [
  './uebungsheld_v3.html',
  'https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;700;800;900&display=swap',
  'https://cdn.jsdelivr.net/npm/abcjs@6.4.3/dist/abcjs-basic-min.js'
];

// Installation: Assets cachen
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Aktivierung: alte Caches löschen
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: Cache-first Strategie
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if(cached) return cached;
      return fetch(e.request).then(response => {
        // Nur erfolgreiche Antworten cachen
        if(!response || response.status !== 200 || response.type === 'opaque')
          return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return response;
      }).catch(() => {
        // Offline-Fallback: HTML zurückgeben
        if(e.request.destination === 'document')
          return caches.match('./uebungsheld_v3.html');
      });
    })
  );
});
