const CACHE_PREFIX = 'alice-zhou-portfolio-';
const CACHE_NAME = CACHE_PREFIX + 'offline-v3-contact';
const FILES = ["./","index.html","style.css","artworks.js","app.js","offline.js","assets/Untitled_Artwork_5.png","assets/Untitled_Artwork_1.png","assets/Untitled_Artwork_6.png","assets/Untitled_Artwork_7.png","assets/Untitled_Artwork_8.png","assets/Character_1_Final.png","assets/Character_1_Silhouette_And_Variation.png","assets/Weapon.png","assets/Untitled_Artwork_9.png","assets/She.png","assets/IMG_2059_3.PNG","assets/IMG_2581_2.PNG","assets/IMG_2599.PNG","assets/IMG_1663_5.PNG","assets/IMG_1513_6.PNG"];
const root = self.registration.scope;
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(FILES.map(path => new Request(new URL(path, root), {cache: 'reload'})));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || !request.url.startsWith(root)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    if (request.mode === 'navigate') {
      try {
        const response = await fetch(request);
        if (response.ok) return response;
      } catch {}
      return (await cache.match(new URL('index.html', root))) || Response.error();
    }
    const saved = await cache.match(request, {ignoreSearch: true});
    if (saved) return saved;
    return fetch(request);
  })());
});
