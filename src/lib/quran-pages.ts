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
  const basepath = `/quran-pages/page${formatPageNum(page)}.jpg`;
  // في بيئة المتصفح، نستخدم withBasePath لإضافة المسار الأساسي تلقائياً
  if (typeof window !== 'undefined') {
    try {
      // استخدام الكشف الديناميكي عن basePath
      // @ts-expect-error __NEXT_DATA__ is injected by Next.js
      const bp = window.__NEXT_DATA__?.basePath || '';
      if (bp) return bp + basepath;
      // كشف إضافي من URL
      if (window.location.pathname !== '/') {
        const segments = window.location.pathname.split('/').filter(Boolean);
        const skip = ['_next','api','quran-pages','fonts','sw.js','manifest.json','index.html'];
        const valid = segments.filter(s => skip.indexOf(s) === -1 && !s.endsWith('.html') && !s.endsWith('.json') && !s.endsWith('.js'));
        if (valid.length > 0) return '/' + valid[0] + basepath;
      }
    } catch {
      // fallback to default
    }
  }
  return basepath;
}

/** عدد صفحات المصحف الكريم */
export const TOTAL_QURAN_PAGES = 604;

/** واجهة بيانات السؤال */
export interface QuranQuestion {
  surah: string;
  endSurah?: string; // اسم السورة النهائية إذا اختلف عن السورة الأولى
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

/** واجهة آية مع تحديد السورة */
export interface QuranVerseWithSurah extends QuranVerseData {
  surahName: string;
}

/**
 * البحث عن الصفحات التي يحتويها سؤال معين
 * يحدد الصفحات بناءً على بيانات السور المخزنة محلياً
 * يدعم الأسئلة العابرة لسورتين (endSurah)
 */
export function lookupQuestionPages(
  question: QuranQuestion,
  surahCache: Record<string, QuranVerseData[]>
): PageLookupResult {
  const isCrossSurah = question.endSurah && question.endSurah !== question.surah;
  const surahVerses = surahCache[question.surah];
  const endSurahVerses = isCrossSurah ? surahCache[question.endSurah!] : null;

  if (!surahVerses || surahVerses.length === 0) {
    const pages = [question.page];
    return {
      pages,
      isMultiPage: false,
      pageCount: 1,
      imagePaths: pages.map(p => getPageImagePath(p)),
    };
  }

  const allPages: number[] = [];

  // آيات السورة الأولى (من آية البداية إلى آخر السورة)
  if (isCrossSurah) {
    const startSurahRelevant = surahVerses.filter(
      v => v.numberInSurah >= question.from
    );
    allPages.push(...startSurahRelevant.map(v => v.page));

    // آيات السورة الثانية (من أولها إلى آية النهاية)
    if (endSurahVerses && endSurahVerses.length > 0) {
      const endSurahRelevant = endSurahVerses.filter(
        v => v.numberInSurah <= question.to
      );
      allPages.push(...endSurahRelevant.map(v => v.page));
    }
  } else {
    // سؤال داخل سورة واحدة
    const relevantVerses = surahVerses.filter(
      v => v.numberInSurah >= question.from && v.numberInSurah <= question.to
    );
    allPages.push(...relevantVerses.map(v => v.page));
  }

  const pages = [...new Set(allPages)].sort((a, b) => a - b);
  const finalPages = pages.length > 0 ? pages : [question.page];

  return {
    pages: finalPages,
    isMultiPage: finalPages.length > 1,
    pageCount: finalPages.length,
    imagePaths: finalPages.map(p => getPageImagePath(p)),
  };
}

/**
 * استخراج آيات السؤال مع تحديد السورة لكل آية
 * يستخدم لعرض الآيات بألوان مختلفة حسب السورة
 */
export function lookupQuestionVerses(
  question: QuranQuestion,
  surahCache: Record<string, QuranVerseData[]>
): QuranVerseWithSurah[] {
  const isCrossSurah = question.endSurah && question.endSurah !== question.surah;
  const result: QuranVerseWithSurah[] = [];

  // آيات السورة الأولى
  const surahVerses = surahCache[question.surah];
  if (surahVerses && surahVerses.length > 0) {
    if (isCrossSurah) {
      // من آية البداية إلى آخر السورة
      const verses = surahVerses
        .filter(v => v.numberInSurah >= question.from)
        .map(v => ({ ...v, surahName: question.surah }));
      result.push(...verses);
    } else {
      // من آية البداية إلى آية النهاية
      const verses = surahVerses
        .filter(v => v.numberInSurah >= question.from && v.numberInSurah <= question.to)
        .map(v => ({ ...v, surahName: question.surah }));
      result.push(...verses);
    }
  }

  // آيات السورة الثانية (إذا كان السؤال عابراً لسورتين)
  if (isCrossSurah && question.endSurah) {
    const endSurahVerses = surahCache[question.endSurah];
    if (endSurahVerses && endSurahVerses.length > 0) {
      const verses = endSurahVerses
        .filter(v => v.numberInSurah <= question.to)
        .map(v => ({ ...v, surahName: question.endSurah! }));
      result.push(...verses);
    }
  }

  return result;
}

/** التحقق من وجود صورة صفحة محلياً */
export function isPageAvailable(page: number): boolean {
  return page >= 1 && page <= TOTAL_QURAN_PAGES;
}
