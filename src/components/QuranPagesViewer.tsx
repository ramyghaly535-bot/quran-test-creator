'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { lookupQuestionPages, preloadPage, preloadPageRange, getPageUrl, getPageImagePath, isPageCached, addCacheListener, retryPage, type QuranQuestion, type QuranVerseData, type PageLoadStatus } from '@/lib/quran-pages';

/* ═══════════════════════════════════════════════
   مكون عرض الصفحات المصورة للقرآن الكريم
   يستخدم الرابط المباشر أولاً ثم يحسن بـ blob URL
   ═══════════════════════════════════════════════ */

interface QuranPagesViewerProps {
  question: QuranQuestion;
  surahCache: Record<string, QuranVerseData[]>;
  compact?: boolean;
  onClose?: () => void;
}

/** مكون صفحة واحدة */
function SinglePage({
  pageNum,
  compact = false,
}: {
  pageNum: number;
  compact?: boolean;
}) {
  // حالة التحميل
  const [imgSrc, setImgSrc] = useState<string>(() => {
    // أولوية: blob URL من الكاش > الرابط المباشر
    if (isPageCached(pageNum)) {
      const cachedUrl = getPageUrl(pageNum);
      if (cachedUrl !== getPageImagePath(pageNum)) return cachedUrl;
    }
    return getPageImagePath(pageNum);
  });
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const mountedRef = useRef(true);

  // الاستماع لتغييرات الكاش لتحسين الرابط
  useEffect(() => {
    mountedRef.current = true;

    const unsub = addCacheListener((page, status) => {
      if (page === pageNum && mountedRef.current && status === 'loaded') {
        // تحسين: استبدال الرابط المباشر بـ blob URL
        const newUrl = getPageUrl(pageNum);
        if (newUrl !== getPageImagePath(pageNum)) {
          setImgSrc(newUrl);
        }
      }
    });

    // تحميل الصفحة في الكاش في الخلفية
    if (!isPageCached(pageNum)) {
      preloadPage(pageNum).then((status) => {
        if (mountedRef.current && status === 'loaded') {
          const newUrl = getPageUrl(pageNum);
          if (newUrl !== getPageImagePath(pageNum)) {
            setImgSrc(newUrl);
          }
        }
      });
    }

    return () => {
      mountedRef.current = false;
      unsub();
    };
  }, [pageNum]);

  // إعادة المحاولة عند الخطأ
  const handleRetry = useCallback(() => {
    setLoadError(false);
    setRetryCount(prev => prev + 1);
    retryPage(pageNum).then((status) => {
      if (mountedRef.current) {
        if (status === 'loaded') {
          setImgSrc(getPageUrl(pageNum));
          setLoadError(false);
        } else {
          setLoadError(true);
        }
      }
    });
  }, [pageNum]);

  // عند فشل تحميل الصورة
  const handleImageError = useCallback(() => {
    if (retryCount < 2) {
      // محاولة تلقائية بإعادة التحميل
      setRetryCount(prev => prev + 1);
      // تأخير قصير قبل إعادة المحاولة
      setTimeout(() => {
        if (mountedRef.current) {
          setImgSrc(getPageImagePath(pageNum) + '?retry=' + retryCount);
        }
      }, 500);
    } else {
      setLoadError(true);
    }
  }, [pageNum, retryCount]);

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

      {/* صورة الصفحة - الرابط المباشر أو blob URL */}
      {!loadError && (
        <img
          key={`page-${pageNum}-${retryCount}`}
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

export default function QuranPagesViewer({ question, surahCache, compact = false, onClose }: QuranPagesViewerProps) {
  // مفتاح فريد لكل سؤال - يُستخدم للتبعيات لضمان التحديث الصحيح
  const questionKey = `${question.surah}-${question.from}-${question.to}-${question.page}`;

  // البحث عن الصفحات التي يحتويها السؤال
  // questionKey يُستخدم كتبعية إضافية لضمان التحديث عند تغيير بيانات السؤال
  const pageResult = useMemo(() => lookupQuestionPages(question, surahCache), [question, surahCache, questionKey]);

  // تحميل مسبق فوري للصفحات والصفحات المحيطة
  useEffect(() => {
    pageResult.pages.forEach(pageNum => {
      preloadPage(pageNum).catch(() => { /* ignore */ });
    });
    if (pageResult.pages.length > 0) {
      preloadPageRange(pageResult.pages[0], 3);
    }
  }, [questionKey, pageResult.pages]);

  // الوضع المدمج
  if (compact) {
    return (
      <div style={{ width: '100%' }} key={questionKey}>
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
            <h3 style={{ color: '#fff5cc', fontSize: 13, marginBottom: 2, fontFamily: "'Amiri', serif" }}>
              سورة {question.surah}
            </h3>
            <p style={{ color: '#ffffff', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-block', background: 'rgba(245, 197, 66, 0.15)', color: '#ffd700', padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>من {question.from}</span>
              <span style={{ display: 'inline-block', background: 'rgba(245, 197, 66, 0.15)', color: '#ffd700', padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>إلى {question.to}</span>
              <span style={{ color: '#f5c542', fontWeight: 700, fontSize: 10 }}>صفحة {pageResult.pages.join('-')}</span>
            </p>
          </div>
          {onClose && (
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} style={{ background: 'rgba(255, 107, 107, 0.2)', border: '1px solid rgba(255, 107, 107, 0.4)', color: '#ff6b6b', width: 28, height: 28, borderRadius: 6, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} title="إغلاق">✕</button>
          )}
        </div>
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
      <div style={{ background: 'rgba(8, 20, 43, 0.72)', border: '2px solid rgba(245, 197, 66, 0.25)', borderRadius: 12, padding: '10px 16px', marginBottom: 8, textAlign: 'center' }}>
        <h3 style={{ color: '#fff5cc', fontSize: 16, marginBottom: 4, fontFamily: "'Amiri', serif" }}>سورة {question.surah}</h3>
        <p style={{ color: '#ffffff', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-block', background: 'rgba(245, 197, 66, 0.2)', color: '#ffd700', padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>من {question.from}</span>
          <span style={{ display: 'inline-block', background: 'rgba(245, 197, 66, 0.2)', color: '#ffd700', padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>إلى {question.to}</span>
          <span style={{ color: '#f5c542', fontWeight: 700 }}>صفحة {pageResult.pages.join('-')}</span>
        </p>
      </div>
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
