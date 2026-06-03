'use client';

import React from 'react';
import { useQuranStore } from '@/lib/store';
import BackButton from '@/components/BackButton';
import QuranPagesViewer from '@/components/QuranPagesViewer';
import type { QuranVerseData } from '@/lib/quran-pages';

export default function TestView() {
  const {
    testQuestions, currentQuestionIndex, errors, surahCache,
    positionChangedQuestions, showWeaknessDialog, retryCount,
    handleQuestionComplete, handlePrevQuestion,
    handleErrorClick, handleWeaknessClick, setShowWeaknessDialog,
    retryTest,
  } = useQuranStore();

  if (testQuestions.length === 0) return null;
  const currentQ = testQuestions[currentQuestionIndex];
  const totalDeductions = (errors.small * 0.5) + (errors.medium * 1) + (errors.position * 3) + errors.weakness;
  const currentScore = Math.max(0, Math.round((100 - totalDeductions) * 10) / 10);

  return (
    <div className="pattern-islamic pattern-islamic-bg" dir="rtl" style={{ overflowX: 'hidden' }}>
      <div className="relative z-10 flex-1 flex flex-col" style={{ minHeight: '100vh' }}>
        <div className="max-w-4xl mx-auto w-full px-4 py-4">
          <BackButton label="عودة لبيانات الطالب" />

          {/* شريط التقدم والدرجة */}
          <div style={{
            background: 'rgba(8, 20, 43, 0.72)',
            border: '2px solid rgba(245, 197, 66, 0.25)',
            borderRadius: 12, padding: '12px 16px',
            marginBottom: 16, display: 'flex',
            justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: 8
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#f5c542', fontWeight: 700, fontSize: 14 }}>
                السؤال {currentQuestionIndex + 1} من {testQuestions.length}
              </span>
              <div style={{ width: 120, height: 8, background: 'rgba(245, 197, 66, 0.2)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  width: ((currentQuestionIndex + 1) / testQuestions.length * 100) + '%',
                  height: '100%', background: 'linear-gradient(90deg, #d4a017, #ffd700)',
                  borderRadius: 4, transition: 'width 0.3s'
                }} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: currentScore >= 75 ? '#22c55e' : '#ff6b6b', fontWeight: 800, fontSize: 16 }}>
                الدرجة: {currentScore}
              </span>
              <span style={{ color: '#ff6b6b', fontWeight: 700, fontSize: 13 }}>
                خصم: {totalDeductions}
              </span>
            </div>
          </div>

          {/* معلومات السؤال */}
          <div style={{
            background: 'rgba(8, 20, 43, 0.72)',
            border: '2px solid rgba(245, 197, 66, 0.25)',
            borderRadius: 12, padding: '12px 16px',
            marginBottom: 12, textAlign: 'center'
          }}>
            <h3 style={{ color: '#fff5cc', fontSize: 18, fontWeight: 700, fontFamily: "'Amiri', serif", marginBottom: 4 }}>
              سورة {currentQ.surah}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-block', background: 'rgba(245, 197, 66, 0.2)', color: '#ffd700', padding: '2px 10px', borderRadius: 6, fontSize: 13, fontWeight: 700 }}>من {currentQ.from}</span>
              <span style={{ display: 'inline-block', background: 'rgba(245, 197, 66, 0.2)', color: '#ffd700', padding: '2px 10px', borderRadius: 6, fontSize: 13, fontWeight: 700 }}>إلى {currentQ.to}</span>
              <span style={{ display: 'inline-block', background: 'rgba(245, 197, 66, 0.2)', color: '#ffd700', padding: '2px 10px', borderRadius: 6, fontSize: 13, fontWeight: 700 }}>صفحة {currentQ.page}</span>
              <span style={{ display: 'inline-block', background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', padding: '2px 10px', borderRadius: 6, fontSize: 13, fontWeight: 700 }}>جزء {currentQ.juz}</span>
            </div>
          </div>

          {/* عرض صورة الصفحة */}
          <div style={{ marginBottom: 16 }}>
            <QuranPagesViewer
              question={currentQ}
              surahCache={surahCache as Record<string, QuranVerseData[]>}
              compact={true}
            />
          </div>

          {/* أزرار الأخطاء */}
          <div className="card-glass">
            <div className="border-b p-3" style={{ background: 'rgba(8, 20, 43, 0.95)', borderColor: 'rgba(245, 197, 66, 0.25)' }}>
              <h3 className="text-lg font-black flex items-center gap-2 text-glow-white-bright" style={{ fontFamily: "'Amiri', 'Tajawal', 'Cairo', serif" }}>
                <span>🔴</span> تسجيل الأخطاء
              </h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button onClick={() => handleErrorClick('small', 0.5)} style={{
                  background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1))',
                  border: '2px solid rgba(245, 158, 11, 0.4)',
                  color: '#fbbf24', padding: '12px', borderRadius: 10,
                  cursor: 'pointer', fontWeight: 700, fontSize: 13, textAlign: 'center'
                }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>⚠️</div>
                  خطأ صغير
                  <div style={{ fontSize: 11, opacity: 0.8 }}>-0.5 درجة</div>
                  <div style={{ fontSize: 11, marginTop: 2, color: '#fbbf24' }}>العدد: {errors.small}</div>
                </button>
                <button onClick={() => handleErrorClick('medium', 1)} style={{
                  background: 'linear-gradient(180deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))',
                  border: '2px solid rgba(239, 68, 68, 0.4)',
                  color: '#f87171', padding: '12px', borderRadius: 10,
                  cursor: 'pointer', fontWeight: 700, fontSize: 13, textAlign: 'center'
                }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>❌</div>
                  خطأ متوسط
                  <div style={{ fontSize: 11, opacity: 0.8 }}>-1 درجة</div>
                  <div style={{ fontSize: 11, marginTop: 2, color: '#f87171' }}>العدد: {errors.medium}</div>
                </button>
                <button onClick={() => handleErrorClick('position', 3)} style={{
                  background: positionChangedQuestions.has(currentQuestionIndex)
                    ? 'linear-gradient(180deg, rgba(100, 100, 100, 0.2), rgba(100, 100, 100, 0.1))'
                    : 'linear-gradient(180deg, rgba(168, 85, 247, 0.2), rgba(168, 85, 247, 0.1))',
                  border: positionChangedQuestions.has(currentQuestionIndex)
                    ? '2px solid rgba(100, 100, 100, 0.4)'
                    : '2px solid rgba(168, 85, 247, 0.4)',
                  color: positionChangedQuestions.has(currentQuestionIndex) ? '#888' : '#c084fc',
                  padding: '12px', borderRadius: 10,
                  cursor: positionChangedQuestions.has(currentQuestionIndex) ? 'not-allowed' : 'pointer',
                  fontWeight: 700, fontSize: 13, textAlign: 'center',
                  opacity: positionChangedQuestions.has(currentQuestionIndex) ? 0.6 : 1
                }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>🔄</div>
                  تغيير موضع
                  <div style={{ fontSize: 11, opacity: 0.8 }}>-3 درجات</div>
                  <div style={{ fontSize: 11, marginTop: 2 }}>
                    {positionChangedQuestions.has(currentQuestionIndex) ? 'تم الاستخدام' : 'مرة واحدة'}
                  </div>
                </button>
                <button onClick={() => setShowWeaknessDialog(true)} style={{
                  background: 'linear-gradient(180deg, rgba(236, 72, 153, 0.2), rgba(236, 72, 153, 0.1))',
                  border: '2px solid rgba(236, 72, 153, 0.4)',
                  color: '#f472b6', padding: '12px', borderRadius: 10,
                  cursor: 'pointer', fontWeight: 700, fontSize: 13, textAlign: 'center'
                }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>📉</div>
                  ضعف تلاوة
                  <div style={{ fontSize: 11, opacity: 0.8 }}>1-5 درجات</div>
                  <div style={{ fontSize: 11, marginTop: 2, color: '#f472b6' }}>الخصم: {errors.weakness}</div>
                </button>
              </div>

              {/* حوار ضعف التلاوة */}
              {showWeaknessDialog && (
                <div style={{
                  background: 'rgba(8, 20, 43, 0.95)',
                  border: '2px solid rgba(236, 72, 153, 0.4)',
                  borderRadius: 12, padding: '16px',
                  marginBottom: 12, textAlign: 'center'
                }}>
                  <p style={{ color: '#f472b6', fontWeight: 700, marginBottom: 12, fontSize: 14 }}>
                    اختر درجة ضعف التلاوة:
                  </p>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {[1, 2, 3, 4, 5].map(val => (
                      <button key={val} onClick={() => handleWeaknessClick(val)} style={{
                        background: 'rgba(236, 72, 153, 0.2)',
                        border: '2px solid rgba(236, 72, 153, 0.4)',
                        color: '#f472b6', padding: '8px 16px',
                        borderRadius: 8, cursor: 'pointer',
                        fontWeight: 700, fontSize: 16, minWidth: 44
                      }}>
                        {val}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setShowWeaknessDialog(false)} style={{
                    marginTop: 10, background: 'rgba(8, 20, 43, 0.72)',
                    border: '1px solid rgba(245, 197, 66, 0.25)',
                    color: '#fff5cc', padding: '6px 16px',
                    borderRadius: 6, cursor: 'pointer', fontSize: 12
                  }}>
                    إلغاء
                  </button>
                </div>
              )}

              {/* أزرار التنقل والإتمام */}
              <div className="flex gap-3">
                <button onClick={handlePrevQuestion} disabled={currentQuestionIndex === 0} style={{
                  flex: 1,
                  background: currentQuestionIndex === 0 ? 'rgba(8, 20, 43, 0.5)' : 'rgba(8, 20, 43, 0.72)',
                  border: '2px solid rgba(245, 197, 66, 0.25)',
                  color: currentQuestionIndex === 0 ? '#666' : '#fff5cc',
                  padding: '12px', borderRadius: 10,
                  cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                  fontWeight: 700, fontSize: 14, textAlign: 'center'
                }}>
                  ← السابق
                </button>
                <button onClick={retryTest} style={{
                  flex: 1,
                  background: 'linear-gradient(45deg, #f59e0b, #d97706)',
                  border: 'none', padding: '12px', borderRadius: 10,
                  color: '#ffffff', fontWeight: 800, fontSize: 14,
                  cursor: 'pointer', textAlign: 'center',
                  boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)'
                }}>
                  🔁 إعادة
                </button>
                <button onClick={handleQuestionComplete} style={{
                  flex: 2,
                  background: currentQuestionIndex === testQuestions.length - 1
                    ? 'linear-gradient(45deg, #d4a017, #ffd700)'
                    : 'linear-gradient(45deg, #22c55e, #16a34a)',
                  border: 'none', padding: '12px', borderRadius: 10,
                  color: currentQuestionIndex === testQuestions.length - 1 ? '#0a1628' : '#ffffff',
                  fontWeight: 800, fontSize: 16, cursor: 'pointer', textAlign: 'center',
                  boxShadow: currentQuestionIndex === testQuestions.length - 1
                    ? '0 4px 15px rgba(255, 215, 0, 0.4)'
                    : '0 4px 15px rgba(34, 197, 94, 0.4)'
                }}>
                  {currentQuestionIndex === testQuestions.length - 1 ? '📊 إنهاء الاختبار' : '✅ تم'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
