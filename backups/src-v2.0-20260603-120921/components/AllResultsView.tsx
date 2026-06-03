'use client';

import React from 'react';
import { useQuranStore } from '@/lib/store';
import { getScoreTier } from '@/lib/quran-constants';
import BackButton from '@/components/BackButton';

export default function AllResultsView() {
  const { allResults, shareResultOnWhatsApp, deleteResult } = useQuranStore();

  return (
    <div className="pattern-islamic pattern-islamic-bg" dir="rtl" style={{ overflowX: 'hidden' }}>
      <div className="relative z-10 flex-1 flex flex-col" style={{ minHeight: '100vh' }}>
        <div className="max-w-2xl mx-auto w-full px-4 py-6">
          <BackButton label="عودة للرئيسية" />

          <div className="card-glass">
            <div className="border-b p-4" style={{ background: 'rgba(8, 20, 43, 0.95)', borderColor: 'rgba(245, 197, 66, 0.25)' }}>
              <h2 className="text-2xl font-black flex items-center gap-3 text-glow-white-bright text-elegant" style={{ fontFamily: "'Amiri', 'Tajawal', 'Cairo', serif" }}>
                <span className="text-3xl">📜</span>
                <span className="text-gradient title-golden">جميع النتائج</span>
                <span className="badge">{allResults.length}</span>
              </h2>
            </div>
            <div className="p-4">
              {allResults.length === 0 ? (
                <div className="text-center py-8 text-glow-gold text-elegant">
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                  <div>لا توجد نتائج محفوظة</div>
                </div>
              ) : (
                <div className="max-h-[70vh] overflow-y-auto custom-scrollbar space-y-3">
                  {allResults.map((result, idx) => {
                    const tier = getScoreTier(result.finalScore);
                    const isPassing = result.finalScore >= 75;
                    return (
                      <div key={idx} style={{
                        background: 'rgba(8, 20, 43, 0.72)',
                        border: `1px solid ${tier.borderColor}33`,
                        borderRadius: 12, padding: '12px 16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        gap: 8, flexWrap: 'wrap'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{
                              display: 'inline-block', background: tier.gradient,
                              color: '#0a1628', padding: '2px 10px', borderRadius: 6,
                              fontSize: 16, fontWeight: 900, minWidth: 50, textAlign: 'center'
                            }}>
                              {result.finalScore}
                            </span>
                            <span style={{ color: '#fff5cc', fontSize: 14, fontWeight: 700, fontFamily: "'Amiri', serif" }}>
                              {result.studentInfo.name}
                            </span>
                            {isPassing && <span style={{ fontSize: 16 }}>🏆</span>}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', fontSize: 12, color: '#a0a0a0' }}>
                            <span>📖 {result.courseName}</span>
                            <span>📅 {result.date}</span>
                            <span>🕐 {result.time}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <button onClick={() => shareResultOnWhatsApp(result)} style={{
                            background: 'rgba(37, 211, 102, 0.15)',
                            border: '1px solid rgba(37, 211, 102, 0.3)',
                            color: '#25d366', padding: '6px 12px',
                            borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 700
                          }}>
                            📱 مشاركة
                          </button>
                          <button onClick={() => deleteResult(idx)} style={{
                            background: 'rgba(255, 107, 107, 0.15)',
                            border: '1px solid rgba(255, 107, 107, 0.3)',
                            color: '#ff6b6b', padding: '6px 12px',
                            borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 700
                          }}>
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
