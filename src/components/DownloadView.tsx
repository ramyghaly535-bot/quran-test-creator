'use client';

import React from 'react';
import { useQuranStore } from '@/lib/store';

const FEATURES = [
  { icon: '📚', title: 'اختيار الدورة', desc: '16 دورة حفظ من جزء واحد إلى 30 جزءاً' },
  { icon: '📖', title: 'اختيار السور', desc: 'تصفح آيات القرآن الكريم بسهولة' },
  { icon: '✨', title: 'توليد الاختبار', desc: 'توليد تلقائي للاختبارات من الأجزاء المحددة' },
  { icon: '🔄', title: 'تغيير الموضع', desc: 'إمكانية تغيير سؤال واحد لكل اختبار' },
  { icon: '📊', title: 'تقييم فوري', desc: 'نتائج فورية مع تصنيف ذهبي وفضي وبرونزي' },
  { icon: '📱', title: 'مشاركة النتائج', desc: 'مشاركة النتائج عبر واتساب مباشرة' },
  { icon: '🖼️', title: 'صور صفحات المصحف', desc: 'عرض صور صفحات المصحف الشريف أثناء الاختبار' },
  { icon: '💾', title: 'حفظ تلقائي', desc: 'حفظ الأسئلة والنتائج تلقائياً في الجهاز' },
];

