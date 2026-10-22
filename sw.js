// เก็บหน้าแอปไว้ในเครื่อง เปิดซ้ำได้เร็วและใช้ตอนสัญญาณอ่อนได้
// ถ้าแก้ไฟล์ index.html ให้เปลี่ยนเลขเวอร์ชันนี้ (v1 -> v2) เพื่อให้เครื่องโหลดตัวใหม่
const CACHE = 'order-v1';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const hit = await cache.match(e.request, { ignoreSearch: true });
      const net = fetch(e.request)
        .then((res) => {
          if (res && (res.ok || res.type === 'opaque')) cache.put(e.request, res.clone());
          return res;
        })
        .catch(() => hit);
      return hit || net;
    })
  );
});
