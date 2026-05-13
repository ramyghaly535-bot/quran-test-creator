'use client';

import React, { useState, useEffect } from 'react';
import { lookupQuestionPages, preloadQuranPages, type QuranQuestion, type QuranVerseData } from '@/lib/quran-pages';

/* ═══════════════════════════════════════════════
   مكون عرض الصفحات المصورة للقرآن الكريم
   ═══════════════════════════════════════════════ */

interface QuranPagesViewerProps {
  /** بيانات السؤال */
  question: QuranQuestion;
  /** ذاكرة التخزين المؤقت لبيانات السور */
  surahCache: Record<string, QuranVerseData[]>;
  /** وضع مدمج - عرض مصغر */
  compact?: boolean;
  /** دالة الإغلاق - للوضع المنبثق */
  onClose?: () => void;
}

/** مكون صفحة واحدة */
function SinglePage({
  pageNum,
  imagePath,
  compact = false,
  eager = false,
}: {
  pageNum: number;
  imagePath: string;
  compact?: boolean;
  eager?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    if (loaded) {
      // تأخير بسيط لتشغيل الانتقال
      const timer = setTimeout(() => setFadeIn(true), 50);
      return () => clearTimeout(timer);
    }
  }, [loaded]);

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
      {!compact && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(245, 197, 66, 0.15) 0%, rgba(245, 197, 66, 0.05) 50%, rgba(245, 197, 66, 0.15) 100%)',
          padding: '6px 12px',
          textAlign: 'center',
          borderBottom: '2px solid rgba(245, 197, 66, 0.3)',
        }}>
          <span style={{
            color: '#f5c542',
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "'Amiri', serif",
          }}>
            صفحة {pageNum}
          </span>
        </div>
      )}

      {/* شريط رقم الصفحة المدمج */}
      {compact && (
        <div style={{
          background: 'rgba(245, 197, 66, 0.1)',
          padding: '3px 8px',
          textAlign: 'center',
          borderBottom: '1px solid rgba(245, 197, 66, 0.2)',
        }}>
          <span style={{
            color: '#f5c542',
            fontSize: 11,
            fontWeight: 700,
            fontFamily: "'Amiri', serif",
          }}>
            صفحة {pageNum}
          </span>
        </div>
      )}

      {/* مؤشر التحميل */}
      {!loaded && !hasError && (
        <div style={{
          width: '100%',
          aspectRatio: '654 / 960',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(8, 20, 43, 0.9)',
        }}>
          <div style={{ textAlign: 'center', color: '#f5c542' }}>
            <div style={{ fontSize: compact ? 24 : 40, marginBottom: compact ? 4 : 8 }}>📖</div>
            <div style={{ fontSize: compact ? 11 : 14, fontWeight: 700 }}>جاري تحميل صفحة {pageNum}...</div>
          </div>
        </div>
      )}

      {/* خطأ التحميل */}
      {hasError && (
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
            <div style={{ fontSize: compact ? 11 : 14, fontWeight: 700 }}>لم يتم العثور على صفحة {pageNum}</div>
          </div>
        </div>
      )}

      {/* صورة الصفحة مع تأثير التلاشي */}
      <img
        src={imagePath}
        alt={`صفحة ${pageNum} من المصحف الشريف`}
        loading={eager ? 'eager' : 'lazy'}
        onLoad={() => setLoaded(true)}
        onError={() => setHasError(true)}
        style={{
          width: '100%',
          height: 'auto',
          display: loaded ? 'block' : 'none',
          opacity: fadeIn ? 1 : 0,
          transition: 'opacity 0.4s ease-in-out',
        }}
      />
    </div>
  );
}