export default function DownloadView() {
  const navigateTo = useQuranStore(s => s.navigateTo);
  const goBack = useQuranStore(s => s.goBack);

  return (
    <div className="pattern-islamic pattern-islamic-bg" dir="rtl" style={{ overflowX: 'hidden' }}>
      <div className="relative z-10 flex flex-col" style={{ minHeight: '100vh' }}>

        {/* زر العودة */}
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 50 }}>
          <button
            onClick={() => goBack()}
            style={{
              background: 'rgba(10, 22, 40, 0.9)',
              border: '2px solid rgba(245, 197, 66, 0.3)',
              borderRadius: 12, padding: '8px 16px',
              color: '#ffd700', cursor: 'pointer',
              fontWeight: 700, fontSize: 14,
              backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <span>→</span>
            <span>العودة للتطبيق</span>
          </button>
        </div>

        {/* المحتوى الرئيسي */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px' }}>

          {/* أيقونة التطبيق */}
          <div style={{ marginTop: 32, marginBottom: 20, position: 'relative' }}>
            <div style={{
              width: 120, height: 120, borderRadius: 28,
              background: 'linear-gradient(135deg, #0a1628, #162d5a)',
              border: '3px solid rgba(245, 197, 66, 0.4)',
              boxShadow: '0 0 40px rgba(245, 197, 66, 0.15), 0 20px 60px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden', position: 'relative',
            }}>
              <img
                src="/app-icon-1024.png"
                alt="أيقونة تطبيق اختبارات القرآن"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            {/* حلقة ذهبية متوهجة */}
            <div style={{
              position: 'absolute', inset: -8,
              borderRadius: 36,
              border: '2px solid rgba(255, 215, 0, 0.15)',
              animation: 'designerGlow 3s ease-in-out infinite',
              pointerEvents: 'none',
            }} />
          </div>

          {/* اسم التطبيق */}
          <h1
            className="text-gradient title-golden text-elegant"
            style={{
              fontFamily: "'Amiri', 'Tajawal', 'Cairo', serif",
              fontSize: 28,
              fontWeight: 900,
              textAlign: 'center',
              marginBottom: 8,
              lineHeight: 1.4,
            }}
          >
            منشئ اختبارات القرآن الكريم
          </h1>

          {/* وصف مختصر */}
          <p
            className="text-glow-gold text-elegant"
            style={{
              fontSize: 15,
              textAlign: 'center',
              maxWidth: 500,
              lineHeight: 1.8,
              marginBottom: 24,
              color: '#fff5cc',
            }}
          >
            تطبيق متكامل لإنشاء اختبارات حفظ القرآن الكريم، يدعم 16 دورة حفظ مختلفة، مع عرض صفحات المصحف الشريف وتقييم فوري للنتائج
          </p>

          {/* زر التحميل الرئيسي */}
          <a
            href="/اختبارات-القرآن.apk"
            download
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              background: 'linear-gradient(135deg, #d4a017, #ffd700, #f5c542)',
              border: 'none',
              borderRadius: 20,
              padding: '16px 48px',
              fontSize: 20,
              fontWeight: 900,
              color: '#0a1628',
              cursor: 'pointer',
              textDecoration: 'none',
              boxShadow: '0 8px 30px rgba(255, 215, 0, 0.4), 0 0 20px rgba(255, 215, 0, 0.2)',
              transition: 'all 0.3s ease',
              marginBottom: 12,
              fontFamily: "'Amiri', 'Tajawal', 'Cairo', serif",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(255, 215, 0, 0.5), 0 0 30px rgba(255, 215, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(255, 215, 0, 0.4), 0 0 20px rgba(255, 215, 0, 0.2)';
            }}
          >
            <span style={{ fontSize: 28 }}>📥</span>
            تحميل التطبيق APK
          </a>

          <p style={{ color: 'rgba(255, 245, 204, 0.5)', fontSize: 12, marginBottom: 32 }}>
            اضغط على الزر لبدء تحميل ملف التثبيت
          </p>

          {/* معلومات التطبيق */}
          <div className="card-glass" style={{ width: '100%', maxWidth: 500, marginBottom: 28 }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 1,
              background: 'rgba(245, 197, 66, 0.1)',
              borderRadius: 14,
              overflow: 'hidden',
            }}>
              <div style={{
                background: 'rgba(10, 22, 40, 0.95)',
                padding: '16px 12px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>📦</div>
                <div style={{ color: '#ffd700', fontSize: 14, fontWeight: 800, marginBottom: 2 }}>الإصدار</div>
                <div style={{ color: '#fff5cc', fontSize: 16, fontWeight: 700 }}>1.0</div>
              </div>
              <div style={{
                background: 'rgba(10, 22, 40, 0.95)',
                padding: '16px 12px',
                textAlign: 'center',
                borderRight: '1px solid rgba(245, 197, 66, 0.15)',
                borderLeft: '1px solid rgba(245, 197, 66, 0.15)',
              }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>💾</div>
                <div style={{ color: '#ffd700', fontSize: 14, fontWeight: 800, marginBottom: 2 }}>الحجم</div>
                <div style={{ color: '#fff5cc', fontSize: 16, fontWeight: 700 }}>~159 MB</div>
              </div>
              <div style={{
                background: 'rgba(10, 22, 40, 0.95)',
                padding: '16px 12px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>🤖</div>
                <div style={{ color: '#ffd700', fontSize: 14, fontWeight: 800, marginBottom: 2 }}>يتطلب</div>
                <div style={{ color: '#fff5cc', fontSize: 16, fontWeight: 700 }}>Android 7.0+</div>
              </div>
            </div>
          </div>

          {/* مميزات التطبيق */}
          <div style={{ width: '100%', maxWidth: 600, marginBottom: 32 }}>
            <h2
              className="text-gradient title-golden text-elegant"
              style={{
                fontFamily: "'Amiri', 'Tajawal', 'Cairo', serif",
                fontSize: 22,
                fontWeight: 900,
                textAlign: 'center',
                marginBottom: 20,
              }}
            >
              ✦ مميزات التطبيق ✦
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: 12,
            }}>
              {FEATURES.map((feature, idx) => (
                <div
                  key={idx}
                  className="card-glass"
                  style={{
                    padding: '16px 18px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    cursor: 'default',
                  }}
                >
                  <div style={{
                    fontSize: 28,
                    flexShrink: 0,
                    width: 44,
                    height: 44,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(245, 197, 66, 0.1)',
                    borderRadius: 12,
                    border: '1px solid rgba(245, 197, 66, 0.2)',
                  }}>
                    {feature.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      className="text-glow-gold text-elegant"
                      style={{ fontSize: 15, fontWeight: 800, marginBottom: 4, fontFamily: "'Amiri', 'Tajawal', 'Cairo', serif" }}
                    >
                      {feature.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255, 245, 204, 0.6)', lineHeight: 1.6 }}>
                      {feature.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* لقطة شاشة وهمية / وصف إضافي */}
          <div className="card-glass" style={{ width: '100%', maxWidth: 500, marginBottom: 28, padding: 0, overflow: 'hidden' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(10, 22, 40, 0.95), rgba(22, 45, 90, 0.8))',
              padding: '24px 20px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🕌</div>
              <h3
                className="text-gradient text-elegant"
                style={{
                  fontFamily: "'Amiri', 'Tajawal', 'Cairo', serif",
                  fontSize: 20, fontWeight: 900, marginBottom: 10,
                }}
              >
                طريقة الاستخدام
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                textAlign: 'right',
                maxWidth: 400,
                margin: '0 auto',
              }}>
                {[
                  { num: '١', text: 'اختر دورة الحفظ المناسبة' },
                  { num: '٢', text: 'حدد السورة والآيات المطلوبة' },
                  { num: '٣', text: 'أضف الأسئلة يدوياً بالضغط على الآيات' },
                  { num: '٤', text: 'اضغط على زر توليد الاختبار' },
                  { num: '٥', text: 'أدخل بيانات الطالب وابدأ الاختبار' },
                  { num: '٦', text: 'شاهد النتيجة وشاركها عبر واتساب' },
                ].map((step, idx) => (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: 'rgba(245, 197, 66, 0.06)',
                    border: '1px solid rgba(245, 197, 66, 0.15)',
                    borderRadius: 10, padding: '10px 14px',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #d4a017, #ffd700)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#0a1628', fontSize: 16, fontWeight: 900, flexShrink: 0,
                      fontFamily: "'Amiri', serif",
                    }}>
                      {step.num}
                    </div>
                    <span style={{ color: '#fff5cc', fontSize: 14, fontWeight: 600, fontFamily: "'Amiri', 'Tajawal', 'Cairo', serif" }}>
                      {step.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* زر العودة للتطبيق */}
          <button
            onClick={() => navigateTo('home')}
            style={{
              background: 'rgba(10, 22, 40, 0.85)',
              border: '2px solid rgba(245, 197, 66, 0.3)',
              borderRadius: 16, padding: '14px 36px',
              color: '#ffd700', cursor: 'pointer',
              fontWeight: 800, fontSize: 16,
              fontFamily: "'Amiri', 'Tajawal', 'Cairo', serif",
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.3s ease',
              marginBottom: 20,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245, 197, 66, 0.6)';
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245, 197, 66, 0.3)';
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
            }}
          >
            <span>📖</span>
            تجربة التطبيق مباشرة
          </button>

          {/* رصيد المصمم */}
          <div style={{ textAlign: 'center', padding: '16px 0 24px 0' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(8, 20, 43, 0.5)',
              border: '1px solid rgba(255, 215, 0, 0.2)',
              borderRadius: 16, padding: '12px 28px'
            }}>
              <span className="designer-credit-sparkle" style={{ fontSize: 20 }}>✦</span>
              <span className="designer-credit" style={{ fontFamily: "'Amiri', 'Tajawal', 'Cairo', serif", fontSize: 20, direction: 'rtl' }}>أبوعبدالملك AR</span>
              <span className="designer-credit-sparkle" style={{ fontSize: 20, animationDelay: '0.5s' }}>✦</span>
            </div>
            <p style={{ color: 'rgba(255, 245, 204, 0.4)', fontSize: 11, marginTop: 8 }}>
              تصميم وتطوير أبوعبدالملك AR © {new Date().getFullYear()}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
