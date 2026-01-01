/**
 * Service Worker for AAR Generator
 * Enables offline functionality
 */

const CACHE_NAME = 'aar-generator-v6';

// Use relative URLs for GitHub Pages compatibility
const urlsToCache = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/aar-builder.js',
  './js/pdf-generator.js',
  './js/export.js',
  './js/docx-generator.js',
  './js/lib/theme.js',
  './js/lib/storage.js',
  './js/lib/date-utils.js',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon.svg',
  './manifest.json'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('AAR Generator: Caching assets');
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.error('AAR Generator: Cache install failed:', err);
      })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith('aar-generator-') && cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log('AAR Generator: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  // Take control immediately
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Only handle same-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if found
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then((response) => {
            // Check for valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Add to cache
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Offline fallback - return cached index.html for navigation
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
          });
      })
  );
});
