// Service Worker for Victoria's Secret Boutique Tycoon PWA
const CACHE_NAME = 'vs-boutique-cache-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './icon.svg',
    './icon-192.png',
    './icon-512.png',
    'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Quicksand:wght@600;700;800&display=swap'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE).catch(err => console.log('PWA cache add partial:', err));
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // Network first, update cache
                if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
                }
                return networkResponse;
            })
            .catch(() => {
                // Offline fallback
                return caches.match(event.request).then(cachedResponse => {
                    if (cachedResponse) return cachedResponse;
                    if (event.request.mode === 'navigate') {
                        return caches.match('./index.html');
                    }
                });
            })
    );
});
