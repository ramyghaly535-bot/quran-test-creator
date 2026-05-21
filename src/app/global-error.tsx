'use client';

import { useEffect } from 'react';

/**
 * مكون معالجة الأخطاء العالمية
 * يعالج خطأ PreconditionFailed (function is pending state) 
 * بإعادة تحميل الصفحة تلقائياً
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // التحقق من خطأ PreconditionFailed
    const errorStr = error.message || String(error);
    if (errorStr.includes('PreconditionFailed') || errorStr.includes('pending state')) {
      console.warn('[GlobalError] خطأ PreconditionFailed - إعادة المحاولة تلقائياً...');
      // إعادة المحاولة بعد 3 ثوان
      const timer = setTimeout(() => {
        reset();
      }, 3000);
      return () => clearTimeout(timer);
    }
    console.error('[GlobalError] خطأ غير متوقع:', error);
  }, [error, reset]);

  return (
    <html lang="ar" dir="rtl">
      <body style={{
        background: '#050b18',
        color: '#ffffff',
        fontFamily: "'Amiri', 'Tajawal', 'Cairo', serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        margin: 0,
        padding: 20,
        textAlign: 'center',
        direction: 'rtl',
      }}>
        <div style={{
          background: 'rgba(10, 22, 40, 0.95)',
          border: '2px solid rgba(245, 197, 66, 0.4)',
          borderRadius: 16,
          padding: '40px 30px',
          maxWidth: 500,
          boxShadow: '0 10px 40px rgba(0,0,0,0.5), 0 0 30px rgba(245, 197, 66, 0.1)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ color: '#f5c542', fontSize: 22, fontWeight: 800, marginBottom: 12 }}>
            خطأ مؤقت في التحميل
          </h2>
          <p style={{ color: '#fff5cc', fontSize: 16, marginBottom: 20, lineHeight: 1.8 }}>
            التطبيق غير جاهز تماماً بعد. سيتم إعادة المحاولة تلقائياً خلال ثوانٍ.
          </p>
          <button
            onClick={() => reset()}
            style={{
              background: 'linear-gradient(135deg, #f5c542, #ffd700)',
              border: 'none',
              color: '#050b18',
              padding: '12px 32px',
              borderRadius: 10,
              fontSize: 16,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(245, 197, 66, 0.4)',
            }}
          >
            🔄 إعادة المحاولة الآن
          </button>
        </div>
      </body>
    </html>
  );
}
