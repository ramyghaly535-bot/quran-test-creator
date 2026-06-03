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
  const isCrossSurah = !!(currentQ.endSurah && currentQ.endSurah !== currentQ.surah);
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
            borderRadius: 12, padding: '10px 14px',
            marginBottom: 12, display: 'flex',
            justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: 6
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#f5c542', fontWeight: 700, fontSize: 13 }}>
                السؤال {currentQuestionIndex + 1} من {testQuestions.length}
              </span>
              <div style={{ width: 100, height: 6, background: 'rgba(245, 197, 66, 0.2)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  width: ((currentQuestionIndex + 1) / testQuestions.length * 100) + '%',
                  height: '100%', background: 'linear-gradient(90deg, #d4a017, #ffd700)',
                  borderRadius: 4, transition: 'width 0.3s'
                }} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: currentScore >= 75 ? '#22c55e' : '#ff6b6b', fontWeight: 800, fontSize: 14 }}>
                الدرجة: {currentScore}
              </span>
              <span style={{ color: '#ff6b6b', fontWeight: 700, fontSize: 12 }}>
                خصم: {totalDeductions}
              </span>
            </div>
          </div>

          {/* معلومات السؤال */}
          <div style={{
            background: 'rgba(8, 20, 43, 0.72)',
            border: `2px solid ${isCrossSurah ? 'rgba(103, 232, 249, 0.35)' : 'rgba(245, 197, 66, 0.25)'}`,
            borderRadius: 12, padding: '10px 14px',
            marginBottom: 10, textAlign: 'center'
          }}>
            <h3 style={{ color: isCrossSurah ? '#67e8f9' : '#fff5cc', fontSize: 16, fontWeight: 700, fontFamily: "'Amiri', serif", marginBottom: 4 }}>
              سورة {currentQ.surah}{isCrossSurah ? ' ← ' + currentQ.endSurah : ''}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-block', background: 'rgba(245, 197, 66, 0.2)', color: '#ffd700', padding: '1px 8px', borderRadius: 5, fontSize: 12, fontWeight: 700 }}>من {currentQ.from}{isCrossSurah ? ' ' + currentQ.surah : ''}</span>
              <span style={{ display: 'inline-block', background: isCrossSurah ? 'rgba(103, 232, 249, 0.2)' : 'rgba(245, 197, 66, 0.2)', color: isCrossSurah ? '#67e8f9' : '#ffd700', padding: '1px 8px', borderRadius: 5, fontSize: 12, fontWeight: 700 }}>إلى {currentQ.to}{isCrossSurah ? ' ' + currentQ.endSurah : ''}</span>
              <span style={{ display: 'inline-block', background: 'rgba(245, 197, 66, 0.2)', color: '#ffd700', padding: '1px 8px', borderRadius: 5, fontSize: 12, fontWeight: 700 }}>صفحة {currentQ.page}</span>
              <span style={{ display: 'inline-block', background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', padding: '1px 8px', borderRadius: 5, fontSize: 12, fontWeight: 700 }}>جزء {currentQ.juz}</span>
            </div>
            {isCrossSurah && (
              <div style={{
                marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 4,
                background: 'rgba(103, 232, 249, 0.12)',
                border: '1px solid rgba(103, 232, 249, 0.3)',
                borderRadius: 16, padding: '2px 10px',
              }}>
                <span style={{ fontSize: 12 }}>🔗</span>
                <span style={{ color: '#67e8f9', fontSize: 11, fontWeight: 700, fontFamily: "'Amiri', serif" }}>
                  سؤال عابر لسورتين
                </span>
              </div>
            )}
          </div>

          {/* عرض صورة الصفحة والآيات */}
          <div style={{ marginBottom: 12 }}>
            <QuranPagesViewer
              question={currentQ}
              surahCache={surahCache as Record<string, QuranVerseData[]>}
              compact={true}
            />
          </div>

          {/* أزرار الأخطاء - مصغرة بألوان جديدة */}
          <div style={{
            background: 'rgba(8, 20, 43, 0.85)',
            border: '1px solid rgba(245, 197, 66, 0.15)',
            borderRadius: 10, padding: '8px 10px',
            marginBottom: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
              <span style={{ fontSize: 13 }}>🔴</span>
              <span style={{ color: '#fff5cc', fontSize: 12, fontWeight: 700, fontFamily: "'Amiri', serif" }}>تسجيل الأخطاء</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {/* خطأ صغير */}
              <button onClick={() => handleErrorClick('small', 0.5)} style={{
                background: 'rgba(34, 197, 94, 0.12)',
                border: '1.5px solid rgba(34, 197, 94, 0.4)',
                color: '#4ade80', padding: '6px 4px', borderRadius: 8,
                cursor: 'pointer', fontWeight: 700, fontSize: 11, textAlign: 'center',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              }}>
                <span style={{ fontSize: 15 }}>⚠️</span>
                <span>صغير</span>
                <span style={{ fontSize: 9, opacity: 0.7 }}>-0.5</span>
                {errors.small > 0 && <span style={{ fontSize: 10, color: '#4ade80', fontWeight: 900 }}>×{errors.small}</span>}
              </button>
              {/* خطأ متوسط */}
              <button onClick={() => handleErrorClick('medium', 1)} style={{
                background: 'rgba(251, 146, 60, 0.12)',
                border: '1.5px solid rgba(251, 146, 60, 0.4)',
                color: '#fb923c', padding: '6px 4px', borderRadius: 8,
                cursor: 'pointer', fontWeight: 700, fontSize: 11, textAlign: 'center',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              }}>
                <span style={{ fontSize: 15 }}>❌</span>
                <span>متوسط</span>
                <span style={{ fontSize: 9, opacity: 0.7 }}>-1</span>
                {errors.medium > 0 && <span style={{ fontSize: 10, color: '#fb923c', fontWeight: 900 }}>×{errors.medium}</span>}
              </button>
              {/* تغيير موضع */}
              <button onClick={() => handleErrorClick('position', 3)} disabled={positionChangedQuestions.has(currentQuestionIndex)} style={{
                background: positionChangedQuestions.has(currentQuestionIndex)
                  ? 'rgba(100, 100, 100, 0.1)' : 'rgba(168, 85, 247, 0.12)',
                border: positionChangedQuestions.has(currentQuestionIndex)
                  ? '1.5px solid rgba(100, 100, 100, 0.3)' : '1.5px solid rgba(168, 85, 247, 0.4)',
                color: positionChangedQuestions.has(currentQuestionIndex) ? '#666' : '#c084fc',
                padding: '6px 4px', borderRadius: 8,
                cursor: positionChangedQuestions.has(currentQuestionIndex) ? 'not-allowed' : 'pointer',
                fontWeight: 700, fontSize: 11, textAlign: 'center', opacity: positionChangedQuestions.has(currentQuestionIndex) ? 0.5 : 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              }}>
                <span style={{ fontSize: 15 }}>🔄</span>
                <span>موضع</span>
                <span style={{ fontSize: 9, opacity: 0.7 }}>-3</span>
                <span style={{ fontSize: 9, color: positionChangedQuestions.has(currentQuestionIndex) ? '#666' : '#c084fc' }}>
                  {positionChangedQuestions.has(currentQuestionIndex) ? 'مستخدم' : 'مرة واحدة'}
                </span>
              </button>
              {/* ضعف تلاوة */}
              <button onClick={() => setShowWeaknessDialog(true)} style={{
                background: 'rgba(244, 63, 94, 0.12)',
                border: '1.5px solid rgba(244, 63, 94, 0.4)',
                color: '#fb7185', padding: '6px 4px', borderRadius: 8,
                cursor: 'pointer', fontWeight: 700, fontSize: 11, textAlign: 'center',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              }}>
                <span style={{ fontSize: 15 }}>📉</span>
                <span>ضعف</span>
                <span style={{ fontSize: 9, opacity: 0.7 }}>1-5</span>
                {errors.weakness > 0 && <span style={{ fontSize: 10, color: '#fb7185', fontWeight: 900 }}>-{errors.weakness}</span>}
              </button>
            </div>

            {/* حوار ضعف التلاوة */}
            {showWeaknessDialog && (
              <div style={{
                background: 'rgba(8, 20, 43, 0.95)',
                border: '1.5px solid rgba(244, 63, 94, 0.4)',
                borderRadius: 8, padding: '10px',
                marginTop: 8, textAlign: 'center'
              }}>
                <p style={{ color: '#fb7185', fontWeight: 700, marginBottom: 8, fontSize: 12 }}>
                  اختر درجة ضعف التلاوة:
                </p>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {[1, 2, 3, 4, 5].map(val => (
                    <button key={val} onClick={() => handleWeaknessClick(val)} style={{
                      background: 'rgba(244, 63, 94, 0.15)',
                      border: '1.5px solid rgba(244, 63, 94, 0.4)',
                      color: '#fb7185', padding: '5px 12px',
                      borderRadius: 6, cursor: 'pointer',
                      fontWeight: 700, fontSize: 14, minWidth: 36
                    }}>
                      {val}
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowWeaknessDialog(false)} style={{
                  marginTop: 8, background: 'rgba(8, 20, 43, 0.72)',
                  border: '1px solid rgba(245, 197, 66, 0.2)',
                  color: '#fff5cc', padding: '4px 14px',
                  borderRadius: 6, cursor: 'pointer', fontSize: 11
                }}>
                  إلغاء
                </button>
              </div>
            )}
          </div>

          {/* أزرار التنقل والإتمام */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'stretch' }}>
            {/* زر السابق */}
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              style={{
                flex: 1,
                background: currentQuestionIndex === 0
                  ? 'rgba(8, 20, 43, 0.4)'
                  : 'linear-gradient(180deg, rgba(59, 130, 246, 0.25), rgba(59, 130, 246, 0.12))',
                border: currentQuestionIndex === 0
                  ? '1.5px solid rgba(59, 130, 246, 0.15)'
                  : '1.5px solid rgba(59, 130, 246, 0.5)',
                color: currentQuestionIndex === 0 ? '#555' : '#60a5fa',
                padding: '10px 8px', borderRadius: 8,
                cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                fontWeight: 700, fontSize: 13, textAlign: 'center',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              }}
            >
              <span style={{ fontSize: 16 }}>→</span>
              السابق
            </button>

            {/* زر إعادة */}
            <button onClick={retryTest} style={{
              flex: 1,
              background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.08))',
              border: '1.5px solid rgba(245, 158, 11, 0.45)',
              color: '#fbbf24', padding: '10px 8px', borderRadius: 8,
              cursor: 'pointer', fontWeight: 700, fontSize: 13, textAlign: 'center',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}>
              <span style={{ fontSize: 14 }}>🔁</span>
              إعادة
            </button>

            {/* زر تم / إنهاء */}
            <button onClick={handleQuestionComplete} style={{
              flex: 2,
              background: currentQuestionIndex === testQuestions.length - 1
                ? 'linear-gradient(45deg, #d4a017, #ffd700)'
                : 'linear-gradient(180deg, rgba(34, 197, 94, 0.25), rgba(34, 197, 94, 0.1))',
              border: currentQuestionIndex === testQuestions.length - 1
                ? 'none'
                : '1.5px solid rgba(34, 197, 94, 0.5)',
              color: currentQuestionIndex === testQuestions.length - 1 ? '#0a1628' : '#4ade80',
              padding: '10px 8px', borderRadius: 8,
              fontWeight: 800, fontSize: 14, cursor: 'pointer', textAlign: 'center',
              boxShadow: currentQuestionIndex === testQuestions.length - 1
                ? '0 4px 15px rgba(255, 215, 0, 0.4)'
                : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}>
              {currentQuestionIndex === testQuestions.length - 1 ? (
                <>📊 إنهاء الاختبار</>
              ) : (
                <><span style={{ fontSize: 14 }}>✅</span> تم</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
