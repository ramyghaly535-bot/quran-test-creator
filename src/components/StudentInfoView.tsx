'use client';

import React from 'react';
import { useQuranStore } from '@/lib/store';
import BackButton from '@/components/BackButton';

export default function StudentInfoView() {
  const {
    studentInfo, selectedCourse, testQuestions,
    setStudentInfo, handleStartTest,
  } = useQuranStore();

  return (
    <div className="pattern-islamic pattern-islamic-bg" dir="rtl" style={{ overflowX: 'hidden' }}>
      <div className="relative z-10 flex-1 flex flex-col" style={{ minHeight: '100vh' }}>
        <div className="max-w-lg mx-auto w-full px-4 py-6">
          <BackButton label="عودة للرئيسية" />

          <div className="card-glass">
            <div className="border-b p-4" style={{ background: 'rgba(8, 20, 43, 0.95)', borderColor: 'rgba(245, 197, 66, 0.25)' }}>
              <h2 className="text-2xl font-black flex items-center gap-3 text-glow-white-bright text-elegant" style={{ fontFamily: "'Amiri', 'Tajawal', 'Cairo', serif" }}>
                <span className="text-3xl">👤</span>
                <span className="text-gradient title-golden">بيانات الطالب</span>
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label style={{ display: 'block', color: '#f5c542', fontWeight: 700, marginBottom: 6, fontSize: 14 }}>الاسم *</label>
                <input type="text" className="quran-input" placeholder="أدخل اسم الطالب" value={studentInfo.name} onChange={(e) => setStudentInfo({ name: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#f5c542', fontWeight: 700, marginBottom: 6, fontSize: 14 }}>تاريخ الميلاد *</label>
                <input type="date" className="quran-input" value={studentInfo.birthDate} onChange={(e) => setStudentInfo({ birthDate: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#f5c542', fontWeight: 700, marginBottom: 6, fontSize: 14 }}>مكان الميلاد</label>
                <input type="text" className="quran-input" placeholder="أدخل مكان الميلاد" value={studentInfo.birthPlace} onChange={(e) => setStudentInfo({ birthPlace: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#f5c542', fontWeight: 700, marginBottom: 6, fontSize: 14 }}>المركز</label>
                <input type="text" className="quran-input" placeholder="أدخل اسم المركز" value={studentInfo.center} onChange={(e) => setStudentInfo({ center: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#f5c542', fontWeight: 700, marginBottom: 6, fontSize: 14 }}>المحفظ *</label>
                <input type="text" className="quran-input" placeholder="أدخل اسم المحفظ" value={studentInfo.teacher} onChange={(e) => setStudentInfo({ teacher: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#f5c542', fontWeight: 700, marginBottom: 6, fontSize: 14 }}>المحافظة</label>
                <input type="text" className="quran-input" placeholder="أدخل اسم المحافظة" value={studentInfo.governorate} onChange={(e) => setStudentInfo({ governorate: e.target.value })} />
              </div>

              <div style={{ marginTop: 8, padding: '10px 14px', background: 'rgba(8, 20, 43, 0.72)', border: '1px solid rgba(245, 197, 66, 0.2)', borderRadius: 10, textAlign: 'center' }}>
                <span style={{ color: '#f5c542', fontSize: 13, fontWeight: 700 }}>
                  📖 الدورة: {selectedCourse?.name} | عدد الأسئلة: {testQuestions.length}
                </span>
              </div>

              <button onClick={handleStartTest} style={{
                width: '100%',
                background: 'linear-gradient(45deg, #d4a017, #ffd700)',
                border: 'none', padding: '14px 24px', borderRadius: 12,
                color: '#0a1628', fontWeight: 800, fontSize: 18,
                cursor: 'pointer', boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
                marginTop: 8
              }}>
                🚀 بدء الاختبار
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
