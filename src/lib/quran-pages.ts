/* ═══════════════════════════════════════════════
   الصفحات المصورة للقرآن الكريم
   نظام استدعاء وعرض صفحات المصحف الشريف
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

/**
 * البحث عن الصفحات التي يحتويها سؤال معين
 * يستخدم بيانات السور (surahCache) لتحديد الصفحات بدقة
 */
export function lookupQuestionPages(
  question: QuranQuestion,
  surahCache: Record<string, QuranVerseData[]>
): PageLookupResult {
  const surahVerses = surahCache[question.surah];

  if (!surahVerses) {
    // إذا لم تتوفر بيانات السورة، نستخدم رقم الصفحة المخزن في السؤال
    const pages = [question.page];
    return {
      pages,
      isMultiPage: false,
      pageCount: 1,
      imagePaths: pages.map(p => getPageImagePath(p)),
    };
  }

  // تصفية الآيات التي تقع ضمن نطاق السؤال
  const relevantVerses = surahVerses.filter(
    v => v.numberInSurah >= question.from && v.numberInSurah <= question.to
  );

  // استخراج أرقام الصفحات الفريدة مرتبة
  const pages = [...new Set(relevantVerses.map(v => v.page))].sort((a, b) => a - b);
  const finalPages = pages.length > 0 ? pages : [question.page];

  return {
    pages: finalPages,
    isMultiPage: finalPages.length > 1,
    pageCount: finalPages.length,
    imagePaths: finalPages.map(p => getPageImagePath(p)),
  };
}

/**
 * تحميل مسبق لصور صفحات المصحف
 * يحمل الصور في ذاكرة المتصفح لتظهر فوراً عند عرضها
 */
export function preloadQuranPages(pages: number[]): void {
  pages.forEach(pageNum => {
    const img = new Image();
    img.src = getPageImagePath(pageNum);
  });
}

/**
 * تحميل مسبق لجميع صفحات الأسئلة
 */
export function preloadAllQuestionPages(
  questions: QuranQuestion[],
  surahCache: Record<string, QuranVerseData[]>
): void {
  const allPages = new Set<number>();

  questions.forEach(q => {
    const result = lookupQuestionPages(q, surahCache);
    result.pages.forEach(p => allPages.add(p));
  });

  preloadQuranPages([...allPages]);
}

/** التحقق من وجود صورة صفحة محلياً */
export function isPageAvailable(page: number): boolean {
  return page >= 1 && page <= TOTAL_QURAN_PAGES;
}
