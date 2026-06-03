'use client';

import React from 'react';
import { useQuranStore } from '@/lib/store';

export default function BackButton({ label }: { label?: string }) {
  const goBack = useQuranStore(s => s.goBack);

  return (
    <button onClick={goBack} style={{
      background: 'rgba(8, 20, 43, 0.72)',
      border: '2px solid rgba(245, 197, 66, 0.25)',
      color: '#fff5cc',
      padding: '6px 14px',
      borderRadius: 8,
      cursor: 'pointer',
      marginBottom: 8,
      fontSize: 13,
      fontWeight: 700,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      minHeight: 36
    }}>
      <span style={{ fontSize: 16 }}>→</span>
      <span>{label || 'عودة'}</span>
    </button>
  );
}
