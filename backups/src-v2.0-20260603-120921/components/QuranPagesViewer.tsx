'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { lookupQuestionPages, lookupQuestionVerses, getPageImagePath, type QuranQuestion, type QuranVerseData, type QuranVerseWithSurah } from '@/lib/quran-pages';

/* ═══════════════════════════════════════════════
   مكون عرض الصفحات المصورة للقرآن الكريم
   الصور محفوظة محلياً في public/quran-pages/
   تعمل بدون إنترنت تماماً مثل بيانات السور
   يدعم الأسئلة العابرة لسورتين مع ألوان مختلفة
   ═══════════════════════════════════════════════ */

interface QuranPagesViewerProps {
  question: QuranQuestion;
  surahCache: Record<string, QuranVerseData[]>;
  compact?: boolean;
  onClose?: () => void;
}

/** مكون صفحة واحدة - يعرض الصورة مباشرة من الملف المحلي */
function SinglePage({
  pageNum,
  compact = false,
}: {
  pageNum: number;
  compact?: boolean;
}) {
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  // المسار المباشر للصورة - ملف محلي لا يحتاج إنترنت
  const imgSrc = getPageImagePath(pageNum);

  // إعادة المحاولة عند الخطأ
  const handleRetry = useCallback(() => {
    setLoadError(false);
    setRetryKey(prev => prev + 1);
  }, []);

  // عند فشل تحميل الصورة
  const handleImageError = useCallback(() => {
    setLoadError(true);
  }, []);

  return (
    <div style={{
      background: 'rgba(8, 20, 43, 0.95)',
      border: compact ? '2px solid rgba(245, 197, 66, 0.35)' : '3px solid rgba(245, 197, 66, 0.5)',
      borderRadius: compact ? 8 : 12,
      overflow: 'hidden',
      boxShadow: compact
        ? '0 4px 16px rgba(0,0,0,0.3), 0 0 8px rgba(245, 197, 66, 0.1)'
        : '0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(245, 197, 66, 0.15)',
      position: 'relative',
    }}>
      {/* شريط رقم الصفحة */}
      <div style={{
        background: compact
          ? 'rgba(245, 197, 66, 0.1)'
          : 'linear-gradient(90deg, rgba(245, 197, 66, 0.15) 0%, rgba(245, 197, 66, 0.05) 50%, rgba(245, 197, 66, 0.15) 100%)',
        padding: compact ? '3px 8px' : '6px 12px',
        textAlign: 'center',
        borderBottom: compact ? '1px solid rgba(245, 197, 66, 0.2)' : '2px solid rgba(245, 197, 66, 0.3)',
      }}>
        <span style={{ color: '#f5c542', fontSize: compact ? 11 : 14, fontWeight: 700, fontFamily: "'Amiri', serif" }}>
          صفحة {pageNum}
        </span>
      </div>

      {/* خطأ التحميل مع زر إعادة المحاولة */}
      {loadError && (
        <div style={{
          width: '100%',
          aspectRatio: '654 / 960',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(30, 10, 10, 0.9)',
        }}>
          <div style={{ textAlign: 'center', color: '#ff6b6b' }}>
            <div style={{ fontSize: compact ? 24 : 40, marginBottom: compact ? 4 : 8 }}>⚠️</div>
            <div style={{ fontSize: compact ? 11 : 14, fontWeight: 700, marginBottom: 8 }}>خطأ في تحميل صفحة {pageNum}</div>
            <button
              onClick={handleRetry}
              style={{
                background: 'rgba(245, 197, 66, 0.2)',
                border: '1px solid rgba(245, 197, 66, 0.4)',
                color: '#ffd700',
                padding: '4px 12px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      )}

      {/* صورة الصفحة - مباشرة من الملف المحلي */}
      {!loadError && (
        <img
          key={`page-${pageNum}-${retryKey}`}
          src={imgSrc}
          alt={`صفحة ${pageNum} من المصحف الشريف`}
          loading="eager"
          decoding="sync"
          onError={handleImageError}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            minHeight: 200,
            background: 'rgba(8, 20, 43, 0.9)',
          }}
        />
      )}
    </div>
  );
}

/** مكون عرض الآيات مع ألوان مختلفة للسورتين */
function VersesDisplay({
  verses,
  startSurah,
  endSurah,
  compact = false,
}: {
  verses: QuranVerseWithSurah[];
  startSurah: string;
  endSurah?: string;
  compact?: boolean;
}) {
  const isCrossSurah = endSurah && endSurah !== startSurah;

  if (verses.length === 0) return null;

  const fontSize = compact ? 16 : 20;
  const verseNumSize = compact ? 10 : 12;

  // ألوان مختلفة لكل سورة
  const startSurahStyle = {
    color: '#ffffff',
    background: 'transparent',
  };

  const endSurahStyle = {
    color: '#67e8f9', // لون سماوي مميز للسورة التالية
    background: 'rgba(103, 232, 249, 0.08)',
  };

  return (
    <div style={{
      background: 'rgba(8, 20, 43, 0.85)',
      border: `2px solid ${isCrossSurah ? 'rgba(103, 232, 249, 0.3)' : 'rgba(245, 197, 66, 0.25)'}`,
      borderRadius: compact ? 8 : 12,
      padding: compact ? '8px 10px' : '14px 16px',
      direction: 'rtl',
      lineHeight: 2.4,
      maxHeight: compact ? '35vh' : '50vh',
      overflowY: 'auto',
    }} className="custom-scrollbar">
      {/* دليل الألوان للسؤال العابر لسورتين */}
      {isCrossSurah && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          marginBottom: 10,
          paddingBottom: 8,
          borderBottom: '1px solid rgba(103, 232, 249, 0.2)',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 12, height: 12, borderRadius: 3,
              background: '#ffffff', display: 'inline-block',
            }} />
            <span style={{ color: '#ffffff', fontSize: compact ? 11 : 13, fontWeight: 700, fontFamily: "'Amiri', serif" }}>
              سورة {startSurah}
            </span>
          </div>
          <span style={{ color: '#67e8f9', fontSize: 16 }}>←</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 12, height: 12, borderRadius: 3,
              background: '#67e8f9', display: 'inline-block',
            }} />
            <span style={{ color: '#67e8f9', fontSize: compact ? 11 : 13, fontWeight: 700, fontFamily: "'Amiri', serif" }}>
              سورة {endSurah}
            </span>
          </div>
        </div>
      )}

      {/* عرض الآيات */}
      {verses.map((verse, idx) => {
        const isEndSurahVerse = isCrossSurah && verse.surahName === endSurah;
        const style = isEndSurahVerse ? endSurahStyle : startSurahStyle;

        // إضافة فاصل بين السورتين
        const showSeparator = isCrossSurah && idx > 0 && verse.surahName !== verses[idx - 1].surahName;

        return (
          <React.Fragment key={`${verse.surahName}-${verse.numberInSurah}`}>
            {showSeparator && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                margin: '8px 0', padding: '4px 0',
              }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(103, 232, 249, 0.3)' }} />
                <span style={{
                  color: '#67e8f9', fontSize: compact ? 10 : 12,
                  fontWeight: 700, fontFamily: "'Amiri', serif",
                  whiteSpace: 'nowrap',
                }}>
                  سورة {endSurah}
                </span>
                <div style={{ flex: 1, height: 1, background: 'rgba(103, 232, 249, 0.3)' }} />
              </div>
            )}
            <span style={{
              fontSize,
              fontFamily: "'Amiri', serif",
              color: style.color,
              background: style.background,
              padding: '2px 4px',
              borderRadius: 4,
              transition: 'all 0.2s',
              display: 'inline',
            }}>
              {verse.text}
              <span style={{
                fontSize: verseNumSize,
                color: isEndSurahVerse ? '#a5f3fc' : '#f5c542',
                fontWeight: 700,
                margin: '0 2px',
                verticalAlign: 'super',
              }}>﴿{verse.numberInSurah}﴾</span>
              {' '}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function QuranPagesViewer({ question, surahCache, compact = false, onClose }: QuranPagesViewerProps) {
  // مفتاح فريد لكل سؤال
  const isCrossSurah = !!(question.endSurah && question.endSurah !== question.surah);
  const questionKey = `${question.surah}-${question.from}-${question.to}-${question.page}-${question.endSurah || ''}`;

  // البحث عن الصفحات التي يحتويها السؤال
  const pageResult = useMemo(() => lookupQuestionPages(question, surahCache), [question, surahCache, questionKey]);

  // استخراج آيات السؤال (للأسئلة العابرة لسورتين)
  const verses = useMemo(() => {
    if (!isCrossSurah) return [];
    return lookupQuestionVerses(question, surahCache);
  }, [question, surahCache, questionKey, isCrossSurah]);

  // الوضع المدمج
  if (compact) {
    return (
      <div style={{ width: '100%' }} key={questionKey}>
        <div style={{
          background: 'rgba(8, 20, 43, 0.72)',
          border: `1px solid ${isCrossSurah ? 'rgba(103, 232, 249, 0.3)' : 'rgba(245, 197, 66, 0.2)'}`,
          borderRadius: 8,
          padding: '6px 10px',
          marginBottom: 6,
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h3 style={{ color: isCrossSurah ? '#67e8f9' : '#fff5cc', fontSize: 13, marginBottom: 2, fontFamily: "'Amiri', serif" }}>
              سورة {question.surah}{isCrossSurah ? ' ← ' + question.endSurah : ''}
            </h3>
            <p style={{ color: '#ffffff', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-block', background: 'rgba(245, 197, 66, 0.15)', color: '#ffd700', padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>من {question.from}{isCrossSurah ? ' ' + question.surah : ''}</span>
              <span style={{ display: 'inline-block', background: isCrossSurah ? 'rgba(103, 232, 249, 0.15)' : 'rgba(245, 197, 66, 0.15)', color: isCrossSurah ? '#67e8f9' : '#ffd700', padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>إلى {question.to}{isCrossSurah ? ' ' + question.endSurah : ''}</span>
              <span style={{ color: '#f5c542', fontWeight: 700, fontSize: 10 }}>صفحة {pageResult.pages.join('-')}</span>
            </p>
          </div>
          {onClose && (
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} style={{ background: 'rgba(255, 107, 107, 0.2)', border: '1px solid rgba(255, 107, 107, 0.4)', color: '#ff6b6b', width: 28, height: 28, borderRadius: 6, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} title="إغلاق">✕</button>
          )}
        </div>

        {/* عرض الآيات العابرة لسورتين بلون مختلف */}
        {isCrossSurah && verses.length > 0 && (
          <div style={{ marginBottom: 6 }}>
            <VersesDisplay
              verses={verses}
              startSurah={question.surah}
              endSurah={question.endSurah}
              compact={true}
            />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 4, flexDirection: pageResult.isMultiPage ? 'row' : 'column', flexWrap: 'wrap' }}>
          {pageResult.pages.map((pageNum) => (
            <div key={pageNum} style={{ width: pageResult.isMultiPage ? 'calc(50% - 2px)' : '100%' }}>
              <SinglePage pageNum={pageNum} compact={true} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // الوضع العادي (كامل)
  return (
    <div style={{ width: '100%' }} key={questionKey}>
      <div style={{ background: 'rgba(8, 20, 43, 0.72)', border: `2px solid ${isCrossSurah ? 'rgba(103, 232, 249, 0.35)' : 'rgba(245, 197, 66, 0.25)'}`, borderRadius: 12, padding: '10px 16px', marginBottom: 8, textAlign: 'center' }}>
        <h3 style={{ color: isCrossSurah ? '#67e8f9' : '#fff5cc', fontSize: 16, marginBottom: 4, fontFamily: "'Amiri', serif" }}>سورة {question.surah}{isCrossSurah ? ' ← ' + question.endSurah : ''}</h3>
        <p style={{ color: '#ffffff', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-block', background: 'rgba(245, 197, 66, 0.2)', color: '#ffd700', padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>من {question.from}{isCrossSurah ? ' ' + question.surah : ''}</span>
          <span style={{ display: 'inline-block', background: isCrossSurah ? 'rgba(103, 232, 249, 0.2)' : 'rgba(245, 197, 66, 0.2)', color: isCrossSurah ? '#67e8f9' : '#ffd700', padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>إلى {question.to}{isCrossSurah ? ' ' + question.endSurah : ''}</span>
          <span style={{ color: '#f5c542', fontWeight: 700 }}>صفحة {pageResult.pages.join('-')}</span>
        </p>
      </div>

      {/* عرض الآيات العابرة لسورتين بلون مختلف */}
      {isCrossSurah && verses.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <VersesDisplay
            verses={verses}
            startSurah={question.surah}
            endSurah={question.endSurah}
            compact={false}
          />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 6, marginBottom: 8, flexDirection: pageResult.isMultiPage ? 'row' : 'column', flexWrap: 'wrap' }}>
        {pageResult.pages.map((pageNum) => (
          <div key={pageNum} style={{ width: pageResult.isMultiPage ? 'calc(50% - 3px)' : '100%' }}>
            <SinglePage pageNum={pageNum} compact={false} />
          </div>
        ))}
      </div>
    </div>
  );
}
