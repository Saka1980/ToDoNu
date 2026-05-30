// ToDoNu service worker — offline-stöd.
// Strategi: network-first för HTML (nya deploys fastnar aldrig),
// cache-first för assets (ikoner m.m. laddar direkt + funkar offline).
// Höj versionen när cachade assets ändras → gamla cachen rensas i activate.
const VERSION = 'todonu-v9';

// Lokala filer som förcachas vid install (inga cross-origin, t.ex. Google Fonts).
const CORE = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './fonts/fonts.css',
  './fonts/fraunces-latin-400.woff2',
  './fonts/fraunces-latin-ext-400.woff2',
  './fonts/spacemono-latin-400.woff2',
  './fonts/spacemono-latin-700.woff2',
  './fonts/spacemono-latin-ext-400.woff2',
  './fonts/spacemono-latin-ext-700.woff2',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const isHTML = req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    // Network-first: hämta färskt, uppdatera cachen, fall tillbaka offline.
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')))
    );
    return;
  }

  // Cache-first för assets: svara från cache, annars hämta och spara.
  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        // Cacha bara lyckade same-origin-svar.
        if (res.ok && new URL(req.url).origin === self.location.origin) {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
        }
        return res;
      });
    })
  );
});
