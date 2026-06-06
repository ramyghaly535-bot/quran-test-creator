/**
 * basePath مساعد للتعامل مع مسار القاعدة
 * يُستخدم لضمان عمل الروابط والصور على GitHub Pages وغيره
 */

let _basePath = '';

export function initBasePath() {
  if (typeof window !== 'undefined') {
    try {
      // @ts-expect-error __NEXT_DATA__ is injected by Next.js
      _basePath = window.__NEXT_DATA__?.basePath || '';
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
