/**
 * basePath مساعد للتعامل مع مسار القاعدة
 * يُستخدم لضمان عمل الروابط والصور على GitHub Pages وغيره
 */

let _basePath = '';
let _initialized = false;

export function initBasePath() {
  if (typeof window === 'undefined') return;
  if (_initialized) return;
  _initialized = true;

  try {
    // 1. المحاولة الأولى: من __NEXT_DATA__
    // @ts-expect-error __NEXT_DATA__ is injected by Next.js
    const nextBasePath = window.__NEXT_DATA__?.basePath || '';
    if (nextBasePath) {
      _basePath = nextBasePath;
      return;
    }

    // 2. المحاولة الثانية: من <base> tag
    const baseTag = document.querySelector('base[href]');
    if (baseTag) {
      const href = baseTag.getAttribute('href') || '';
      if (href && href !== '/' && href !== './') {
        _basePath = href.replace(/\/$/, '');
        return;
      }
    }

    // 3. المحاولة الثالثة: كشف من URL
    // إذا كنا على GitHub Pages مثل /quran-test-creator/
    if (window.location.pathname !== '/') {
      const segments = window.location.pathname.split('/').filter(Boolean);
      // استبعاد المسارات الخاصة
      const appSegments = ['_next', 'api', 'quran-pages', 'fonts', 'sw.js', 'manifest.json', 'index.html'];
      const validSegments = segments.filter(s => !appSegments.includes(s) && !s.endsWith('.html') && !s.endsWith('.json') && !s.endsWith('.js') && !s.match(/^\(.*\)$/));

      // تحقق مما إذا كان أول مسار هو basePath (مثل quran-test-creator)
      if (validSegments.length > 0) {
        _basePath = '/' + validSegments[0];
        return;
      }
    }

    // 4. المحاولة الرابعة: كشف من script src
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
