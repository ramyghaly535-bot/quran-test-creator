/**
 * basePath مساعد للتعامل مع مسار القاعدة
 * يُستخدم لضمان عمل الروابط والصور على GitHub Pages وغيره
 */

let _basePath = '';

export function initBasePath() {
  if (typeof window !== 'undefined') {
    try {
      // @ts-expect-error __NEXT_DATA__ is injected by Next.js
      const nextBasePath = window.__NEXT_DATA__?.basePath || '';
      if (nextBasePath) {
        _basePath = nextBasePath;
      } else if (window.location.pathname !== '/') {
        // كشف تلقائي: إذا كنا على مسار فرعي وليس الجذر
        // مثال: /quran-test-creator/ أو /quran-test-creator/index.html
        const segments = window.location.pathname.split('/').filter(Boolean);
        // استبعاد المسارات الخاصة بـ Next.js والتطبيق
        const appSegments = ['_next', 'api', 'quran-pages', 'fonts', 'sw.js', 'manifest.json'];
        const validSegments = segments.filter(s => !appSegments.includes(s) && !s.endsWith('.html') && !s.endsWith('.json') && !s.endsWith('.js'));
        if (validSegments.length > 0) {
          _basePath = '/' + validSegments[0];
        }
      }
    } catch {
      _basePath = '';
    }
  }
}

export function getBasePath(): string {
  if (typeof window !== 'undefined' && !_basePath) {
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
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  return cleanBase + path;
}
