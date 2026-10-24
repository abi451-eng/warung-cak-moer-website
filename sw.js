/* sw.js — Service Worker Warung Cak Moer
   PENTING: setiap kali kamu mengubah index.html / file situs,
   naikkan nomor versi di bawah (mis. v1 -> v2) supaya pelanggan
   mendapat versi terbaru, bukan versi lama yang ter-cache. */
const CACHE_VERSION = 'cakmoer-v36';
const SHELL = [
  './',
  './index.html',
  './admin.html',
  './manifest.webmanifest',
  './admin.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './admin-icon-192.png',
  './admin-icon-512.png',
  './favicon.png',
  './logo-cm.png',
  './logo-mark.png'
];

// Pasang: simpan kerangka situs
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

// Aktif: hapus cache versi lama
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;                 // jangan ganggu POST (simpan menu / upload foto)
  const url = new URL(req.url);
  if (url.origin === location.origin && url.pathname.startsWith('/api/')) return; // data menu selalu dari jaringan
  if (/\.(mp4|webm)$/.test(url.pathname)) return;     // video: biarkan browser (butuh Range request)

  // Navigasi halaman -> network-first (selalu coba versi terbaru, fallback ke cache saat offline)
  if (req.mode === 'navigate') {
    // Halaman cadangan saat offline: admin.cakmoer.my.id / admin.html -> admin, selain itu -> halaman depan
    const isAdmin = location.hostname.startsWith('admin.') || url.pathname.startsWith('/admin');
    const fallback = isAdmin ? './admin.html' : './index.html';
    e.respondWith(
      fetch(req)
        .then((res) => {
          // simpan hanya halaman normal (bukan redirect / error) supaya cache tidak rusak
          if (res.ok && res.type === 'basic' && !res.redirected) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(req).then((r) => (r && !r.redirected ? r : caches.match(fallback))))
    );
    return;
  }

  // Aset lain (font, ikon, foto) -> stale-while-revalidate
  e.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && (res.ok || res.type === 'opaque')) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
