// CHARUSAT AI Assistant Service Worker
const CACHE_NAME = "charusat-ai-cache-v16";
const STATIC_ASSETS = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js?v=16.0",
    "./logo.png",
    "./manifest.json"
];

// Install Event - Pre-cache essential app shell assets
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS).catch(() => {});
        })
    );
    self.skipWaiting();
});

// Activate Event - Clean old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch Event - Network first with cache fallback for app shell
self.addEventListener("fetch", (event) => {
    // Let API calls pass directly to network
    if (event.request.url.includes("/api/")) {
        return;
    }

    event.respondWith(
        fetch(event.request)
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
                return caches.match(event.request);
            })
    );
});
