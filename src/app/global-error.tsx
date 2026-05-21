'use client';

import { useEffect } from 'react';

/**
 * مكون معالجة الأخطاء العالمية
 * يعالج أخطاء التحميل بما فيها PreconditionFailed
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
    const errorStr = error.message || String(error);
    
    // التحقق من خطأ PreconditionFailed أو خطأ شبكة
    if (
      errorStr.includes('PreconditionFailed') ||
      errorStr.includes('pending state') ||
      errorStr.includes('Failed to fetch') ||
      errorStr.includes('NetworkError') ||
      errorStr.includes('Load failed')
    ) {
      console.warn('[GlobalError] خطأ شبكة/تحميل - إعادة المحاولة تلقائياً...');
      const timer = setTimeout(() => {
        // محاولة إعادة التحميل الكامل للصفحة
        if (typeof window !== 'undefined') {
          window.location.reload();
        } else {
          reset();
        }
      }, 2000);
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
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <h2 style={{ color: '#f5c542', fontSize: 22, fontWeight: 800, marginBottom: 12 }}>
            جاري تحميل التطبيق
          </h2>
          <p style={{ color: '#fff5cc', fontSize: 16, marginBottom: 20, lineHeight: 1.8 }}>
            التطبيق يبدأ الآن. سيتم التحميل تلقائياً خلال ثوانٍ...
          </p>
          <button
            onClick={() => window.location.reload()}
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
            🔄 إعادة التحميل الآن
          </button>
        </div>
        <script dangerouslySetInnerHTML={{ __html: `
          // إعادة المحاولة التلقائية عند خطأ PreconditionFailed
          setTimeout(function() {
            if (document.querySelector('[data-error-boundary]')) {
              window.location.reload();
            }
          }, 3000);
        `}} />
      </body>
    </html>
  );
}
