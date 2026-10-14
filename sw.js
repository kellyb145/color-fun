// Offline support: cache everything on install, serve cache first, refresh in the background.
const CACHE = 'colorfun-v3';
const FILES = [
  './', 'index.html', 'style.css', 'app.js', 'manifest.json', 'icon-180.png', 'icon-192.png', 'icon-512.png',
  'art/index.js', 'art/animals.js', 'art/ocean.js', 'art/vehicles.js', 'art/space.js', 'art/fantasy.js', 'art/halloween.js', 'art/gemini.js',
  'art/gemini/lion.png', 'art/gemini/elephant.png', 'art/gemini/giraffe.png', 'art/gemini/monkey.png', 'art/gemini/kitty.png', 'art/gemini/puppy.png', 'art/gemini/piggy.png', 'art/gemini/cow-pig.png', 'art/gemini/teddy.png', 'art/gemini/unicorn.png', 'art/gemini/dragon.png', 'art/gemini/triceratops.png', 'art/gemini/whale-shark.png', 'art/gemini/mermaid.png', 'art/gemini/alien.png', 'art/gemini/rocket.png', 'art/gemini/car.png', 'art/gemini/fire-truck.png', 'art/gemini/ghost.png', 'art/gemini/pumpkin.png',
  'art/extras/index.js', 'art/extras/animals.js', 'art/extras/ocean.js', 'art/extras/vehicles.js',
  'art/extras/space.js', 'art/extras/fantasy.js', 'art/extras/halloween.js',
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const hit = await cache.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(r => { if (r.ok) cache.put(e.request, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
