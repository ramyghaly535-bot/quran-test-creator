'use client';

import React from 'react';
import { useQuranStore } from '@/lib/store';
import { COURSES_DATA, getGenerationRule, getNextSurah } from '@/lib/quran-constants';
import QuranPagesViewer from '@/components/QuranPagesViewer';
import PagePreviewModal from '@/components/PagePreviewModal';

export default function HomeView() {
  const {
    selectedCourse, courseSurahs, selectedSurah, surahData, loading,
    selection, questions, generating, surahCache, quranDataLoaded,
    flashCourse, flashSurah, previewQuestion, showPagePreview,
    verseFontSize,
    handleCourseSelect, handleSurahSelect, handleVerseClick,
    handleCrossSurahEnd,
    deleteQuestion, clearAllQuestions, generateFinalTest,
    handleQuestionPreview, closePagePreview, cancelSelection,
    setVerseFontSize, navigateTo, showToast,
  } = useQuranStore();

  const courseQuestions = questions.filter(q => q.courseName === selectedCourse?.name);

  // تحديد السورة التالية عند التحديد النشط
  const startSurahName = selection.active && selection.startSurah ? selection.startSurah : selectedSurah;
  const nextSurahName = selection.active && startSurahName ? getNextSurah(startSurahName) : null;
  const nextSurahData = nextSurahName ? (surahCache[nextSurahName] as unknown as typeof surahData || []) : [];
  const isNextSurahInCourse = nextSurahName ? courseSurahs.includes(nextSurahName) : false;
  const canShowNextSurah = selection.active && nextSurahName && isNextSurahInCourse && nextSurahData.length > 0;

  return (
    <div className="pattern-islamic pattern-islamic-bg" dir="rtl" style={{ overflowX: 'hidden' }}>
      <div className="relative z-10 flex-1 flex flex-col" style={{ minHeight: '100vh' }}>
        <header className="text-center pt-4 pb-3 px-4">
          <div className="mb-3">
            <div className="animate-float" style={{
              width: 80, height: 80, margin: '0 auto',
              background: 'linear-gradient(135deg, #f5c542, #ffd700)',
              borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 40
            }}>📖</div>
          </div>
          <h1 className="text-2xl md:text-4xl font-black mb-3 title-golden text-gradient text-elegant" style={{ fontFamily: "'Amiri', 'Tajawal', 'Cairo', serif" }}>
            منشئ اختبارات القرآن الكريم
          </h1>
          <p className="text-glow-gold text-sm md:text-lg text-elegant font-bold">
            اختر الدورة، أضف الأسئلة يدوياً، ثم اضغط توليد
          </p>
          {!quranDataLoaded && (
            <div style={{
              marginTop: 8,
              background: 'rgba(245, 197, 66, 0.15)',
              border: '1px solid rgba(245, 197, 66, 0.3)',
              borderRadius: 8, padding: '6px 16px', display: 'inline-block'
            }}>
              <span style={{ color: '#f5c542', fontSize: 14 }}>⏳ جاري تحميل بيانات القرآن...</span>
            </div>
          )}
          {quranDataLoaded && (
            <div style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <div style={{
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: 8, padding: '6px 16px', display: 'inline-block'
              }}>
                <span style={{ color: '#22c55e', fontSize: 14 }}>✅ تم تحميل جميع السور ({Object.keys(surahCache).length} سورة)</span>
              </div>
              <div style={{
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: 8, padding: '6px 16px', display: 'inline-block'
              }}>
                <span style={{ color: '#22c55e', fontSize: 14 }}>📖 صفحات المصحف محفوظة محلياً</span>
              </div>
            </div>
          )}
        </header>

        <main className="flex-1 max-w-6xl mx-auto w-full px-4 pb-6">
          {/* اختيار الدورة */}
          <div className="card-glass mb-4">
            <div className="border-b p-4" style={{ background: 'rgba(8, 20, 43, 0.95)', borderColor: 'rgba(245, 197, 66, 0.25)' }}>
              <h2 className="text-2xl font-black flex items-center gap-3 text-glow-white-bright text-elegant" style={{ fontFamily: "'Amiri', 'Tajawal', 'Cairo', serif" }}>
                <span className="text-3xl">📚</span>
                <span className="text-gradient title-golden">اختر الدورة</span>
              </h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {COURSES_DATA.map((course) => (
                  <button
                    key={course.name}
                    onClick={() => handleCourseSelect(course)}
                    className={`${selectedCourse?.name === course.name ? 'btn-crimson-active' : 'btn-crimson-inactive'} ${flashCourse === course.name ? 'btn-gold-flash' : ''}`}
                    style={selectedCourse?.name === course.name ? { transform: 'scale(1.05)' } : {}}
                  >
                    <span className="text-elegant" style={{ fontFamily: "'Amiri', 'Tajawal', 'Cairo', serif" }}>{course.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* زر عرض جميع النتائج */}
          <div className="flex justify-center mb-3">
            <button
              onClick={() => navigateTo('allResults')}
              style={{
                background: 'linear-gradient(45deg, #1f5eff, #245dff)',
                border: 'none', padding: '12px 24px', borderRadius: 24,
                fontSize: 16, fontWeight: 700, color: '#ffffff', cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(37, 99, 255, 0.4)'
              }}
            >
              📜 عرض جميع النتائج
            </button>
          </div>

          {/* رصيد المصمم */}
          <div style={{ textAlign: 'center', padding: '20px 0 10px 0', marginTop: 8 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(8, 20, 43, 0.5)',
              border: '1px solid rgba(255, 215, 0, 0.2)',
              borderRadius: 16, padding: '12px 28px'
            }}>
              <span className="designer-credit-sparkle" style={{ fontSize: 20 }}>✦</span>
              <span className="designer-credit" style={{ fontFamily: "'Amiri', 'Tajawal', 'Cairo', serif", fontSize: 22, direction: 'rtl' }}>أبوعبدالملك AR</span>
              <span className="designer-credit-sparkle" style={{ fontSize: 20, animationDelay: '0.5s' }}>✦</span>
            </div>
          </div>

          {/* اختيار السورة وعرض الآيات */}
          {selectedCourse && (
            <div className="grid lg:grid-cols-3 gap-4">
              {/* قائمة السور */}
              <div className="card-glass">
                <div className="border-b p-3" style={{ background: 'rgba(8, 20, 43, 0.95)', borderColor: 'rgba(245, 197, 66, 0.25)' }}>
                  <h2 className="text-xl font-black flex items-center gap-2 text-glow-white-bright text-elegant" style={{ fontFamily: "'Amiri', 'Tajawal', 'Cairo', serif" }}>
                    <span className="text-2xl">📖</span>
                    <span className="text-gradient">اختر السورة</span>
                  </h2>
                  <p className="text-xs font-medium text-glow-gold" style={{ color: '#fff5cc' }}>
                    نطاق الصفحات: {selectedCourse.pageStart} - {selectedCourse.pageEnd}
                  </p>
                </div>
                <div className="p-3">
                  <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto custom-scrollbar">
                    {courseSurahs.map((surah) => {
                      const isNextSurah = selection.active && surah === nextSurahName;
                      const isStartSurah = selection.active && surah === startSurahName;
                      return (
                        <button
                          key={surah}
                          onClick={() => handleSurahSelect(surah)}
                          className={`${selectedSurah === surah ? 'btn-crimson-active' : 'btn-crimson-inactive'} ${flashSurah === surah ? 'btn-gold-flash' : ''}`}
                          style={{
                            ...(selectedSurah === surah ? { transform: 'scale(1.05)' } : {}),
                            ...(isNextSurah ? {
                              background: 'rgba(103, 232, 249, 0.2)',
                              border: '2px solid rgba(103, 232, 249, 0.6)',
                              color: '#67e8f9',
                              boxShadow: '0 0 12px rgba(103, 232, 249, 0.3)',
                            } : {}),
                            ...(isStartSurah && selectedSurah !== surah ? {
                              background: 'rgba(245, 197, 66, 0.2)',
                              border: '2px solid rgba(245, 197, 66, 0.5)',
                              color: '#ffd700',
                            } : {}),
                            padding: 10, fontSize: 12, height: 40, fontWeight: 700,
                            position: 'relative',
                          }}
                        >
                          {surah}
                          {isNextSurah && (
                            <span style={{
                              position: 'absolute', top: -2, left: -2,
                              background: '#67e8f9', color: '#0a1628',
                              fontSize: 8, fontWeight: 900, padding: '1px 4px',
                              borderRadius: 4, lineHeight: '12px',
                            }}>التالية</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* عرض الآيات */}
              <div className="lg:col-span-2 space-y-4">
                {selectedSurah && (
                  <div className="card-glass">
                    <div className="border-b p-4 flex items-center justify-between flex-wrap gap-2" style={{ background: 'rgba(10, 22, 40, 0.95)', borderColor: 'rgba(245, 197, 66, 0.25)' }}>
                      <div className="flex-1">
                        <h2 className="text-xl font-black mb-1 text-glow-white-bright text-elegant" style={{ fontFamily: "'Amiri', 'Tajawal', 'Cairo', serif" }}>
                          سورة {selectedSurah}
                        </h2>
                        <p className="text-xs font-medium text-glow-gold" style={{ color: '#fff5cc' }}>
                          نطاق الدورة: صفحة {selectedCourse.pageStart} - {selectedCourse.pageEnd}
                          {surahData.length > 0 && <span> | عدد الآيات: {surahData.length}</span>}
                        </p>
                      </div>
                      <button onClick={cancelSelection} style={{
                        background: 'rgba(8, 20, 43, 0.72)',
                        border: '2px solid rgba(245, 197, 66, 0.25)',
                        color: '#fff5cc', padding: '8px 16px', borderRadius: 8, cursor: 'pointer'
                      }}>
                        إلغاء التحديد
                      </button>
                    </div>
                    {selection.active && selection.startIdx !== null && (
                      <div style={{
                        background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.2), rgba(245, 197, 66, 0.15))',
                        border: '1px solid rgba(245, 197, 66, 0.4)',
                        borderRadius: 8, padding: '8px 16px', margin: '8px 16px',
                        display: 'flex', alignItems: 'center', gap: 8,
                        fontSize: 13, fontWeight: 700, color: '#ffd700',
                        flexWrap: 'wrap',
                      }}>
                        <span>📍</span>
                        <span>تم تحديد البداية في سورة {selection.startSurah || selectedSurah}</span>
                        <span style={{ color: '#67e8f9' }}>| اختر النهاية هنا</span>
                        {canShowNextSurah && (
                          <span style={{ color: '#67e8f9' }}>أو من آيات سورة {nextSurahName} أدناه</span>
                        )}
                      </div>
                    )}
                    <div className="p-4">
                      {loading ? (
                        <div className="text-center py-8 text-glow-gold text-elegant">
                          <div style={{ fontSize: 40, marginBottom: 12 }}>📖</div>
                          <div>جاري تحميل الآيات...</div>
                        </div>
                      ) : (
                        <>
                          {/* تحكم بحجم الخط */}
                          <div className="flex items-center justify-between mb-3 p-3" style={{
                            background: 'rgba(8, 20, 43, 0.72)',
                            border: '2px solid rgba(245, 197, 66, 0.25)',
                            borderRadius: 12
                          }}>
                            <span className="font-black text-sm flex items-center gap-2 text-glow-gold text-elegant">
                              <span className="text-lg">📏</span>حجم الخط
                            </span>
                            <div className="flex items-center gap-2">
                              <button onClick={() => setVerseFontSize(Math.max(14, verseFontSize - 2))} style={{
                                background: 'rgba(8, 20, 43, 0.72)',
                                border: '2px solid rgba(245, 197, 66, 0.25)',
                                color: '#fff5cc', width: 32, height: 32, borderRadius: 8,
                                cursor: 'pointer', fontWeight: 'bold'
                              }}>-</button>
                              <span style={{ fontWeight: 'bold', fontSize: 18, color: '#fff5cc', padding: '8px 16px' }}>
                                {verseFontSize}
                              </span>
                              <button onClick={() => setVerseFontSize(Math.min(36, verseFontSize + 2))} style={{
                                background: 'rgba(8, 20, 43, 0.72)',
                                border: '2px solid rgba(245, 197, 66, 0.25)',
                                color: '#fff5cc', width: 32, height: 32, borderRadius: 8,
                                cursor: 'pointer', fontWeight: 'bold'
                              }}>+</button>
                            </div>
                          </div>

                          {/* عرض الآيات */}
                          {surahData.length > 0 ? (
                            <div style={{
                              background: 'rgba(8, 20, 43, 0.72)',
                              border: '2px solid rgba(245, 197, 66, 0.25)',
                              borderRadius: 12, padding: '16px',
                              maxHeight: '60vh', overflowY: 'auto',
                              direction: 'rtl', lineHeight: 2.2
                            }} className="custom-scrollbar">
                              {surahData.map((verse, idx) => {
                                const isSelected = selection.active && selection.startIdx !== null &&
                                  idx >= Math.min(selection.startIdx, selection.endIdx ?? selection.startIdx) &&
                                  idx <= Math.max(selection.startIdx, selection.endIdx ?? selection.startIdx);
                                const isStart = selection.startIdx === idx;
                                return (
                                  <span
                                    key={idx}
                                    onClick={() => handleVerseClick(idx)}
                                    style={{
                                      cursor: 'pointer',
                                      fontSize: verseFontSize,
                                      fontFamily: "'Amiri', serif",
                                      background: isSelected
                                        ? (isStart ? 'rgba(245, 197, 66, 0.4)' : 'rgba(245, 197, 66, 0.2)')
                                        : 'transparent',
                                      color: isSelected ? '#ffd700' : '#ffffff',
                                      padding: '2px 4px',
                                      borderRadius: 4,
                                      transition: 'all 0.2s',
                                      borderBottom: isSelected ? '2px solid #ffd700' : 'none',
                                      display: 'inline',
                                    }}
                                  >
                                    {verse.text}
                                    <span style={{
                                      fontSize: Math.max(12, verseFontSize - 8),
                                      color: '#f5c542',
                                      fontWeight: 700,
                                      margin: '0 2px',
                                      verticalAlign: 'super'
                                    }}>﴿{verse.numberInSurah}﴾</span>
                                    {' '}
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-glow-gold text-elegant">
                              <div style={{ fontSize: 40, marginBottom: 12 }}>📖</div>
                              <div>{quranDataLoaded ? 'لا توجد بيانات لهذه السورة' : 'جاري تحميل بيانات القرآن...'}</div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* عرض آيات السورة التالية عند التحديد النشط (سؤال عابر لسورتين) */}
                    {canShowNextSurah && (
                      <div style={{
                        background: 'rgba(8, 20, 43, 0.85)',
                        border: '2px solid rgba(103, 232, 249, 0.35)',
                        borderRadius: 12, padding: '12px 16px',
                        marginTop: 8,
                      }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          marginBottom: 10, flexWrap: 'wrap', gap: 8,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 18 }}>🔗</span>
                            <h3 style={{
                              color: '#67e8f9', fontSize: 16, fontWeight: 800,
                              fontFamily: "'Amiri', serif",
                            }}>
                              سورة {nextSurahName} (السورة التالية)
                            </h3>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{
                              width: 12, height: 12, borderRadius: 3,
                              background: '#67e8f9', display: 'inline-block',
                            }} />
                            <span style={{ color: '#67e8f9', fontSize: 11, fontWeight: 700 }}>آيات السورة التالية</span>
                          </div>
                        </div>
                        <div style={{
                          background: 'rgba(103, 232, 249, 0.06)',
                          border: '1px solid rgba(103, 232, 249, 0.2)',
                          borderRadius: 8, padding: '12px',
                          maxHeight: '35vh', overflowY: 'auto',
                          direction: 'rtl', lineHeight: 2.2,
                        }} className="custom-scrollbar">
                          {nextSurahData.map((verse, idx) => (
                            <span
                              key={idx}
                              onClick={() => handleCrossSurahEnd(nextSurahName!, idx, nextSurahData)}
                              style={{
                                cursor: 'pointer',
                                fontSize: verseFontSize,
                                fontFamily: "'Amiri', serif",
                                background: 'rgba(103, 232, 249, 0.08)',
                                color: '#67e8f9',
                                padding: '2px 4px',
                                borderRadius: 4,
                                transition: 'all 0.2s',
                                display: 'inline',
                              }}
                              onMouseEnter={(e) => {
                                (e.target as HTMLElement).style.background = 'rgba(103, 232, 249, 0.25)';
                                (e.target as HTMLElement).style.borderBottom = '2px solid #67e8f9';
                              }}
                              onMouseLeave={(e) => {
                                (e.target as HTMLElement).style.background = 'rgba(103, 232, 249, 0.08)';
                                (e.target as HTMLElement).style.borderBottom = 'none';
                              }}
                            >
                              {verse.text}
                              <span style={{
                                fontSize: Math.max(12, verseFontSize - 8),
                                color: '#a5f3fc',
                                fontWeight: 700,
                                margin: '0 2px',
                                verticalAlign: 'super'
                              }}>﴿{verse.numberInSurah}﴾</span>
                              {' '}
                            </span>
                          ))}
                        </div>
                        <div style={{
                          marginTop: 8, textAlign: 'center',
                          color: '#67e8f9', fontSize: 11, fontWeight: 700, opacity: 0.8,
                        }}>
                          اضغط على أي آية لتحديد نهاية السؤال
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* قائمة الأسئلة */}
                {questions.length > 0 && (
                  <div className="card-glass">
                    <div className="border-b p-4 flex items-center justify-between flex-wrap gap-2" style={{ background: 'rgba(8, 20, 43, 0.95)', borderColor: 'rgba(245, 197, 66, 0.25)' }}>
                      <div>
                        <h2 className="text-xl font-black flex items-center gap-2 text-glow-white-bright text-elegant" style={{ fontFamily: "'Amiri', 'Tajawal', 'Cairo', serif" }}>
                          <span className="text-2xl">📝</span>
                          <span className="text-gradient">الأسئلة المضافة</span>
                          <span className="badge">{questions.length}</span>
                        </h2>
                        {selectedCourse && (
                          <p className="text-xs font-medium text-glow-gold mt-1">
                            أسئلة الدورة: {courseQuestions.length} / {selectedCourse.questionCount} مطلوبة
                            <span style={{ margin: '0 8px' }}>|</span>
                            {getGenerationRule(selectedCourse)}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={clearAllQuestions} style={{
                          background: 'rgba(255, 107, 107, 0.15)',
                          border: '2px solid rgba(255, 107, 107, 0.3)',
                          color: '#ff6b6b', padding: '8px 16px', borderRadius: 8,
                          cursor: 'pointer', fontWeight: 700, fontSize: 13
                        }}>
                          🗑️ مسح الكل
                        </button>
                        {selectedCourse && courseQuestions.length >= selectedCourse.questionCount && (
                          <button
                            onClick={generateFinalTest}
                            disabled={generating}
                            style={{
                              background: generating ? 'rgba(245, 197, 66, 0.3)' : 'linear-gradient(45deg, #d4a017, #ffd700)',
                              border: 'none', padding: '8px 20px', borderRadius: 8,
                              color: generating ? '#fff5cc' : '#0a1628',
                              fontWeight: 800, fontSize: 14, cursor: generating ? 'wait' : 'pointer',
                              boxShadow: generating ? 'none' : '0 4px 15px rgba(255, 215, 0, 0.4)',
                              minWidth: 140
                            }}
                          >
                            {generating ? '⏳ جاري التوليد...' : '✨ توليد الاختبار'}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="p-4 max-h-96 overflow-y-auto custom-scrollbar">
                      {questions.map((q, idx) => (
                        <div key={idx} style={{
                          background: 'rgba(8, 20, 43, 0.72)',
                          border: '1px solid rgba(245, 197, 66, 0.2)',
                          borderRadius: 10, padding: '10px 14px',
                          marginBottom: 8, display: 'flex',
                          alignItems: 'center', justifyContent: 'space-between',
                          gap: 8, flexWrap: 'wrap'
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ color: '#fff5cc', fontSize: 14, fontWeight: 700, fontFamily: "'Amiri', serif" }}>
                              سورة {q.surah}{q.endSurah && q.endSurah !== q.surah ? ' ← ' + q.endSurah : ''}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                              <span style={{ display: 'inline-block', background: 'rgba(245, 197, 66, 0.15)', color: '#ffd700', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>من {q.from}{q.endSurah && q.endSurah !== q.surah ? ' ' + q.surah : ''}</span>
                              <span style={{ display: 'inline-block', background: 'rgba(245, 197, 66, 0.15)', color: '#ffd700', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>إلى {q.to}{q.endSurah && q.endSurah !== q.surah ? ' ' + q.endSurah : ''}</span>
                              <span style={{ display: 'inline-block', background: 'rgba(245, 197, 66, 0.15)', color: '#ffd700', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>صفحة {q.page}</span>
                              <span style={{ display: 'inline-block', background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>جزء {q.juz}</span>
                              <span style={{ display: 'inline-block', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{q.courseName}</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                            <button onClick={() => handleQuestionPreview(q)} style={{
                              background: 'rgba(245, 197, 66, 0.15)',
                              border: '1px solid rgba(245, 197, 66, 0.3)',
                              color: '#ffd700', padding: '6px 12px',
                              borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 700
                            }}>
                              📄 معاينة الصفحة
                            </button>
                            <button onClick={() => deleteQuestion(q)} style={{
                              background: 'rgba(255, 107, 107, 0.15)',
                              border: '1px solid rgba(255, 107, 107, 0.3)',
                              color: '#ff6b6b', padding: '6px 12px',
                              borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 700
                            }}>
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* نافذة معاينة الصفحة */}
      <PagePreviewModal
        question={previewQuestion}
        surahCache={surahCache}
        isOpen={showPagePreview}
        onClose={closePagePreview}
      />
    </div>
  );
}
