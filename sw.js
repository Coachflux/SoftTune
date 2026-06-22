const CACHE_NAME = 'softtune-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/manifest.json'
];

// Install: Cache static assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Cache-first strategy for static, network-first for audio
self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Audio files: network first, then cache
  if (request.destination === 'audio' || url.pathname.match(/\.(mp3|wav|ogg|flac|aac|m4a)$/i)) {
    e.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // Static assets: cache first
  e.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});

// Background sync for downloads
self.addEventListener('sync', (e) => {
  if (e.tag === 'download-music') {
    e.waitUntil(handleBackgroundDownloads());
  }
});

// Push notifications (optional)
self.addEventListener('push', (e) => {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'SoftTune', {
      body: data.body || 'Your music is ready!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: data.tag || 'softtune',
      requireInteraction: false,
      actions: [
        { action: 'play', title: '▶ Play' },
        { action: 'next', title: '⏭ Next' }
      ]
    })
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      if (clientList.length > 0) {
        clientList[0].focus();
        clientList[0].postMessage({ action: e.action });
      } else {
        clients.openWindow('/');
      }
    })
  );
});

async function handleBackgroundDownloads() {
  // Background download logic handled by main app
  return Promise.resolve();
}
