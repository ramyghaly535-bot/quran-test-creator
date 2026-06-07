/* ═══════════════════════════════════════════════
   محمّل بيانات القرآن الكريم
   مع آلية إعادة المحاولة التلقائية لخطأ PreconditionFailed
   البيانات في public/quran-data.json
   ═══════════════════════════════════════════════ */

import { getBasePath } from './base-path';

export interface QuranVerseData {
  text: string;
  numberInSurah: number;
  page: number;
  juz: number;
}

export type QuranDataMap = Record<string, QuranVerseData[]>;

// ذاكرة تخزين مؤقت للبيانات
let cachedData: QuranDataMap | null = null;
let isLoading = false;
let loadPromise: Promise<QuranDataMap> | null = null;

/**
 * التحقق مما إذا كان الخطأ من نوع PreconditionFailed
 */
function isPreconditionFailedError(data: unknown): boolean {
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;
    return obj.Code === 'PreconditionFailed' || obj.code === 'PreconditionFailed';
  }
  return false;
}

/**
 * تحميل بيانات القرآن مع إعادة المحاولة التلقائية
 */
export async function loadQuranData(
  maxRetries: number = 10,
  baseDelay: number = 1500
): Promise<QuranDataMap> {
  if (cachedData) return cachedData;
  if (isLoading && loadPromise) return loadPromise;

  isLoading = true;

  loadPromise = (async () => {
    let lastError: unknown = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const basePath = getBasePath();
        const res = await fetch(basePath + '/quran-data.json');

        if (res.ok) {
          const data = await res.json() as QuranDataMap;

          if (isPreconditionFailedError(data)) {
            if (attempt < maxRetries) {
              const delay = baseDelay * Math.min(attempt + 1, 5);
              console.warn(
                `[QuranLoader] الدالة غير جاهزة، إعادة المحاولة ${attempt + 1}/${maxRetries} بعد ${delay}ms...`
              );
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
            throw new Error('فشل تحميل بيانات القرآن: الدالة غير جاهزة بعد عدة محاولات');
          }

          cachedData = data;
          isLoading = false;
          console.log(`[QuranLoader] ✅ تم تحميل ${Object.keys(data).length} سورة بنجاح`);
          return data;
        }

        const text = await res.text();

        try {
          const errorData = JSON.parse(text);

          if (isPreconditionFailedError(errorData)) {
            if (attempt < maxRetries) {
              const delay = baseDelay * Math.min(attempt + 1, 5);
              console.warn(
                `[QuranLoader] الدالة غير جاهزة (HTTP ${res.status})، إعادة المحاولة ${attempt + 1}/${maxRetries} بعد ${delay}ms...`
              );
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
          }
        } catch {
          // ليس JSON
        }

        throw new Error(`فشل التحميل: HTTP ${res.status}`);
      } catch (error) {
        lastError = error;

        if (attempt < maxRetries) {
          const delay = baseDelay * Math.min(attempt + 1, 5);
          console.warn(
            `[QuranLoader] خطأ في الشبكة، إعادة المحاولة ${attempt + 1}/${maxRetries} بعد ${delay}ms...`
          );
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
    }

    isLoading = false;
    throw lastError || new Error('فشل تحميل بيانات القرآن بعد عدة محاولات');
  })();

  return loadPromise;
}

export function getCachedQuranData(): QuranDataMap | null {
  return cachedData;
}

export function getLoadedSurahCount(): number {
  return cachedData ? Object.keys(cachedData).length : 0;
}
