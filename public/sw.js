// // Service Worker for Nexora POS PWA

// const CACHE_NAME = 'nexora-pos-cache-v1';
// const OFFLINE_URL = '/pos/offline';

// // Resources to pre-cache
// const STATIC_RESOURCES = [
//   '/',
//   '/pos/offline',
//   '/manifest.json',
//   '/favicon.ico',
//   // Add other static assets here
// ];

// // Install event - cache static resources
// self.addEventListener('install', (event) => {
//   event.waitUntil(
//     caches.open(CACHE_NAME).then((cache) => {
//       return cache.addAll(STATIC_RESOURCES);
//     })
//   );
//   self.skipWaiting();
// });

// // Activate event - clean up old caches
// self.addEventListener('activate', (event) => {
//   event.waitUntil(
//     caches.keys().then((cacheNames) => {
//       return Promise.all(
//         cacheNames
//           .filter((cacheName) => cacheName !== CACHE_NAME)
//           .map((cacheName) => caches.delete(cacheName))
//       );
//     })
//   );
//   self.clients.claim();
// });

// // Fetch event - serve from cache or network
// self.addEventListener('fetch', (event) => {
//   // Skip cross-origin requests
//   if (!event.request.url.startsWith(self.location.origin)) {
//     return;
//   }

//   // Handle API requests differently
//   if (event.request.url.includes('/api/')) {
//     return handleApiRequest(event);
//   }

//   // For navigation requests, provide offline page if network fails
//   if (event.request.mode === 'navigate') {
//     event.respondWith(
//       fetch(event.request).catch(() => {
//         return caches.match(OFFLINE_URL);
//       })
//     );
//     return;
//   }

//   // For other requests, try network first, then cache
//   event.respondWith(
//     caches.match(event.request).then((cachedResponse) => {
//       if (cachedResponse) {
//         // Return cached response immediately
//         return cachedResponse;
//       }

//       // Try network
//       return fetch(event.request)
//         .then((response) => {
//           // Don't cache non-successful responses
//           if (!response || response.status !== 200 || response.type !== 'basic') {
//             return response;
//           }

//           // Clone the response to cache it and return it
//           const responseToCache = response.clone();
//           caches.open(CACHE_NAME).then((cache) => {
//             cache.put(event.request, responseToCache);
//           });

//           return response;
//         })
//         .catch(() => {
//           // If both network and cache fail, return offline page for navigation
//           if (event.request.mode === 'navigate') {
//             return caches.match(OFFLINE_URL);
//           }
//           return null;
//         });
//     })
//   );
// });

// // Handle API requests with network-first strategy and IndexedDB fallback
// function handleApiRequest(event) {
//   event.respondWith(
//     fetch(event.request)
//       .then((response) => {
//         return response;
//       })
//       .catch(() => {
//         // Return a custom response for API requests when offline
//         return new Response(
//           JSON.stringify({
//             success: false,
//             error: 'You are currently offline. This action will be synced when you reconnect.',
//             isOffline: true
//           }),
//           {
//             headers: { 'Content-Type': 'application/json' }
//           }
//         );
//       })
//   );
// }

// // Listen for sync events to process queued actions
// self.addEventListener('sync', (event) => {
//   if (event.tag === 'sync-data') {
//     event.waitUntil(syncData());
//   }
// });

// // Function to sync data when online
// async function syncData() {
//   // This will be handled by your IndexedDB sync mechanism
//   // The actual implementation will depend on your db.service.ts
//   self.clients.matchAll().then(clients => {
//     clients.forEach(client => {
//       client.postMessage({
//         type: 'SYNC_REQUIRED'
//       });
//     });
//   });
// }