'use client';

import React from 'react';
import { useQuranStore } from '@/lib/store';
import { getScoreTier } from '@/lib/quran-constants';
import BackButton from '@/components/BackButton';
import FireworksCanvas from '@/components/FireworksCanvas';

export default function ResultsView() {
  const {
    testResult, showFireworks,
    shareOnWhatsApp, navigateTo,
  } = useQuranStore();

  if (!testResult) return null;
  const tier = getScoreTier(testResult.finalScore);
  const isPassing = testResult.finalScore >= 75;

  return (
    <div className="pattern-islamic pattern-islamic-bg" dir="rtl" style={{ overflowX: 'hidden' }}>
      {showFireworks && <FireworksCanvas />}
      <div className="relative z-10 flex-1 flex flex-col" style={{ minHeight: '100vh' }}>
        <div className="max-w-lg mx-auto w-full px-4 py-6">
          <BackButton label="عودة" />

          {/* بطاقة النتيجة الرئيسية */}
          <div className="card-glass" style={{ borderColor: tier.borderColor, borderWidth: 3 }}>
            {/* رأس النتيجة */}
            <div style={{
              background: tier.gradient,
              padding: '24px 20px',
              textAlign: 'center',
              borderRadius: '14px 14px 0 0'
            }}>
              {isPassing && (
                <div style={{ fontSize: 60, animation: 'trophyBounce 1.5s ease-in-out infinite', marginBottom: 8 }}>
                  {tier.cupEmoji}
                </div>
              )}
              <div style={{ fontSize: 56, fontWeight: 900, color: '#0a1628', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                {testResult.finalScore}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'rgba(10, 22, 40, 0.7)' }}>
                من 100
              </div>
              {tier.label && (
                <div style={{ fontSize: 22, fontWeight: 800, color: '#0a1628', marginTop: 8, textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                  {tier.label} ✨
                </div>
              )}
              {!isPassing && (
                <div style={{ fontSize: 22, fontWeight: 800, color: '#0a1628', marginTop: 8 }}>
                  لم يجتز ❌
                </div>
              )}
            </div>

            {/* تفاصيل الأخطاء */}
            <div className="p-5 space-y-3">
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(8, 20, 43, 0.5)', borderRadius: 8 }}>
                <span style={{ color: '#fbbf24', fontWeight: 700 }}>⚠️ خطأ صغير ({testResult.errors.small})</span>
                <span style={{ color: '#ff6b6b', fontWeight: 700 }}>-{(testResult.errors.small * 0.5).toFixed(1)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(8, 20, 43, 0.5)', borderRadius: 8 }}>
                <span style={{ color: '#f87171', fontWeight: 700 }}>❌ خطأ متوسط ({testResult.errors.medium})</span>
                <span style={{ color: '#ff6b6b', fontWeight: 700 }}>-{(testResult.errors.medium * 1).toFixed(1)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(8, 20, 43, 0.5)', borderRadius: 8 }}>
                <span style={{ color: '#c084fc', fontWeight: 700 }}>🔄 تغيير موضع ({testResult.errors.position})</span>
                <span style={{ color: '#ff6b6b', fontWeight: 700 }}>-{(testResult.errors.position * 3).toFixed(1)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(8, 20, 43, 0.5)', borderRadius: 8 }}>
                <span style={{ color: '#f472b6', fontWeight: 700 }}>📉 ضعف تلاوة ({testResult.errors.weakness})</span>
                <span style={{ color: '#ff6b6b', fontWeight: 700 }}>-{testResult.errors.weakness.toFixed(1)}</span>
              </div>

              {/* معلومات الطالب */}
              <div style={{ background: 'rgba(8, 20, 43, 0.72)', border: '1px solid rgba(245, 197, 66, 0.2)', borderRadius: 10, padding: '12px 16px', marginTop: 8 }}>
                <h4 style={{ color: '#f5c542', fontWeight: 700, marginBottom: 8, fontSize: 14 }}>👤 بيانات الطالب</h4>
                <div style={{ fontSize: 13, lineHeight: 2, color: '#e0e0e0' }}>
                  <div>الاسم: <strong style={{ color: '#fff5cc' }}>{testResult.studentInfo.name}</strong></div>
                  {testResult.studentInfo.birthDate && <div>تاريخ الميلاد: <strong style={{ color: '#fff5cc' }}>{testResult.studentInfo.birthDate}</strong></div>}
                  {testResult.studentInfo.teacher && <div>المحفظ: <strong style={{ color: '#fff5cc' }}>{testResult.studentInfo.teacher}</strong></div>}
                  {testResult.studentInfo.center && <div>المركز: <strong style={{ color: '#fff5cc' }}>{testResult.studentInfo.center}</strong></div>}
                  {testResult.studentInfo.governorate && <div>المحافظة: <strong style={{ color: '#fff5cc' }}>{testResult.studentInfo.governorate}</strong></div>}
                </div>
              </div>

              {/* معلومات الاختبار */}
              <div style={{ background: 'rgba(8, 20, 43, 0.72)', border: '1px solid rgba(245, 197, 66, 0.2)', borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ fontSize: 13, lineHeight: 2, color: '#e0e0e0' }}>
                  <div>📖 الدورة: <strong style={{ color: '#fff5cc' }}>{testResult.courseName}</strong></div>
                  <div>📅 التاريخ: <strong style={{ color: '#fff5cc' }}>{testResult.date}</strong></div>
                  <div>🕐 الوقت: <strong style={{ color: '#fff5cc' }}>{testResult.time}</strong></div>
                  <div>📝 عدد الأسئلة: <strong style={{ color: '#fff5cc' }}>{testResult.questions.length}</strong></div>
                </div>
              </div>

              {/* أزرار المشاركة */}
              <div className="flex gap-3 mt-4">
                <button onClick={shareOnWhatsApp} style={{
                  flex: 1,
                  background: 'linear-gradient(45deg, #25d366, #128c7e)',
                  border: 'none', padding: '14px 20px', borderRadius: 12,
                  color: '#ffffff', fontWeight: 800, fontSize: 15,
                  cursor: 'pointer', boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)'
                }}>
                  📱 مشاركة عبر واتساب
                </button>
              </div>
              <button onClick={() => navigateTo('allResults')} style={{
                width: '100%',
                background: 'rgba(8, 20, 43, 0.72)',
                border: '2px solid rgba(245, 197, 66, 0.25)',
                color: '#fff5cc', padding: '12px 20px', borderRadius: 12,
                cursor: 'pointer', fontWeight: 700, fontSize: 14, textAlign: 'center'
              }}>
                📜 عرض جميع النتائج
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
