
const ADMIN_CACHE = 'admin-cache-v1';
const adminUrlsToCache = [
  '/admin.html',
  '/js/pages/admin.js',
  '/manifest-admin.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(ADMIN_CACHE)
      .then((cache) => cache.addAll(adminUrlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
