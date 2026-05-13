/* ═══════════════════════════════════════════════
   Service Worker - عامل الخدمة
   يخزن جميع ملفات التطبيق مؤقتاً للعمل بدون إنترنت
   ═══════════════════════════════════════════════ */

const CACHE_NAME = 'quran-app-v1';

// الملفات الأساسية التي نحتاجها للعمل بدون إنترنت
const CORE_ASSETS = [
  '/',
  '/quran-data.json',
  '/fonts/fonts.css',
];

// تثبيت Service Worker وتحميل الملفات الأساسية
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] تحميل الملفات الأساسية...');
      return cache.addAll(CORE_ASSETS).catch(err => {
        console.warn('[SW] خطأ في تحميل بعض الملفات الأساسية:', err);
      });
    })
  );
  self.skipWaiting();
});

// تفعيل Service Worker وحذف الكاش القديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// اعتراض الطلبات - استراتيجية Cache First
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // صفحات المصحف المصور - تخزين مؤقت أولاً
  if (url.pathname.startsWith('/quran-pages/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            // موجود في الكاش - نعيده فوراً
            return cachedResponse;
          }
          // غير موجود - نحمله من الشبكة ونخزنه
          return fetch(event.request).then((networkResponse) => {
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // باقي الملفات - استراتيجية Cache First مع Network Fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // تخزين الملفات المحلية فقط
        if (networkResponse.ok && url.pathname.startsWith('/')) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // إذا فشل الاتصال بالشبكة، نحاول الكاش مرة أخرى
        return caches.match(event.request);
      });
    })
  );
});

// رسالة من التطبيق
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_ALL_PAGES') {
    console.log('[SW] بدء تحميل جميع صفحات المصحف في الكاش...');
    const cachePromise = caches.open(CACHE_NAME).then((cache) => {
      const promises = [];
      for (let i = 1; i <= 604; i++) {
        const pageNum = String(i).padStart(3, '0');
        const url = `/quran-pages/page${pageNum}.png`;
        promises.push(
          cache.match(url).then((cached) => {
            if (!cached) {
              return fetch(url).then((response) => {
                if (response.ok) {
                  return cache.put(url, response);
                }
              }).catch(() => { /* ignore */ });
            }
          })
        );
      }
      return Promise.all(promises);
    });
    event.waitUntil(cachePromise.then(() => {
      console.log('[SW] تم تحميل جميع صفحات المصحف في الكاش!');
      // إرسال رسالة للتطبيق بأن التحميل اكتمل
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'ALL_PAGES_CACHED' });
        });
      });
    }));
  }
});
