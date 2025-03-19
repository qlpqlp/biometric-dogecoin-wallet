//
//  Project: DogeLock - Biometric Self-Custodial Dogecoin Wallet
//  Author: Dogecoin Foundation - https://x.com/inevitable360
//  Description: A secure OpenSource Dogecoin Wallet for everyone that want to do it better
//  License: Well, do what you want with this, be creative, you have the wheel, just reenvent and do it better! Do Only Good Everyday
//

// Such service-worker.js for the PWA
const CACHE_NAME = 'biometric-doge-wallet-cache-v69';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './css/doge.css',
  './js/bitcoinjs-lib.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Comic+Neue&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/elliptic/6.5.4/elliptic.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"'
];

self.addEventListener('install', event => {
  console.log('Such Service Worker: Much Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache)
          .then(() => self.skipWaiting());
      })
      .catch(err => console.error('Service Worker: Cache failed:', err))
  );
});

self.addEventListener('activate', event => {
  console.log('Such Service Worker: Much Activating...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => {
              console.log('Such Service Worker: So Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => self.clients.claim()) 
      .catch(err => console.error('Such Service Worker: Much Sad! Activation failed:', err))
  );
});

self.addEventListener('fetch', event => {
  console.log('Such Service Worker: So Fetching:', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          console.log('Such Service Worker: Much Serving from cache:', event.request.url);
          return cachedResponse;
        }
        console.log('Such Service Worker: Much Fetching from network:', event.request.url);
        return fetch(event.request)
          .then(networkResponse => {

            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
                console.log('Such Service Worker: So Cached:', event.request.url);
              })
              .catch(err => console.error('Such Service Worker: Much Sad! Cache put failed:', err));
            return networkResponse;
          })
          .catch(() => {
            console.log('Such Service Worker: Much Secure Offline, serving fallback');
            return caches.match('./index.html');
          });
      })
      .catch(err => {
        console.error('Such Service Worker: Much Sad! Fetch error:', err);
        return caches.match('./index.html');
      })
  );
});