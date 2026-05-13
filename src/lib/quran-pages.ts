/* ═══════════════════════════════════════════════
   الصفحات المصورة للقرآن الكريم
   نظام استدعاء وعرض صفحات المصحف الشريف
   مع تخزين مؤقت ذكي للعرض الفوري
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
  /** أرقام الصفحات التي يحتويها السؤال */
  pages: number[];
  /** هل السؤال يمتد على أكثر من صفحة */
  isMultiPage: boolean;
  /** عدد الصفحات */
  pageCount: number;
  /** مسارات الصور */
  imagePaths: string[];
}

/* ═══════════════════════════════════════════════
   نظام التخزين المؤقت الذكي للصفحات المصورة
   ═══════════════════════════════════════════════ */

/** حالة تحميل الصورة */
export type PageLoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

/** معلومات الصفحة المخزنة */
interface CachedPage {
  status: PageLoadStatus;
  blobUrl: string | null;
  width: number;
  height: number;
}

/** ذاكرة التخزين المؤقت العالمية */
const pageCache = new Map<number, CachedPage>();

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

/** الحصول على رابط الصفحة المخزنة (blob URL أو مسار عادي) */
export function getPageUrl(page: number): string {
  const cached = pageCache.get(page);
  if (cached?.blobUrl) return cached.blobUrl;
  return getPageImagePath(page);
}

/** هل الصفحة محملة ومخزنة في الذاكرة */
export function isPageCached(page: number): boolean {
  return pageCache.get(page)?.status === 'loaded';
}

/** عدد الصفحات المخزنة */
export function getCachedPagesCount(): number {
  let count = 0;
  pageCache.forEach(v => { if (v.status === 'loaded') count++; });
  return count;
}

/**
 * تحميل صفحة واحدة وتخزينها كـ blob URL
 * يعيد Promise يُحل عند اكتمال التحميل
 */
export function preloadPage(page: number): Promise<PageLoadStatus> {
  const existing = pageCache.get(page);
  if (existing?.status === 'loaded') return Promise.resolve('loaded');
  if (existing?.status === 'loading') {
    // انتظر حتى يكتمل التحميل الجاري
    return new Promise((resolve) => {
      const unsub = addCacheListener((p, status) => {
        if (p === page && (status === 'loaded' || status === 'error')) {
          unsub();
          resolve(status);
        }
      });
    });
  }

  pageCache.set(page, { status: 'loading', blobUrl: null, width: 0, height: 0 });
  notifyListeners(page, 'loading');

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        // محاولة إنشاء blob URL للعرض الفوري
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              const blobUrl = URL.createObjectURL(blob);
              const existingEntry = pageCache.get(page);
              // تحرير blob URL القديم إن وجد
              if (existingEntry?.blobUrl) {
                URL.revokeObjectURL(existingEntry.blobUrl);
              }
              pageCache.set(page, {
                status: 'loaded',
                blobUrl,
                width: canvas.width,
                height: canvas.height,
              });
            } else {
              pageCache.set(page, {
                status: 'loaded',
                blobUrl: getPageImagePath(page),
                width: img.naturalWidth || img.width,
                height: img.naturalHeight || img.height,
              });
            }
            notifyListeners(page, 'loaded');
            resolve('loaded');
          }, 'image/png');
        } else {
          pageCache.set(page, {
            status: 'loaded',
            blobUrl: getPageImagePath(page),
            width: img.naturalWidth || img.width,
            height: img.naturalHeight || img.height,
          });
          notifyListeners(page, 'loaded');
          resolve('loaded');
        }
      } catch {
        // في حالة خطأ CORS أو غيره، نستخدم المسار العادي
        pageCache.set(page, {
          status: 'loaded',
          blobUrl: getPageImagePath(page),
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
        });
        notifyListeners(page, 'loaded');
        resolve('loaded');
      }
    };

    img.onerror = () => {
      pageCache.set(page, { status: 'error', blobUrl: null, width: 0, height: 0 });
      notifyListeners(page, 'error');
      resolve('error');
    };

    img.src = getPageImagePath(page);
  });
}

/**
 * تحميل مسبق لصور صفحات المصحف (متوافق مع الكود القديم)
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

  if (!surahVerses) {
    const pages = [question.page];
    return {
      pages,
      isMultiPage: false,
      pageCount: 1,
      imagePaths: pages.map(p => getPageUrl(p)),
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
    imagePaths: finalPages.map(p => getPageUrl(p)),
  };
}

/** التحقق من وجود صورة صفحة محلياً */
export function isPageAvailable(page: number): boolean {
  return page >= 1 && page <= TOTAL_QURAN_PAGES;
}

/**
 * تحميل مسبق لشريحة من الصفحات
 * مفيد لتحميل الصفحات المحيطة بالصفحة الحالية
 */
export function preloadPageRange(centerPage: number, range: number = 2): void {
  const start = Math.max(1, centerPage - range);
  const end = Math.min(TOTAL_QURAN_PAGES, centerPage + range);
  for (let p = start; p <= end; p++) {
    preloadPage(p).catch(() => { /* ignore */ });
  }
}
