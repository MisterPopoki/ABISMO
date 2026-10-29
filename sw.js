// Service worker de Abismo.
// IMPORTANTE: sube CACHE_NAME cada vez que cambies index.html, el manifest o los iconos,
// así los móviles que ya tienen la app instalada descargan la versión nueva.
const CACHE_NAME = 'abismo-v192';
const ARCHIVOS = ['./', './index.html', './manifest.json', './favicon-32.png', './apple-touch-icon-180.png',
  './icon-192.png', './icon-512.png', './icon-maskable-192.png', './icon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {   // borra las cachés de versiones anteriores
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;   // fuentes de Google y demás: directo a la red
  if (url.pathname.endsWith('.mp3')) return;   // la música se pide por trozos (peticiones Range): no se cachea aquí
  if (req.mode === 'navigate' || url.pathname.endsWith('/index.html')) {
    // el juego: primero la red, saltándose la caché del navegador (GitHub Pages la guarda 10 min), y sin conexión lo guardado
    e.respondWith(fetch(req, { cache: 'no-cache' }).then(r => { const copia = r.clone(); caches.open(CACHE_NAME).then(c => c.put('./index.html', copia)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req)));   // iconos y manifest: primero lo guardado
});
