/* ═══════════════════════════════════════════════
   أدوات جلب البيانات المتينة
   تعالج خطأ PreconditionFailed تلقائياً بإعادة المحاولة
   ═══════════════════════════════════════════════ */

/**
 * التحقق مما إذا كان الخطأ من نوع PreconditionFailed
 * خطأ: {"Code":"PreconditionFailed","Message":"function is pending state, please try later"}
 */
function isPreconditionFailedError(data: unknown): boolean {
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;
    return obj.Code === 'PreconditionFailed' || obj.code === 'PreconditionFailed';
  }
  return false;
}

/**
 * جلب بيانات مع إعادة المحاولة التلقائية عند خطأ PreconditionFailed
 * @param url رابط البيانات
 * @param maxRetries أقصى عدد من المحاولات (الافتراضي: 5)
 * @param baseDelay التأخير الأساسي بين المحاولات بالملي ثانية (الافتراضي: 2000)
 */
export async function resilientFetch<T>(
  url: string,
  maxRetries: number = 5,
  baseDelay: number = 2000
): Promise<T> {
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url);

      if (res.ok) {
        return await res.json() as T;
      }

      // محاولة قراءة نص الخطأ
      const text = await res.text();

      try {
        const errorData = JSON.parse(text);

        // إذا كان خطأ PreconditionFailed، أعد المحاولة
        if (isPreconditionFailedError(errorData)) {
          if (attempt < maxRetries) {
            const delay = baseDelay * (attempt + 1);
            console.warn(
              `[resilientFetch] الدالة غير جاهزة بعد، إعادة المحاولة ${attempt + 1}/${maxRetries} بعد ${delay}ms...`,
              errorData.Message
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

      // إذا كان خطأ شبكة (وليس PreconditionFailed)، أعد المحاولة
      if (attempt < maxRetries) {
        const delay = baseDelay * (attempt + 1);
        console.warn(
          `[resilientFetch] خطأ في الشبكة، إعادة المحاولة ${attempt + 1}/${maxRetries} بعد ${delay}ms...`,
          error
        );
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  throw lastError || new Error('فشل التحميل بعد عدة محاولات');
}
