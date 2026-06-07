'use client';

import React, { useState, useCallback } from 'react';
import { useQuranStore } from '@/lib/store';
import { withBasePath, getBasePath } from '@/lib/base-path';

// مُعالج خطأ تحميل الأيقونة - يجرب مسارات بديلة
const handleIconError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  const currentSrc = img.getAttribute('src') || '';
  // إذا كان المسار بدون basePath، جرب مع basePath
  if (!currentSrc.includes('/quran-test-creator/')) {
    img.src = '/quran-test-creator/app-icon-1024.png';
  } else if (currentSrc.includes('/quran-test-creator/')) {
    // إذا كان مع basePath، جرب بدونه
    img.src = '/app-icon-1024.png';
  }
  // منع التكرار اللانهائي
  img.onerror = null;
};

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

const STEPS = [
  { num: '١', text: 'اختر دورة الحفظ المناسبة' },
  { num: '٢', text: 'حدد السورة والآيات المطلوبة' },
  { num: '٣', text: 'أضف الأسئلة يدوياً بالضغط على الآيات' },
  { num: '٤', text: 'اضغط على زر توليد الاختبار' },
  { num: '٥', text: 'أدخل بيانات الطالب وابدأ الاختبار' },
  { num: '٦', text: 'شاهد النتيجة وشاركها عبر واتساب' },
];

const APK_DOWNLOAD_URL = 'https://github.com/ramyghaly535-bot/quran-test-creator/releases/download/v1.0.0/quran-test-app.apk';

