'use client';

import React, { useEffect } from 'react';
import QuranPagesViewer from '@/components/QuranPagesViewer';
import { type QuranQuestion, type QuranVerseData } from '@/lib/quran-pages';

/* ═══════════════════════════════════════════════
   مكون نافذة معاينة صفحة المصحف
   يستخدم CSS فقط للانتقالات دون setState في effects
   ═══════════════════════════════════════════════ */

interface PagePreviewModalProps {
  /** السؤال المراد معاينة صفحته */
  question: QuranQuestion | null;
  /** ذاكرة التخزين المؤقت لبيانات السور */
  surahCache: Record<string, QuranVerseData[]>;
  /** هل النافذة مفتوحة */
  isOpen: boolean;
  /** دالة الإغلاق */
  onClose: () => void;
}

export default function PagePreviewModal({ question, surahCache, isOpen, onClose }: PagePreviewModalProps) {
  // منع التمرير في الخلفية عند فتح النافذة
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // إغلاق بمفتاح Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !question) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'modalFadeIn 0.3s ease-in-out forwards',
      }}
      onClick={onClose}
    >
      {/* المحتوى */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 600,
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          animation: 'modalSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        }}
        className="custom-scrollbar"
      >
        {/* زر الإغلاق العلوي */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: 8,
          padding: '0 4px',
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(8, 20, 43, 0.95)',
              border: '2px solid rgba(245, 197, 66, 0.4)',
              color: '#fff5cc',
              width: 40,
              height: 40,
              borderRadius: 12,
              cursor: 'pointer',
              fontSize: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255, 107, 107, 0.3)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 107, 107, 0.6)';
              (e.currentTarget as HTMLElement).style.color = '#ff6b6b';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(8, 20, 43, 0.95)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245, 197, 66, 0.4)';
              (e.currentTarget as HTMLElement).style.color = '#fff5cc';
            }}
            title="إغلاق"
          >
            ✕
          </button>
        </div>

        {/* عارض الصفحات */}
        <QuranPagesViewer
          question={question}
          surahCache={surahCache}
          onClose={onClose}
        />
      </div>

      {/* أنماط الحركة */}
      <style jsx>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
