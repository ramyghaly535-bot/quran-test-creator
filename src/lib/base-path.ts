/**
 * basePath مساعد للتعامل مع مسار القاعدة
 * يُستخدم لضمان عمل الروابط والصور على GitHub Pages وغيره
 */

// ثابت وقت البناء - يُحدد تلقائياً من next.config.ts
const BUILD_TIME_BASE_PATH = process.env.__NEXT_ROUTER_BASEPATH || '';

let _basePath = '';
let _initialized = false;

export function initBasePath() {
  if (typeof window === 'undefined') return;
  if (_initialized) return;
  _initialized = true;

  try {
    // 1. من ثابت وقت البناء (الأكثر موثوقية)
    if (BUILD_TIME_BASE_PATH) {
      _basePath = BUILD_TIME_BASE_PATH;
      return;
    }

    // 2. من __NEXT_DATA__ (يُحدد تلقائياً عند البناء مع basePath)
    // @ts-expect-error __NEXT_DATA__ is injected by Next.js
    const nextBasePath = window.__NEXT_DATA__?.basePath || '';
    if (nextBasePath) {
      _basePath = nextBasePath;
      return;
    }

    // 3. كشف من اسم المضيف (GitHub Pages)
    // إذا كان المضيف هو github.io، فالجزء الأول من المسار هو اسم المستودع
    const hostname = window.location.hostname;
    if (hostname.endsWith('.github.io')) {
      const segments = window.location.pathname.split('/').filter(Boolean);
      if (segments.length > 0) {
        _basePath = '/' + segments[0];
        return;
      }
    }

    // 4. كشف من <base> tag
    const baseTag = document.querySelector('base[href]');
    if (baseTag) {
      const href = baseTag.getAttribute('href') || '';
      if (href && href !== '/' && href !== './') {
        _basePath = href.replace(/\/$/, '');
        return;
      }
    }

    // 5. كشف من URL (للمواقع الأخرى)
    if (window.location.pathname !== '/') {
      const segments = window.location.pathname.split('/').filter(Boolean);
      const appSegments = ['_next', 'api', 'quran-pages', 'fonts', 'sw.js', 'manifest.json', 'index.html'];
      const validSegments = segments.filter(s => !appSegments.includes(s) && !s.endsWith('.html') && !s.endsWith('.json') && !s.endsWith('.js') && !s.match(/^\(.*\)$/));

      if (validSegments.length > 0) {
        _basePath = '/' + validSegments[0];
        return;
      }
    }

    // 6. كشف من script src
    const scripts = document.querySelectorAll('script[src]');
    for (const script of scripts) {
      const src = script.getAttribute('src') || '';
      const match = src.match(/^\/([^/]+)\/_next\//);
      if (match) {
        _basePath = '/' + match[1];
        return;
      }
    }
  } catch {
    _basePath = '';
  }
}

export function getBasePath(): string {
  if (typeof window !== 'undefined' && !_initialized) {
    initBasePath();
  }
  return _basePath;
}

/**
 * إضافة basePath إلى المسار
 * @param path المسار النسبي مثل "/app-icon.png"
 * @returns المسار الكامل مع basePath
 */
export function withBasePath(path: string): string {
  const base = getBasePath();
  if (!base) return path;
  // تجنب إضافة basePath مرتين
  if (path.startsWith(base)) return path;
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  // إزالة الـ / المزدوج
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  return cleanBase + cleanPath;
}

/**
 * الحصول على الرابط الكامل مع الأصل
 */
export function getFullURL(path: string): string {
  if (typeof window === 'undefined') return path;
  return window.location.origin + withBasePath(path);
}
