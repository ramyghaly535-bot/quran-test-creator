const CACHE_NAME = 'quran-test-v2';
const STATIC_ASSETS = [
  './',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-48.png',
  './app-icon-1024.png',
  './apple-touch-icon.png',
];

// الموارد التي يتم تخزينها مؤقتاً لفترة طويلة
const LONG_CACHE_PATTERNS = [
  /\/fonts\//,
  /\/_next\/static\//,
  /\/quran-pages\//,
];

// الموارد التي لا يتم تخزينها أبداً
const NO_CACHE_PATTERNS = [
  /\/api\//,
  /chrome-extension:\/\//,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // إذا فشل تخزين بعض الملفات، استمر بدونها
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // تجاهل الطلبات غير GET
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // تجاهل الطلبات غير HTTP
  if (!url.protocol.startsWith('http')) return;

  // تجاهل المسارات المحظورة
  if (NO_CACHE_PATTERNS.some(p => p.test(url.pathname))) return;

  // استراتيجية: الشبكة أولاً مع التخزين المؤقت كاحتياطي
  // للموارد الثابتة: التخزين المؤقت أولاً مع الشبكة كاحتياطي
  const isLongCache = LONG_CACHE_PATTERNS.some(p => p.test(url.pathname));

  if (isLongCache) {
    // Cache First للموارد الثابتة (خطوط، صور صفحات القرآن، JS/CSS)
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        }).catch(() => {
          return new Response('', { status: 408 });
        });
      })
    );
  } else {
    // Network First للصفحات والطلبات العادية
    event.respondWith(
      fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(() => {
        return caches.match(event.request).then((cached) => {
          return cached || new Response('غير متصل بالإنترنت', {
            status: 503,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        });
      })
    );
  }
});
