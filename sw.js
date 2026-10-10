// offline cache for 労働基準法 条文立法史ノート  (version 5aef3470b0)
const CACHE = 'lsa-5aef3470b0';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', ev => { ev.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', ev => {
  ev.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== 'lsa-fonts').map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', ev => {
  const req = ev.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // web fonts: keep a copy once used, so the same look is kept offline
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    ev.respondWith(caches.open('lsa-fonts').then(c => c.match(req).then(hit => hit || fetch(req).then(res => { c.put(req, res.clone()); return res; }).catch(() => hit))));
    return;
  }
  if (url.origin !== location.origin) return;
  // the tool itself: answer from the cache at once; when online, fetch the latest copy for next time
  const key = req.mode === 'navigate' ? './index.html' : req;
  ev.respondWith(caches.open(CACHE).then(c => c.match(key, {ignoreSearch: true}).then(hit => {
    const net = fetch(req).then(res => { if (res.ok) c.put(key, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  })));
});
