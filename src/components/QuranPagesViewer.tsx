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
}

/** مكون صفحة واحدة */
function SinglePage({ pageNum, imagePath }: { pageNum: number; imagePath: string }) {
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div style={{
      background: 'rgba(8, 20, 43, 0.95)',
      border: '3px solid rgba(245, 197, 66, 0.5)',
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: '0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(245, 197, 66, 0.15)',
      position: 'relative',
    }}>
      {/* شريط رقم الصفحة */}
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
            <div style={{ fontSize: 40, marginBottom: 8 }}>📖</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>جاري تحميل صفحة {pageNum}...</div>
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
            <div style={{ fontSize: 40, marginBottom: 8 }}>⚠️</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>لم يتم العثور على صفحة {pageNum}</div>
          </div>
        </div>
      )}

      {/* صورة الصفحة */}
      <img
        src={imagePath}
        alt={`صفحة ${pageNum} من المصحف الشريف`}
        onLoad={() => setLoaded(true)}
        onError={() => setHasError(true)}
        style={{
          width: '100%',
          height: 'auto',
          display: loaded ? 'block' : 'none',
        }}
      />
    </div>
  );
}

export default function QuranPagesViewer({ question, surahCache }: QuranPagesViewerProps) {
  // البحث عن الصفحات التي يحتويها السؤال
  const pageResult = lookupQuestionPages(question, surahCache);

  // تحميل مسبق للصفحات عند تغيير السؤال
  useEffect(() => {
    preloadQuranPages(pageResult.pages);
  }, [pageResult.pages]);

  // مفتاح فريد لكل سؤال لإعادة تعيين حالة التحميل
  const questionKey = `${question.surah}-${question.from}-${question.to}-${question.page}`;

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
            />
          </div>
        ))}
      </div>
    </div>
  );
}
