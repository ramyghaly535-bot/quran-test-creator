/* ═══════════════════════════════════════════════
   الصفحات المصورة للقرآن الكريم
   نظام استدعاء وعرض صفحات المصحف الشريف
   مع تخزين مؤقت في الذاكرة للعمل بدون إنترنت
   ═══════════════════════════════════════════════ */

/** تنسيق رقم الصفحة بثلاث أرقام */
export function formatPageNum(page: number): string {
  return String(page).padStart(3, '0');
}

/** الحصول على مسار صورة الصفحة محلياً */
export function getPageImagePath(page: number): string {
  return `/quran-pages/page${formatPageNum(page)}.png`;
}

/** عدد صفحات المصحف الكريم */
export const TOTAL_QURAN_PAGES = 604;

/** واجهة بيانات السؤال */
export interface QuranQuestion {
  surah: string;
  from: number;
  to: number;
  page: number;
  courseName: string;
  juz: number;
}

/** واجهة بيانات الآية */
export interface QuranVerseData {
  text: string;
  numberInSurah: number;
  page: number;
  juz: number;
}

/** واجهة نتيجة البحث عن الصفحات */
export interface PageLookupResult {
  pages: number[];
  isMultiPage: boolean;
  pageCount: number;
  imagePaths: string[];
}

/* ═══════════════════════════════════════════════
   نظام التخزين المؤقت في الذاكرة
   الصور تُحمل مرة واحدة وتُخزن كـ blob URLs
   تعمل بدون إنترنت بعد التحميل الأول
   ═══════════════════════════════════════════════ */

/** حالة تحميل الصورة */
export type PageLoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

/** معلومات الصفحة المخزنة */
interface CachedPage {
  status: PageLoadStatus;
  blobUrl: string | null;  // blob URL يعمل بدون إنترنت
}

/** ذاكرة التخزين المؤقت العالمية - كل صورة محملة تُخزن هنا */
const pageCache = new Map<number, CachedPage>();

/** طوابير الانتظار لكل صفحة (لمنع التحميل المزدوج) */
const pendingPromises = new Map<number, Promise<PageLoadStatus>>();

/** مستمعو التغييرات */
type CacheListener = (page: number, status: PageLoadStatus) => void;
const listeners = new Set<CacheListener>();

/** إضافة مستمع للتغييرات */
export function addCacheListener(listener: CacheListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** إشعار المستمعين */
function notifyListeners(page: number, status: PageLoadStatus) {
  listeners.forEach(listener => {
    try { listener(page, status); } catch (_) { /* ignore */ }
  });
}

/** الحصول على حالة الصفحة */
export function getPageStatus(page: number): PageLoadStatus {
  return pageCache.get(page)?.status || 'idle';
}

/**
 * الحصول على رابط الصفحة
 * أولوية: blob URL من الكاش > الرابط المباشر
 */
export function getPageUrl(page: number): string {
  const cached = pageCache.get(page);
  if (cached?.status === 'loaded' && cached.blobUrl) return cached.blobUrl;
  // الرابط المباشر كاحتياطي
  return getPageImagePath(page);
}

/** هل الصفحة محملة ومخزنة في الذاكرة كـ blob */
export function isPageCached(page: number): boolean {
  const entry = pageCache.get(page);
  return entry?.status === 'loaded' && !!entry?.blobUrl;
}

/** عدد الصفحات المخزنة */
export function getCachedPagesCount(): number {
  let count = 0;
  pageCache.forEach(v => { if (v.status === 'loaded' && v.blobUrl) count++; });
  return count;
}

/**
 * تحميل صفحة واحدة باستخدام fetch() وتخزينها كـ blob URL
 * fetch() تعمل من نفس الأصل بدون مشاكل CORS
 * الـ blob URL يُخزن في الذاكرة ويعمل بدون إنترنت
 */
export function preloadPage(page: number): Promise<PageLoadStatus> {
  // إذا كانت محملة بالفعل
  const existing = pageCache.get(page);
  if (existing?.status === 'loaded' && existing.blobUrl) {
    return Promise.resolve('loaded');
  }

  // إذا كان التحميل جارياً بالفعل، ننتظر النتيجة
  const pending = pendingPromises.get(page);
  if (pending) return pending;

  // بدء التحميل
  pageCache.set(page, { status: 'loading', blobUrl: null });
  notifyListeners(page, 'loading');

  const promise = fetch(getPageImagePath(page))
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.blob();
    })
    .then(blob => {
      // إنشاء blob URL - هذا الرابط يعمل بدون إنترنت
      const blobUrl = URL.createObjectURL(blob);
      // تحرير الـ blob URL القديم إن وجد
      const oldEntry = pageCache.get(page);
      if (oldEntry?.blobUrl) {
        URL.revokeObjectURL(oldEntry.blobUrl);
      }
      pageCache.set(page, { status: 'loaded', blobUrl });
      notifyListeners(page, 'loaded');
      pendingPromises.delete(page);
      return 'loaded' as PageLoadStatus;
    })
    .catch(err => {
      console.warn(`فشل تحميل صفحة ${page} عبر fetch:`, err);
      // تعليم كخطأ مؤقت - يمكن إعادة المحاولة
      pageCache.set(page, { status: 'error', blobUrl: null });
      notifyListeners(page, 'error');
      pendingPromises.delete(page);
      return 'error' as PageLoadStatus;
    });

  pendingPromises.set(page, promise);
  return promise;
}

