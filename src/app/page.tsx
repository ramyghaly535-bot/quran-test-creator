'use client';

import React, { useEffect } from 'react';
import { useQuranStore } from '@/lib/store';
import HomeView from '@/components/HomeView';
import StudentInfoView from '@/components/StudentInfoView';
import TestView from '@/components/TestView';
import ResultsView from '@/components/ResultsView';
import AllResultsView from '@/components/AllResultsView';
import ToastContainer from '@/components/ToastContainer';

export default function Home() {
  const viewMode = useQuranStore(s => s.viewMode);
  const loadQuranDataAction = useQuranStore(s => s.loadQuranDataAction);
  const loadSavedData = useQuranStore(s => s.loadSavedData);
  const questions = useQuranStore(s => s.questions);
  const allResults = useQuranStore(s => s.allResults);

  // تحميل بيانات القرآن
  useEffect(() => {
    loadQuranDataAction();
  }, [loadQuranDataAction]);

  // تحميل البيانات المحفوظة
  useEffect(() => {
    loadSavedData();
  }, [loadSavedData]);

  // حفظ الأسئلة في localStorage
  useEffect(() => {
    try { localStorage.setItem('quran_app_questions', JSON.stringify(questions)); } catch (e) { /* ignore */ }
  }, [questions]);

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
      <ToastContainer />
    </>
  );
}
