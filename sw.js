const CACHE = 'teksi-v4';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.add('./index.html')));
  self.skipWaiting();
});
self.addEventListener('fetch', e => {
  if(e.request.url.includes('anthropic.com')) return;
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => caches.match('./index.html')))
  );
});
