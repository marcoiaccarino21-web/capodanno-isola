// Service worker minimo: serve a rendere l'app installabile e ad aprirla anche con poca rete.
// Prima prova sempre la rete (così arrivano subito le modifiche), se manca usa la copia salvata.
// I dati del gioco (Firebase) non passano di qui.
const CACHE = 'isola-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const req = e.request; const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || req.headers.has('range')) return;
  e.respondWith(fetch(req).then(res => {
    if (res.ok && res.status === 200) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: req.mode === 'navigate' })));
});
