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
      } else {
        // كشف تلقائي من مسار URL - مثلاً /quran-test-creator/
        const pathSegments = window.location.pathname.split('/').filter(Boolean);
        if (pathSegments.length > 0) {
          // التحقق مما إذا كنا على GitHub Pages (ليس المسار الجذر)
          // إذا كان المسار يحتوي على مجلد فرعي وليس ملف HTML
          const firstSegment = pathSegments[0];
          // استثناء المسارات الشائعة للتطبيق نفسه
          const appRoutes = ['_next', 'api', 'quran-pages', 'favicon.ico'];
          if (!appRoutes.includes(firstSegment)) {
            _basePath = '/' + firstSegment;
          }
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
  // إزالة الشرطة المائلة الزائدة
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  return cleanBase + path;
}
