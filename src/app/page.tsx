'use client';

import React, { useEffect } from 'react';
import { useQuranStore } from '@/lib/store';
import HomeView from '@/components/HomeView';
import StudentInfoView from '@/components/StudentInfoView';
import TestView from '@/components/TestView';
import ResultsView from '@/components/ResultsView';
import AllResultsView from '@/components/AllResultsView';
import DownloadView from '@/components/DownloadView';
import ToastContainer from '@/components/ToastContainer';

export default function Home() {
  const viewMode = useQuranStore(s => s.viewMode);
  const loadQuranDataAction = useQuranStore(s => s.loadQuranDataAction);
  const loadSavedData = useQuranStore(s => s.loadSavedData);
  const courseQuestionsMap = useQuranStore(s => s.courseQuestionsMap);
  const allResults = useQuranStore(s => s.allResults);
  const navigateTo = useQuranStore(s => s.navigateTo);

  // تحميل بيانات القرآن
  useEffect(() => {
    loadQuranDataAction();
  }, [loadQuranDataAction]);

  // تحميل البيانات المحفوظة
  useEffect(() => {
    loadSavedData();
  }, [loadSavedData]);

  // التحقق من معاملات URL لعرض صفحة التحميل مباشرة
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    const hash = window.location.hash.replace('#', '');
    if (page === 'download' || hash === 'download') {
      navigateTo('download');
    }
  }, [navigateTo]);

  // حفظ أسئلة كل دورة في localStorage
  useEffect(() => {
    try { localStorage.setItem('quran_course_questions', JSON.stringify(courseQuestionsMap)); } catch (e) { /* ignore */ }
  }, [courseQuestionsMap]);

  // حفظ النتائج في localStorage
  useEffect(() => {
    try { localStorage.setItem('quran_test_results', JSON.stringify(allResults)); } catch (e) { /* ignore */ }
  }, [allResults]);

  return (
    <>
      {viewMode === 'home' && <HomeView />}
      {viewMode === 'studentInfo' && <StudentInfoView />}
      {viewMode === 'test' && <TestView />}
      {viewMode === 'results' && <ResultsView />}
      {viewMode === 'allResults' && <AllResultsView />}
      {viewMode === 'download' && <DownloadView />}
      <ToastContainer />
    </>
  );
}
