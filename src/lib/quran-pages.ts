/* ═══════════════════════════════════════════════
   الصفحات المصورة للقرآن الكريم
   الصور محفوظة محلياً في public/quran-pages/
   تعمل بدون إنترنت تماماً مثل بيانات السور
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

/**
 * البحث عن الصفحات التي يحتويها سؤال معين
 * يحدد الصفحات بناءً على بيانات السور المخزنة محلياً
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