export default function DownloadView() {
  const navigateTo = useQuranStore(s => s.navigateTo);
  const goBack = useQuranStore(s => s.goBack);
  const viewMode = useQuranStore(s => s.viewMode);
  const [copied, setCopied] = useState(false);
  const [iconSrc, setIconSrc] = useState(() => withBasePath('/app-icon-1024.png'));
  const [currentUrl] = useState(() => typeof window !== 'undefined' ? window.location.origin : '');

  // Fallback: إذا لم يتم كشف basePath في البداية، أعد المحاولة بعد التحميل
  React.useEffect(() => {
    const bp = getBasePath();
    if (bp) {
      setIconSrc(bp + '/app-icon-1024.png');
    }
  }, []);

  const handleStartApp = () => {
    navigateTo('home');
    const base = getBasePath();
    window.history.pushState({}, '', base ? base + '/' : '/');
  };

  const handleShareLink = () => {
    const base = getBasePath();
    const url = (currentUrl || window.location.origin) + (base ? base : '');
    if (navigator.share) {
      navigator.share({
        title: 'اختبارات القرآن الكريم',
        text: 'تطبيق متكامل لإنشاء اختبارات حفظ القرآن الكريم',
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    const base = getBasePath();
    const url = (currentUrl || window.location.origin) + (base ? base : '');
    const text = '📚 اختبارات القرآن الكريم\nتطبيق متكامل لإنشاء اختبارات حفظ القرآن\n🔗 ' + url;
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
  };

  return (
    <div className="pattern-islamic pattern-islamic-bg" dir="rtl" style={{ overflowX: 'hidden' }}>
      <div className="relative z-10 flex flex-col" style={{ minHeight: '100vh' }}>

        {/* شريط علوي */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(5, 11, 24, 0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(245, 197, 66, 0.15)',
          padding: '10px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src={iconSrc}
              alt="أيقونة"
              onError={handleIconError}
              style={{ width: 36, height: 36, borderRadius: 8, border: '1.5px solid rgba(245, 197, 66, 0.3)' }}
            />
            <span style={{
              fontFamily: "'Amiri', 'Tajawal', serif",
              fontWeight: 800, fontSize: 16, color: '#ffd700',
            }}>
              اختبارات القرآن
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleStartApp}
              style={{
                background: 'linear-gradient(135deg, #d4a017, #ffd700)',
                border: 'none', borderRadius: 10, padding: '8px 20px',
                color: '#0a1628', fontWeight: 800, fontSize: 13, cursor: 'pointer',
                fontFamily: "'Amiri', 'Tajawal', serif",
                boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)',
              }}
            >
              🚀 ابدأ الآن
            </button>
            {viewMode !== 'download' && (
              <button
                onClick={() => goBack()}
                style={{
                  background: 'rgba(10, 22, 40, 0.8)',
                  border: '1.5px solid rgba(245, 197, 66, 0.25)',
                  borderRadius: 10, padding: '8px 16px',
                  color: '#fff5cc', cursor: 'pointer',
                  fontWeight: 700, fontSize: 13,
                  fontFamily: "'Amiri', 'Tajawal', serif",
                }}
              >
                ← رجوع
              </button>
            )}
          </div>
        </header>

        {/* المحتوى الرئيسي */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px 40px' }}>

          {/* قسم البطل - أيقونة + اسم + بدء */}
          <div style={{ textAlign: 'center', marginBottom: 36, marginTop: 20 }}>
            {/* أيقونة التطبيق */}
            <div style={{ margin: '0 auto 20px', position: 'relative', width: 130, height: 130 }}>
              <div style={{
                width: 130, height: 130, borderRadius: 30,
                background: 'linear-gradient(135deg, #0a1628, #162d5a)',
                border: '3px solid rgba(245, 197, 66, 0.4)',
                boxShadow: '0 0 50px rgba(245, 197, 66, 0.2), 0 20px 60px rgba(0, 0, 0, 0.6)',
                overflow: 'hidden',
              }}>
                <img
                  src={iconSrc}
                  alt="أيقونة تطبيق اختبارات القرآن"
                  onError={handleIconError}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{
                position: 'absolute', inset: -10,
                borderRadius: 40,
                border: '2px solid rgba(255, 215, 0, 0.1)',
                animation: 'designerGlow 3s ease-in-out infinite',
                pointerEvents: 'none',
              }} />
            </div>

            {/* اسم التطبيق */}
            <h1
              className="text-gradient title-golden text-elegant"
              style={{
                fontFamily: "'Amiri', 'Tajawal', 'Cairo', serif",
                fontSize: 30, fontWeight: 900,
                lineHeight: 1.4, marginBottom: 10,
              }}
            >
              منشئ اختبارات القرآن الكريم
            </h1>

            {/* وصف */}
            <p style={{
              fontSize: 15, color: '#fff5cc', lineHeight: 1.9,
              maxWidth: 520, margin: '0 auto 28px',
              fontFamily: "'Amiri', 'Tajawal', serif",
              textShadow: '0 0 8px rgba(245, 197, 66, 0.2)',
            }}>
              تطبيق متكامل لإنشاء اختبارات حفظ القرآن الكريم، يدعم 16 دورة حفظ مختلفة، مع عرض صفحات المصحف الشريف وتقييم فوري للنتائج
            </p>

            {/* أزرار البدء والتحميل */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              {/* زر بدء التطبيق من المتصفح */}
              <button
                onClick={handleStartApp}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                  background: 'linear-gradient(135deg, #d4a017, #ffd700, #f5c542)',
                  border: 'none', borderRadius: 22,
                  padding: '18px 52px',
                  fontSize: 22, fontWeight: 900, color: '#0a1628',
                  cursor: 'pointer',
                  boxShadow: '0 8px 30px rgba(255, 215, 0, 0.45), 0 0 20px rgba(255, 215, 0, 0.2)',
                  fontFamily: "'Amiri', 'Tajawal', serif",
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1.06)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(255, 215, 0, 0.55), 0 0 30px rgba(255, 215, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(255, 215, 0, 0.45), 0 0 20px rgba(255, 215, 0, 0.2)';
                }}
              >
                <span style={{ fontSize: 30 }}>🚀</span>
                ابدأ استخدام التطبيق
              </button>

              {/* زر تحميل الـ APK */}
              <a
                href={APK_DOWNLOAD_URL}
                download
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  background: 'linear-gradient(135deg, #1a7a3a, #25d366, #128C7E)',
                  border: 'none', borderRadius: 20,
                  padding: '14px 40px',
                  fontSize: 18, fontWeight: 900, color: '#ffffff',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  boxShadow: '0 6px 25px rgba(37, 211, 102, 0.35), 0 0 15px rgba(37, 211, 102, 0.15)',
                  fontFamily: "'Amiri', 'Tajawal', serif",
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 35px rgba(37, 211, 102, 0.5), 0 0 25px rgba(37, 211, 102, 0.25)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 25px rgba(37, 211, 102, 0.35), 0 0 15px rgba(37, 211, 102, 0.15)';
                }}
              >
                <span style={{ fontSize: 26 }}>📥</span>
                تحميل تطبيق أندرويد APK
              </a>

              <p style={{ color: 'rgba(255, 245, 204, 0.5)', fontSize: 12 }}>
                ملف التثبيت لحوالي 159 MB • يتطلب Android 7.0 أو أحدث
              </p>

              {/* أزرار المشاركة */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
                <button
                  onClick={handleShareWhatsApp}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: 'rgba(37, 211, 102, 0.15)',
                    border: '2px solid rgba(37, 211, 102, 0.4)',
                    borderRadius: 16, padding: '12px 24px',
                    color: '#25d366', cursor: 'pointer',
                    fontWeight: 800, fontSize: 14,
                    fontFamily: "'Amiri', 'Tajawal', serif",
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(37, 211, 102, 0.7)';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(37, 211, 102, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(37, 211, 102, 0.4)';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(37, 211, 102, 0.15)';
                  }}
                >
                  📱 مشاركة واتساب
                </button>
                <button
                  onClick={handleShareLink}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: 'rgba(10, 22, 40, 0.8)',
                    border: '2px solid rgba(245, 197, 66, 0.3)',
                    borderRadius: 16, padding: '12px 24px',
                    color: '#ffd700', cursor: 'pointer',
                    fontWeight: 800, fontSize: 14,
                    fontFamily: "'Amiri', 'Tajawal', serif",
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245, 197, 66, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245, 197, 66, 0.3)';
                  }}
                >
                  {copied ? '✅ تم النسخ!' : '🔗 نسخ الرابط'}
                </button>
              </div>
            </div>

            <p style={{ color: 'rgba(255, 245, 204, 0.45)', fontSize: 12, marginTop: 10 }}>
              يعمل مباشرة من المتصفح • أو حمّل تطبيق أندرويد • مجاني بالكامل
            </p>
          </div>

          {/* معلومات التطبيق */}
          <div className="card-glass" style={{ width: '100%', maxWidth: 520, marginBottom: 28 }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 1, background: 'rgba(245, 197, 66, 0.08)',
              borderRadius: 14, overflow: 'hidden',
            }}>
              {[
                { icon: '📦', label: 'الإصدار', value: '1.0' },
                { icon: '💾', label: 'الحجم', value: '~159 MB' },
                { icon: '📱', label: 'يتطلب', value: 'Android 7.0+' },
                { icon: '💰', label: 'السعر', value: 'مجاني' },
              ].map((item, idx) => (
                <div key={idx} style={{
                  background: 'rgba(10, 22, 40, 0.95)',
                  padding: '14px 8px', textAlign: 'center',
                  borderLeft: idx > 0 ? '1px solid rgba(245, 197, 66, 0.1)' : 'none',
                }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{item.icon}</div>
                  <div style={{ color: '#ffd700', fontSize: 11, fontWeight: 800, marginBottom: 2 }}>{item.label}</div>
                  <div style={{ color: '#fff5cc', fontSize: 13, fontWeight: 700 }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* مميزات التطبيق */}
          <div style={{ width: '100%', maxWidth: 640, marginBottom: 32 }}>
            <h2 className="text-gradient title-golden text-elegant" style={{
              fontFamily: "'Amiri', 'Tajawal', serif",
              fontSize: 22, fontWeight: 900, textAlign: 'center', marginBottom: 20,
            }}>
              ✦ مميزات التطبيق ✦
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 10,
            }}>
              {FEATURES.map((feature, idx) => (
                <div key={idx} className="card-glass" style={{
                  padding: '14px 16px',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{
                    fontSize: 26, flexShrink: 0,
                    width: 42, height: 42,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(245, 197, 66, 0.1)',
                    borderRadius: 12, border: '1px solid rgba(245, 197, 66, 0.2)',
                  }}>
                    {feature.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="text-glow-gold text-elegant" style={{ fontSize: 14, fontWeight: 800, marginBottom: 2, fontFamily: "'Amiri', 'Tajawal', serif" }}>
                      {feature.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255, 245, 204, 0.55)', lineHeight: 1.5 }}>
                      {feature.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* طريقة الاستخدام */}
          <div className="card-glass" style={{ width: '100%', maxWidth: 520, marginBottom: 28, overflow: 'hidden' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(10, 22, 40, 0.95), rgba(22, 45, 90, 0.8))',
              padding: '24px 20px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 44, marginBottom: 10 }}>🕌</div>
              <h3 className="text-gradient text-elegant" style={{
                fontFamily: "'Amiri', 'Tajawal', serif",
                fontSize: 20, fontWeight: 900, marginBottom: 16,
              }}>
                طريقة الاستخدام
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 420, margin: '0 auto' }}>
                {STEPS.map((step, idx) => (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: 'rgba(245, 197, 66, 0.06)',
                    border: '1px solid rgba(245, 197, 66, 0.12)',
                    borderRadius: 10, padding: '10px 14px',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #d4a017, #ffd700)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#0a1628', fontSize: 15, fontWeight: 900, flexShrink: 0,
                      fontFamily: "'Amiri', serif",
                    }}>
                      {step.num}
                    </div>
                    <span style={{ color: '#fff5cc', fontSize: 14, fontWeight: 600, fontFamily: "'Amiri', 'Tajawal', serif" }}>
                      {step.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* زر تحميل APK ثاني في الأسفل */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <a
              href={APK_DOWNLOAD_URL}
              download
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: 'linear-gradient(135deg, #1a7a3a, #25d366)',
                border: 'none', borderRadius: 18,
                padding: '14px 40px',
                fontSize: 18, fontWeight: 900, color: '#ffffff',
                cursor: 'pointer',
                textDecoration: 'none',
                boxShadow: '0 6px 25px rgba(37, 211, 102, 0.4)',
                fontFamily: "'Amiri', 'Tajawal', serif",
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
              }}
            >
              📥 تحميل تطبيق أندرويد APK
            </a>
            <p style={{ color: 'rgba(255, 245, 204, 0.4)', fontSize: 11, marginTop: 8 }}>
              أو اضغط "ابدأ الآن" لتجربة التطبيق مباشرة من المتصفح
            </p>
          </div>

          {/* رصيد المصمم */}
          <div style={{ textAlign: 'center', padding: '16px 0', borderTop: '1px solid rgba(245, 197, 66, 0.1)', width: '100%', maxWidth: 400 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(8, 20, 43, 0.5)',
              border: '1px solid rgba(255, 215, 0, 0.15)',
              borderRadius: 16, padding: '10px 24px',
            }}>
              <span className="designer-credit-sparkle" style={{ fontSize: 18 }}>✦</span>
              <span className="designer-credit" style={{ fontFamily: "'Amiri', 'Tajawal', serif", fontSize: 18, direction: 'rtl' }}>أبوعبدالملك AR</span>
              <span className="designer-credit-sparkle" style={{ fontSize: 18, animationDelay: '0.5s' }}>✦</span>
            </div>
            <p style={{ color: 'rgba(255, 245, 204, 0.35)', fontSize: 11, marginTop: 8, fontFamily: "'Amiri', serif" }}>
              تصميم وتطوير أبوعبدالملك AR © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