/**
 * إعادة محاولة تحميل صفحة فاشلة
 */
export function retryPage(page: number): Promise<PageLoadStatus> {
  // مسح حالة الخطأ
  pageCache.delete(page);
  pendingPromises.delete(page);
  return preloadPage(page);
}

/**
 * تحميل مسبق لصور صفحات المصحف
 */
export function preloadQuranPages(pages: number[]): void {
  pages.forEach(pageNum => {
    preloadPage(pageNum).catch(() => { /* ignore */ });
  });
}

/**
 * تحميل مسبق لجميع صفحات الأسئلة
 */
export function preloadAllQuestionPages(
  questions: QuranQuestion[],
  surahCache: Record<string, QuranVerseData[]>
): Promise<PageLoadStatus[]> {
  const allPages = new Set<number>();

  questions.forEach(q => {
    const result = lookupQuestionPages(q, surahCache);
    result.pages.forEach(p => allPages.add(p));
  });

  return Promise.all([...allPages].map(p => preloadPage(p)));
}

/**
 * البحث عن الصفحات التي يحتويها سؤال معين
 */
export function lookupQuestionPages(
  question: QuranQuestion,
  surahCache: Record<string, QuranVerseData[]>
): PageLookupResult {
  const surahVerses = surahCache[question.surah];

  if (!surahVerses || surahVerses.length === 0) {
    const pages = [question.page];
    return {
      pages,
      isMultiPage: false,
      pageCount: 1,
      imagePaths: pages.map(p => getPageImagePath(p)),
    };
  }

  const relevantVerses = surahVerses.filter(
    v => v.numberInSurah >= question.from && v.numberInSurah <= question.to
  );

  const pages = [...new Set(relevantVerses.map(v => v.page))].sort((a, b) => a - b);
  const finalPages = pages.length > 0 ? pages : [question.page];

  return {
    pages: finalPages,
    isMultiPage: finalPages.length > 1,
    pageCount: finalPages.length,
    imagePaths: finalPages.map(p => getPageImagePath(p)),
  };
}

/** التحقق من وجود صورة صفحة محلياً */
export function isPageAvailable(page: number): boolean {
  return page >= 1 && page <= TOTAL_QURAN_PAGES;
}

/**
 * تحميل مسبق لشريحة من الصفحات
 */
export function preloadPageRange(centerPage: number, range: number = 2): void {
  const start = Math.max(1, centerPage - range);
  const end = Math.min(TOTAL_QURAN_PAGES, centerPage + range);
  for (let p = start; p <= end; p++) {
    preloadPage(p).catch(() => { /* ignore */ });
  }
}
