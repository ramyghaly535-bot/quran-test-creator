/* ═══════════════════════════════════════════════
   محمّل بيانات القرآن الكريم
   مع آلية إعادة المحاولة التلقائية لخطأ PreconditionFailed
   البيانات في public/quran-data.json
   ═══════════════════════════════════════════════ */

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
 * يعالج خطأ PreconditionFailed (function is pending state) تلقائياً
 * يزيد وقت الانتظار تدريجياً بين المحاولات
 */
export async function loadQuranData(
  maxRetries: number = 10,
  baseDelay: number = 1500
): Promise<QuranDataMap> {
  // إذا كانت البيانات محفوظة مسبقاً، أرجعها مباشرة
  if (cachedData) return cachedData;
  
  // إذا كان التحميل جارياً، أرجع الوعد الحالي
  if (isLoading && loadPromise) return loadPromise;
  
  isLoading = true;
  
  loadPromise = (async () => {
    let lastError: unknown = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // استخدام basePath للعمل على GitHub Pages
        const basePath = typeof window !== 'undefined' && window.__NEXT_DATA__?.basePath
          ? window.__NEXT_DATA__.basePath
          : (typeof window !== 'undefined' && window.location.pathname !== '/'
            ? '/' + window.location.pathname.split('/').filter(Boolean)[0]
            : '');
        const res = await fetch(basePath + '/quran-data.json');
        
        if (res.ok) {
          const data = await res.json() as QuranDataMap;
          
          // التحقق من أن البيانات صالحة وليست خطأ PreconditionFailed
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
        
        // محاولة قراءة نص الخطأ
        const text = await res.text();
        
        try {
          const errorData = JSON.parse(text);
          
          // إذا كان خطأ PreconditionFailed، أعد المحاولة
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
          // ليس JSON - خطأ عادي
        }
        
        throw new Error(`فشل التحميل: HTTP ${res.status}`);
      } catch (error) {
        lastError = error;
        
        // إذا كان خطأ شبكة، أعد المحاولة
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

/**
 * الحصول على البيانات المحفوظة مسبقاً (بدون جلب)
 */
export function getCachedQuranData(): QuranDataMap | null {
  return cachedData;
}

/**
 * عدد السور المحملة
 */
export function getLoadedSurahCount(): number {
  return cachedData ? Object.keys(cachedData).length : 0;
}