export default function QuranPagesViewer({ question, surahCache, compact = false, onClose }: QuranPagesViewerProps) {
  // البحث عن الصفحات التي يحتويها السؤال
  const pageResult = lookupQuestionPages(question, surahCache);

  // تحميل مسبق للصفحات عند تغيير السؤال
  useEffect(() => {
    preloadQuranPages(pageResult.pages);
  }, [pageResult.pages]);

  // مفتاح فريد لكل سؤال لإعادة تعيين حالة التحميل
  const questionKey = `${question.surah}-${question.from}-${question.to}-${question.page}`;

  // الوضع المدمج
  if (compact) {
    return (
      <div style={{ width: '100%' }} key={questionKey}>
        {/* عنوان مدمج */}
        <div style={{
          background: 'rgba(8, 20, 43, 0.72)',
          border: '1px solid rgba(245, 197, 66, 0.2)',
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
            <h3 style={{
              color: '#fff5cc',
              fontSize: 13,
              marginBottom: 2,
              fontFamily: "'Amiri', serif",
            }}>
              سورة {question.surah}
            </h3>
            <p style={{
              color: '#ffffff',
              fontSize: 11,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              flexWrap: 'wrap',
            }}>
              <span style={{
                display: 'inline-block',
                background: 'rgba(245, 197, 66, 0.15)',
                color: '#ffd700',
                padding: '1px 6px',
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 700,
              }}>
                من {question.from}
              </span>
              <span style={{
                display: 'inline-block',
                background: 'rgba(245, 197, 66, 0.15)',
                color: '#ffd700',
                padding: '1px 6px',
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 700,
              }}>
                إلى {question.to}
              </span>
              <span style={{ color: '#f5c542', fontWeight: 700, fontSize: 10 }}>
                صفحة {pageResult.pages.join('-')}
              </span>
            </p>
          </div>
          {onClose && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              style={{
                background: 'rgba(255, 107, 107, 0.2)',
                border: '1px solid rgba(255, 107, 107, 0.4)',
                color: '#ff6b6b',
                width: 28,
                height: 28,
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              title="إغلاق"
            >
              ✕
            </button>
          )}
        </div>

        {/* عرض الصفحات المصورة المدمج */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: 4,
          flexDirection: pageResult.isMultiPage ? 'row' : 'column',
          flexWrap: 'wrap',
        }}>
          {pageResult.pages.map((pageNum, index) => (
            <div
              key={pageNum}
              style={{
                width: pageResult.isMultiPage ? 'calc(50% - 2px)' : '100%',
              }}
            >
              <SinglePage
                pageNum={pageNum}
                imagePath={pageResult.imagePaths[index]}
                compact={true}
                eager={true}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // الوضع العادي (كامل)
  return (
    <div style={{ width: '100%' }} key={questionKey}>
      {/* عنوان الصفحات */}
      <div style={{
        background: 'rgba(8, 20, 43, 0.72)',
        border: '2px solid rgba(245, 197, 66, 0.25)',
        borderRadius: 12,
        padding: '10px 16px',
        marginBottom: 8,
        textAlign: 'center',
      }}>
        <h3 style={{
          color: '#fff5cc',
          fontSize: 16,
          marginBottom: 4,
          fontFamily: "'Amiri', serif",
        }}>
          سورة {question.surah}
        </h3>
        <p style={{
          color: '#ffffff',
          fontSize: 13,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          flexWrap: 'wrap',
        }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(245, 197, 66, 0.2)',
            color: '#ffd700',
            padding: '2px 8px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
          }}>
            من {question.from}
          </span>
          <span style={{
            display: 'inline-block',
            background: 'rgba(245, 197, 66, 0.2)',
            color: '#ffd700',
            padding: '2px 8px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
          }}>
            إلى {question.to}
          </span>
          <span style={{ color: '#f5c542', fontWeight: 700 }}>
            صفحة {pageResult.pages.join('-')}
          </span>
        </p>
      </div>

      {/* عرض الصفحات المصورة */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 6,
        marginBottom: 8,
        flexDirection: pageResult.isMultiPage ? 'row' : 'column',
        flexWrap: 'wrap',
      }}>
        {pageResult.pages.map((pageNum, index) => (
          <div
            key={pageNum}
            style={{
              width: pageResult.isMultiPage ? 'calc(50% - 3px)' : '100%',
            }}
          >
            <SinglePage
              pageNum={pageNum}
              imagePath={pageResult.imagePaths[index]}
              compact={false}
              eager={index === 0}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
