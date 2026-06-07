const CACHE_NAME = 'quran-test-v3';

// كشف basePath تلقائياً
function detectBasePath() {
  // من URL الحالي - عند التثبيت نعرف المسار
  var swUrl = self.location.href;
  var match = swUrl.match(/^(https?:\/\/[^/]+\/[^/]+)\/sw\.js/);
  if (match) {
    return match[1].replace(/^https?:\/\/[^/]+/, '');
  }
  return '';
}

var BASE_PATH = detectBasePath();

// الموارد التي يتم تخزينها مؤقتاً عند التثبيت
var STATIC_ASSETS = [
  BASE_PATH + '/',
  BASE_PATH + '/manifest.json',
  BASE_PATH + '/icon-192.png',
  BASE_PATH + '/icon-512.png',
  BASE_PATH + '/icon-48.png',
  BASE_PATH + '/app-icon-1024.png',
  BASE_PATH + '/apple-touch-icon.png',
];

// الموارد التي يتم تخزينها مؤقتاً لفترة طويلة
var LONG_CACHE_PATTERNS = [
  /\/fonts\//,
  /\/_next\/static\//,
  /\/quran-pages\//,
];

// الموارد التي لا يتم تخزينها أبداً
var NO_CACHE_PATTERNS = [
  /\/api\//,
  /chrome-extension:\/\//,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
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
  if (event.request.method !== 'GET') return;

  var url = new URL(event.request.url);

  if (!url.protocol.startsWith('http')) return;

  if (NO_CACHE_PATTERNS.some(p => p.test(url.pathname))) return;

  var isLongCache = LONG_CACHE_PATTERNS.some(p => p.test(url.pathname));

  if (isLongCache) {
    // Cache First للموارد الثابتة
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            var clone = response.clone();
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
    // Network First للصفحات
    event.respondWith(
      fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          var clone = response.clone();
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
