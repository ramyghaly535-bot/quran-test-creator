'use client';

import React from 'react';
import { useQuranStore } from '@/lib/store';

export default function ToastContainer() {
  const toasts = useQuranStore(s => s.toasts);

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.isError ? 'error' : ''}`}>
          <div style={{ fontWeight: 700, fontSize: 13, color: toast.isError ? '#ff6b6b' : '#f5c542', marginBottom: 2 }}>
            {toast.title}
          </div>
          <div style={{ fontSize: 12, color: '#e0e0e0' }}>
            {toast.description}
          </div>
        </div>
      ))}
    </div>
  );
}
