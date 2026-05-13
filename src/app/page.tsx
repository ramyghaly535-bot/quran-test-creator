'use client';

import React, { useState, useEffect, useCallback, useRef, startTransition } from 'react';
import QuranPagesViewer from '@/components/QuranPagesViewer';
import { lookupQuestionPages, preloadAllQuestionPages } from '@/lib/quran-pages';

/* ═══════════════════════════════════════════════
   ثوابت القرآن الكريم
   ═══════════════════════════════════════════════ */

const SURAH_NAMES = [
  "الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف","الأنفال","التوبة","يونس",
  "هود","يوسف","الرعد","إبراهيم","الحجر","النحل","الإسراء","الكهف","مريم","طه",
  "الأنبياء","الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم",
  "لقمان","السجدة","الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر",
  "فصلت","الشورى","الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق",
  "الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة",
  "الصف","الجمعة","المنافقون","التغابن","الطلاق","التحليم","الملك","القلم","الحاقة","المعارج",
  "نوح","الجن","المزمل","المدثر","القيامة","الإنسان","المرسلات","النبأ","النازعات","عبس",
  "التكوير","الانفطار","المطففين","الإنشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد",
  "الشمس","الليل","الضحى","الشرح","التين","العلق","القدر","البينة","الزلزلة","العاديات",
  "القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر",
  "المسد","الإخلاص","الفلق","الناس"
];

const SURAH_JUZ: Record<string, number> = {
  "الفاتحة":1,"البقرة":1,"آل عمران":3,"النساء":4,"المائدة":6,
  "الأنعام":7,"الأعراف":8,"الأنفال":9,"التوبة":10,"يونس":11,
  "هود":11,"يوسف":12,"الرعد":13,"إبراهيم":13,"الحجر":14,
  "النحل":14,"الإسراء":15,"الكهف":15,"مريم":16,"طه":16,
  "الأنبياء":17,"الحج":17,"المؤمنون":18,"النور":18,"الفرقان":19,
  "الشعراء":19,"النمل":20,"القصص":20,"العنكبوت":20,"الروم":21,
  "لقمان":21,"السجدة":21,"الأحزاب":21,"سبأ":22,"فاطر":22,
  "يس":22,"الصافات":23,"ص":23,"الزمر":23,"غافر":24,
  "فصلت":24,"الشورى":25,"الزخرف":25,"الدخان":25,"الجاثية":26,
  "الأحقاف":26,"محمد":26,"الفتح":26,"الحجرات":26,"ق":26,
  "الذاريات":26,"الطور":27,"النجم":27,"القمر":27,"الرحمن":27,
  "الواقعة":27,"الحديد":27,"المجادلة":28,"الحشر":28,"الممتحنة":28,
  "الصف":28,"الجمعة":28,"المنافقون":29,"التغابن":29,"الطلاق":29,
  "التحليم":29,"الملك":29,"القلم":29,"الحاقة":29,"المعارج":29,
  "نوح":29,"الجن":29,"المزمل":29,"المدثر":29,"القيامة":29,
  "الإنسان":29,"المرسلات":29,"النبأ":30,"النازعات":30,"عبس":30,
  "التكوير":30,"الانفطار":30,"المطففين":30,"الإنشقاق":30,"البروج":30,
  "الطارق":30,"الأعلى":30,"الغاشية":30,"الفجر":30,"البلد":30,
  "الشمس":30,"الليل":30,"الضحى":30,"الشرح":30,"التين":30,
  "العلق":30,"القدر":30,"البينة":30,"الزلزلة":30,"العاديات":30,
  "القارعة":30,"التكاثر":30,"العصر":30,"الهمزة":30,"الفيل":30,
  "قريش":30,"الماعون":30,"الكوثر":30,"الكافرون":30,"النصر":30,
  "المسد":30,"الإخلاص":30,"الفلق":30,"الناس":30
};

/* ═══════════════════════════════════════════════
   الأنواع (Types)
   ═══════════════════════════════════════════════ */

interface CourseData {
  name: string; start: string; end: string; type: string;
  pageStart: number; pageEnd: number; questionCount: number; hasJuz30: boolean;
}

interface QuranVerse {
  text: string; numberInSurah: number; page: number; juz: number;
}

interface Question {
  surah: string; from: number; to: number; page: number; courseName: string; juz: number;
}

interface StudentInfo {
  name: string; birthDate: string; birthPlace: string; center: string; teacher: string; governorate: string;
}

interface TestResult {
  courseName: string; questions: Question[];
  errors: { small: number; medium: number; position: number; weakness: number };
  finalScore: number; date: string; time: string; studentInfo: StudentInfo;
}

interface ToastItem {
  id: number; title: string; description: string; isError: boolean;
}

/* ═══════════════════════════════════════════════
   بيانات الدورات
   ═══════════════════════════════════════════════ */

const COURSES_DATA: CourseData[] = [
  { name: "دورة 28-30", start: "المجادلة", end: "الناس", type: "3juz", pageStart: 542, pageEnd: 604, questionCount: 3, hasJuz30: true },
  { name: "دورة 26-30", start: "الأحقاف", end: "الناس", type: "5juz", pageStart: 502, pageEnd: 604, questionCount: 4, hasJuz30: true },
  { name: "دورة 23-25", start: "يس", end: "الجاثية", type: "3juz", pageStart: 440, pageEnd: 501, questionCount: 3, hasJuz30: false },
  { name: "دورة 21-25", start: "الروم", end: "الجاثية", type: "5juz", pageStart: 404, pageEnd: 501, questionCount: 4, hasJuz30: false },
  { name: "دورة 21-30", start: "الروم", end: "الناس", type: "10juz", pageStart: 404, pageEnd: 604, questionCount: 5, hasJuz30: true },
  { name: "دورة 18-20", start: "المؤمنون", end: "العنكبوت", type: "3juz", pageStart: 342, pageEnd: 403, questionCount: 3, hasJuz30: false },
  { name: "دورة 16-20", start: "مريم", end: "العنكبوت", type: "5juz", pageStart: 305, pageEnd: 403, questionCount: 4, hasJuz30: false },
  { name: "دورة 13-15", start: "يوسف", end: "الكهف", type: "3juz", pageStart: 253, pageEnd: 304, questionCount: 3, hasJuz30: false },
  { name: "دورة 11-15", start: "يونس", end: "الكهف", type: "5juz", pageStart: 208, pageEnd: 304, questionCount: 4, hasJuz30: false },
  { name: "دورة 11-20", start: "يونس", end: "العنكبوت", type: "10juz", pageStart: 208, pageEnd: 403, questionCount: 5, hasJuz30: false },
  { name: "دورة 11-30", start: "يونس", end: "الناس", type: "20juz", pageStart: 208, pageEnd: 604, questionCount: 6, hasJuz30: true },
  { name: "دورة 8-10", start: "الأعراف", end: "التوبة", type: "3juz", pageStart: 151, pageEnd: 207, questionCount: 3, hasJuz30: false },
  { name: "دورة 6-10", start: "المائدة", end: "التوبة", type: "5juz", pageStart: 106, pageEnd: 207, questionCount: 4, hasJuz30: false },
  { name: "دورة 3-5", start: "آل عمران", end: "النساء", type: "3juz", pageStart: 50, pageEnd: 105, questionCount: 3, hasJuz30: false },
  { name: "دورة 1-5", start: "البقرة", end: "النساء", type: "5juz", pageStart: 2, pageEnd: 105, questionCount: 4, hasJuz30: false },
  { name: "دورة 1-10", start: "البقرة", end: "التوبة", type: "10juz", pageStart: 2, pageEnd: 207, questionCount: 5, hasJuz30: false }
];

/* ═══════════════════════════════════════════════
   دوال مساعدة
   ═══════════════════════════════════════════════ */

const QURAN_DATA_URL = '/quran-data.json';

function getSurahJuz(surahName: string): number {
  return SURAH_JUZ[surahName] || 1;
}

function getGenerationRule(course: CourseData): string {
  const totalPages = course.pageEnd - course.pageStart + 1;
  const interval = Math.ceil(totalPages / course.questionCount);
  if (course.hasJuz30) return course.questionCount + ' أسئلة (1 من الجزء 30 + ' + (course.questionCount - 1) + ' من الأجزاء الأخرى)';
  if (course.type === "3juz") return course.questionCount + ' أسئلة (سؤال واحد من كل جزء - كل ~' + interval + ' صفحة)';
  return course.questionCount + ' أسئلة (كل ~' + interval + ' صفحة)';
}

function getScoreTier(score: number) {
  if (score >= 90) return { tier: 'gold', color: '#ffd700', colorLight: '#fff5cc', gradient: 'linear-gradient(135deg, #ffd700 0%, #ffec80 50%, #ffd700 100%)', shadow: '0 0 30px rgba(255, 215, 0, 0.5)', cupEmoji: '🏆', label: 'ممتاز', borderColor: '#ffd700' };
  if (score >= 80) return { tier: 'silver', color: '#c0c0c0', colorLight: '#e8e8e8', gradient: 'linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 50%, #c0c0c0 100%)', shadow: '0 0 30px rgba(192, 192, 192, 0.5)', cupEmoji: '🏆', label: 'جيد جداً', borderColor: '#c0c0c0' };
  if (score >= 75) return { tier: 'bronze', color: '#cd7f32', colorLight: '#e8c49a', gradient: 'linear-gradient(135deg, #cd7f32 0%, #e8c49a 50%, #cd7f32 100%)', shadow: '0 0 30px rgba(205, 127, 50, 0.5)', cupEmoji: '🏆', label: 'جيد', borderColor: '#cd7f32' };
  return { tier: 'fail', color: '#ff6b6b', colorLight: '#ffb3b3', gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%)', shadow: '0 0 20px rgba(255, 107, 107, 0.3)', cupEmoji: '', label: '', borderColor: '#ff6b6b' };
}

function padPageNum(n: number): string {
  return String(n).padStart(3, '0');
}

/* ═══════════════════════════════════════════════
   المكون الرئيسي
   ═══════════════════════════════════════════════ */

type ViewMode = 'home' | 'studentInfo' | 'test' | 'results' | 'allResults';

export default function Home() {
  /* --- الحالات --- */
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);
  const [courseSurahs, setCourseSurahs] = useState<string[]>([]);
  const [selectedSurah, setSelectedSurah] = useState('');
  const [surahData, setSurahData] = useState<QuranVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selection, setSelection] = useState<{ active: boolean; startIdx: number | null; endIdx: number | null }>({ active: false, startIdx: null, endIdx: null });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [generating, setGenerating] = useState(false);
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [errors, setErrors] = useState({ small: 0, medium: 0, position: 0, weakness: 0 });
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [allResults, setAllResults] = useState<TestResult[]>([]);
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({ name: '', birthDate: '', birthPlace: '', center: '', teacher: '', governorate: '' });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set());
  const [verseFontSize, setVerseFontSize] = useState(20);
  const [showWeaknessDialog, setShowWeaknessDialog] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [surahCache, setSurahCache] = useState<Record<string, QuranVerse[]>>({});
  const [quranDataLoaded, setQuranDataLoaded] = useState(false);
  const [viewHistory, setViewHistory] = useState<ViewMode[]>([]);
  const [showFireworks, setShowFireworks] = useState(false);
  const [flashCourse, setFlashCourse] = useState<string | null>(null);
  const [flashSurah, setFlashSurah] = useState<string | null>(null);

  const toastIdRef = useRef(0);

  /* ═══════════════════════════════════════════════
     نظام الإشعارات (Toast)
     ═══════════════════════════════════════════════ */
  const showToast = useCallback((title: string, description: string, isError = false) => {
    const id = toastIdRef.current++;
    setToasts(prev => [...prev, { id, title, description, isError }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  /* ═══════════════════════════════════════════════
     تحميل البيانات
     ═══════════════════════════════════════════════ */

  useEffect(() => {
    fetch(QURAN_DATA_URL)
      .then(res => res.ok ? res.json() : Promise.reject('Failed'))
      .then((data: Record<string, QuranVerse[]>) => {
        setSurahCache(data);
        setQuranDataLoaded(true);
      })
      .catch(e => console.error('Error loading Quran data:', e));
  }, []);

  useEffect(() => {
    try {
      const savedQuestions = localStorage.getItem('quran_app_questions');
      const savedResults = localStorage.getItem('quran_test_results');
      const parsedQuestions = savedQuestions ? JSON.parse(savedQuestions) : [];
      const parsedResults = savedResults ? JSON.parse(savedResults) : [];
      if (parsedQuestions.length > 0 || parsedResults.length > 0) {
        startTransition(() => {
          if (parsedQuestions.length > 0) setQuestions(parsedQuestions);
          if (parsedResults.length > 0) setAllResults(parsedResults);
        });
      }
    } catch (e) { console.error('Error loading saved data:', e); }
  }, []);

  useEffect(() => {
    try { localStorage.setItem('quran_app_questions', JSON.stringify(questions)); } catch (e) { /* ignore */ }
  }, [questions]);

  useEffect(() => {
    try { localStorage.setItem('quran_test_results', JSON.stringify(allResults)); } catch (e) { /* ignore */ }
  }, [allResults]);

  /* ═══════════════════════════════════════════════
     تحميل مسبق لصفحات المصحف المصورة
     ═══════════════════════════════════════════════ */

  useEffect(() => {
    if (testQuestions.length === 0 || !quranDataLoaded) return;
    preloadAllQuestionPages(testQuestions, surahCache);
  }, [testQuestions, surahCache, quranDataLoaded]);

  /* ═══════════════════════════════════════════════
     التنقل
     ═══════════════════════════════════════════════ */

  const navigateTo = useCallback((view: ViewMode) => {
    setViewHistory(prev => [...prev, viewMode]);
    setViewMode(view);
  }, [viewMode]);

  const goBack = useCallback(() => {
    if (viewHistory.length > 0) {
      const prevView = viewHistory[viewHistory.length - 1];
      setViewHistory(prev => prev.slice(0, -1));
      setViewMode(prevView);
    } else {
      setViewMode('home');
    }
  }, [viewHistory]);

  /* ═══════════════════════════════════════════════
     اختيار الدورة والسورة
     ═══════════════════════════════════════════════ */

  const handleCourseSelect = useCallback((course: CourseData) => {
    setFlashCourse(course.name);
    setTimeout(() => setFlashCourse(null), 800);
    setSelectedCourse(course);
    const startIdx = SURAH_NAMES.indexOf(course.start);
    const endIdx = SURAH_NAMES.indexOf(course.end);
    setCourseSurahs(SURAH_NAMES.slice(startIdx, endIdx + 1));
    setSelectedSurah('');
    setSurahData([]);
    setSelection({ active: false, startIdx: null, endIdx: null });
    showToast('تم تحميل الدورة', course.name);
  }, [showToast]);

  const handleSurahSelect = useCallback((surahName: string) => {
    setFlashSurah(surahName);
    setTimeout(() => setFlashSurah(null), 800);
    setSelectedSurah(surahName);
    setLoading(true);
    setSelection({ active: false, startIdx: null, endIdx: null });
    const cached = surahCache[surahName];
    if (cached && cached.length > 0) {
      setSurahData(cached);
      setLoading(false);
      showToast('تم تحميل السورة', surahName + ' (' + cached.length + ' آية)');
    } else {
      setSurahData([]);
      setLoading(false);
      showToast('تنبيه', !quranDataLoaded ? 'جاري تحميل بيانات القرآن' : 'لم يتم العثور على بيانات السورة', true);
    }
  }, [showToast, surahCache, quranDataLoaded]);

  /* ═══════════════════════════════════════════════
     اختيار الآيات لبناء الأسئلة
     ═══════════════════════════════════════════════ */

  const handleVerseClick = useCallback((index: number) => {
    if (!selection.active) {
      setSelection({ active: true, startIdx: index, endIdx: null });
      showToast('تم تحديد البداية', 'اختر نهاية الموضع');
    } else {
      const start = Math.min(selection.startIdx!, index);
      const end = Math.max(selection.startIdx!, index);
      const newQuestion: Question = {
        surah: selectedSurah,
        from: surahData[start].numberInSurah,
        to: surahData[end].numberInSurah,
        page: surahData[start].page,
        courseName: selectedCourse?.name || "",
        juz: surahData[start].juz || getSurahJuz(selectedSurah)
      };
      setQuestions(prev => [...prev, newQuestion]);
      setSelection({ active: false, startIdx: null, endIdx: null });
      showToast('تمت الإضافة', 'تم إضافة السؤال من صفحة ' + newQuestion.page);
    }
  }, [selection, surahData, selectedSurah, selectedCourse, showToast]);

  const deleteQuestion = useCallback((q: Question) => {
    setQuestions(prev => prev.filter(item => !(item.surah === q.surah && item.from === q.from && item.page === q.page)));
  }, []);

  const clearAllQuestions = useCallback(() => {
    if (confirm('هل أنت متأكد من مسح جميع الأسئلة؟')) {
      setQuestions([]);
      showToast('تم المسح', 'تم مسح جميع الأسئلة');
    }
  }, [showToast]);

  /* ═══════════════════════════════════════════════
     حساب الدرجات
     ═══════════════════════════════════════════════ */

  const calculateFinalScore = useCallback(() => {
    const totalDeductions = (errors.small * 0.5) + (errors.medium * 1) + (errors.position * 3) + errors.weakness;
    const finalScore = Math.max(0, Math.round((100 - totalDeductions) * 10) / 10);
    const now = new Date();
    const result: TestResult = {
      courseName: selectedCourse?.name || '',
      questions: testQuestions,
      errors: { ...errors },
      finalScore,
      date: now.toLocaleDateString('ar-SA'),
      time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      studentInfo: { ...studentInfo }
    };
    setTestResult(result);
    setAllResults(prev => [...prev, result]);
    setViewHistory(prev => [...prev, 'test']);
    setViewMode('results');
    if (finalScore >= 75) setShowFireworks(true);
  }, [errors, selectedCourse, testQuestions, studentInfo]);

  const handleQuestionComplete = useCallback(() => {
    setCompletedQuestions(prev => new Set(prev).add(currentQuestionIndex));
    if (currentQuestionIndex === testQuestions.length - 1) {
      calculateFinalScore();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      showToast('تمت الإجابة', 'السؤال ' + (currentQuestionIndex + 2));
    }
  }, [currentQuestionIndex, testQuestions.length, showToast, calculateFinalScore]);

  const handleErrorClick = useCallback((type: 'small' | 'medium' | 'position' | 'weakness', value: number) => {
    setErrors(prev => ({ ...prev, [type]: prev[type] + 1 }));
    if (type === 'position' && selectedCourse) {
      const currentQ = testQuestions[currentQuestionIndex];
      const currentJuz = currentQ.juz;
      const sameJuzQuestions = questions.filter(q =>
        q.juz === currentJuz &&
        q.courseName === selectedCourse.name &&
        !(q.surah === currentQ.surah && q.from === currentQ.from && q.page === currentQ.page)
      );
      if (sameJuzQuestions.length > 0) {
        const newQ = sameJuzQuestions[Math.floor(Math.random() * sameJuzQuestions.length)];
        setTestQuestions(prev => { const updated = [...prev]; updated[currentQuestionIndex] = newQ; return updated; });
        showToast('تم تغيير الموضع', 'سورة ' + newQ.surah + ' صفحة ' + newQ.page);
      } else {
        showToast('تنبيه', 'لا يوجد مواضع أخرى متاحة من جزء ' + currentJuz, true);
      }
    } else {
      showToast('تم تسجيل الخطأ', value + ' درجة');
    }
  }, [selectedCourse, testQuestions, currentQuestionIndex, questions, showToast]);

  const handleWeaknessClick = useCallback((value: number) => {
    setErrors(prev => ({ ...prev, weakness: prev.weakness + value }));
    setShowWeaknessDialog(false);
    showToast('تم تسجيل الخطأ', value + ' درجات (ضعف تلاوة)');
  }, [showToast]);

  /* ═══════════════════════════════════════════════
     توليد الاختبار
     ═══════════════════════════════════════════════ */

  const generateFinalTest = useCallback(() => {
    if (!selectedCourse) { showToast('تنبيه', 'الرجاء اختيار دورة أولاً', true); return; }
    const courseQuestions = questions.filter(q => q.courseName === selectedCourse.name);
    if (courseQuestions.length < selectedCourse.questionCount) {
      showToast('تنبيه', 'تحتاج إلى ' + selectedCourse.questionCount + ' أسئلة على الأقل', true);
      return;
    }
    setGenerating(true);
    setTimeout(() => {
      const selectedQs: Question[] = [];
      if (selectedCourse.hasJuz30) {
        const juz30Q = courseQuestions.filter(q => q.juz === 30);
        const otherQ = courseQuestions.filter(q => q.juz !== 30);
        if (juz30Q.length > 0) {
          selectedQs.push(juz30Q[Math.floor(Math.random() * juz30Q.length)]);
        } else {
          showToast('تنبيه', 'يجب إضافة سؤال واحد على الأقل من الجزء 30', true);
          setGenerating(false); return;
        }
        const remaining = selectedCourse.questionCount - 1;
        if (otherQ.length >= remaining) {
          const shuffled = [...otherQ].sort(() => Math.random() - 0.5);
          for (let i = 0; i < remaining; i++) {
            const q = shuffled[i];
            if (!selectedQs.find(sq => sq.surah === q.surah && sq.from === q.from && sq.page === q.page))
              selectedQs.push(q);
          }
        } else {
          showToast('تنبيه', 'تحتاج إلى ' + remaining + ' أسئلة أخرى', true);
          setGenerating(false); return;
        }
      } else {
        const shuffled = [...courseQuestions].sort(() => Math.random() - 0.5);
        for (let i = 0; i < selectedCourse.questionCount; i++) {
          const q = shuffled[i];
          if (!selectedQs.find(sq => sq.surah === q.surah && sq.from === q.from && sq.page === q.page))
            selectedQs.push(q);
        }
      }
      selectedQs.sort((a, b) => a.page - b.page);
      setTestQuestions(selectedQs);
      setGenerating(false);
      setErrors({ small: 0, medium: 0, position: 0, weakness: 0 });
      navigateTo('studentInfo');
      showToast('تم التوليد!', selectedQs.length + ' أسئلة متنوعة');
    }, 1000);
  }, [selectedCourse, questions, showToast, navigateTo]);

  const handleStartTest = useCallback(() => {
    if (!studentInfo.name || !studentInfo.birthDate || !studentInfo.teacher) {
      showToast('تنبيه', 'الرجاء إدخال الاسم، تاريخ الميلاد، واسم المحفظ', true);
      return;
    }
    setCurrentQuestionIndex(0);
    setCompletedQuestions(new Set());
    navigateTo('test');
  }, [studentInfo, showToast, navigateTo]);

  /* ═══════════════════════════════════════════════
     المشاركة والحذف
     ═══════════════════════════════════════════════ */

  const shareOnWhatsApp = useCallback(() => {
    if (!testResult) return;
    const text = '📚 اختبار حفظ القرآن الكريم\n━━━━━━━━━━━━━━━━━\n👤 اسم الطالب: ' + testResult.studentInfo.name + '\n📅 التاريخ: ' + testResult.date + '\n🕐 الوقت: ' + testResult.time + '\n👨\u200D🏫 المحفظ: ' + testResult.studentInfo.teacher + '\n━━━━━━━━━━━━━━━━━\n📖 الدورة: ' + testResult.courseName + '\n📊 النتيجة: ' + testResult.finalScore + '/100\n🔴 الأخطاء:\n• خطأ صغير: ' + testResult.errors.small + '\n• خطأ متوسط: ' + testResult.errors.medium + '\n• تغيير موضع: ' + testResult.errors.position + '\n• ضعف التلاوة: ' + testResult.errors.weakness + '\n💯 الدرجة: ' + testResult.finalScore + '%';
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
  }, [testResult]);

  const shareResultOnWhatsApp = useCallback((result: TestResult) => {
    const text = '📚 اختبار القرآن\n👤 ' + result.studentInfo.name + '\n📖 ' + result.courseName + '\n📊 ' + result.finalScore + '/100';
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
  }, []);

  const deleteResult = useCallback((index: number) => {
    if (confirm('هل أنت متأكد من حذف هذا الاختبار؟')) {
      setAllResults(prev => prev.filter((_, i) => i !== index));
      showToast('تم الحذف', 'تم حذف الاختبار');
    }
  }, [showToast]);

  /* ═══════════════════════════════════════════════
     مكون الزر العودة
     ═══════════════════════════════════════════════ */

  const BackButton = ({ label }: { label?: string }) => (
    <button onClick={goBack} style={{
      background: 'rgba(8, 20, 43, 0.72)', border: '2px solid rgba(245, 197, 66, 0.25)',
      color: '#fff5cc', padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
      marginBottom: 8, fontSize: 13, fontWeight: 700, display: 'inline-flex',
      alignItems: 'center', gap: 6, minHeight: 36
    }}>
      <span style={{ fontSize: 16 }}>→</span><span>{label || 'عودة'}</span>
    </button>
  );

  /* ═══════════════════════════════════════════════
     مكون الألعاب النارية
     ═══════════════════════════════════════════════ */

  const FireworksCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      interface Particle { x: number; y: number; vx: number; vy: number; color: string; size: number; life: number; maxLife: number; type: 'spark' | 'confetti'; rotation: number; }
      const colors = ['#ffd700', '#ff6b6b', '#4ade80', '#60a5fa', '#f472b6', '#a78bfa', '#fb923c', '#22d3ee'];
      const particles: Particle[] = [];

      const createExplosion = (x: number, y: number) => {
        for (let i = 0; i < 30; i++) {
          const angle = (Math.PI * 2 * i) / 30;
          const speed = 2 + Math.random() * 5;
          particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, color: colors[Math.floor(Math.random() * colors.length)], size: 2 + Math.random() * 3, life: 0, maxLife: 40 + Math.random() * 40, type: Math.random() > 0.5 ? 'spark' : 'confetti', rotation: Math.random() * Math.PI * 2 });
        }
      };

      let animFrame: number;
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed > 8000) { ctx.clearRect(0, 0, canvas.width, canvas.height); setShowFireworks(false); return; }
        ctx.fillStyle = 'rgba(5, 11, 24, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (elapsed < 6000 && Math.random() > 0.9) createExplosion(Math.random() * canvas.width, Math.random() * canvas.height * 0.6);
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life++;
          if (p.life >= p.maxLife) { particles.splice(i, 1); continue; }
          const alpha = 1 - p.life / p.maxLife;
          ctx.save(); ctx.globalAlpha = alpha; ctx.translate(p.x, p.y); ctx.rotate(p.rotation); ctx.fillStyle = p.color;
          if (p.type === 'spark') { ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.fill(); }
          else { ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2); }
          ctx.restore();
        }
        animFrame = requestAnimationFrame(animate);
      };
      createExplosion(canvas.width * 0.3, canvas.height * 0.3);
      createExplosion(canvas.width * 0.7, canvas.height * 0.25);
      createExplosion(canvas.width * 0.5, canvas.height * 0.4);
      animate();
      return () => cancelAnimationFrame(animFrame);
    }, []);
    return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9998, pointerEvents: 'none' }} />;
  };

  /* ═══════════════════════════════════════════════
     عرض الصفحة الرئيسية
     ═══════════════════════════════════════════════ */

  const renderHome = () => {
    const sortedQuestions = [...questions].sort((a, b) => a.page - b.page);
    const courseQuestions = questions.filter(q => q.courseName === selectedCourse?.name);

    return (
      <div className="pattern-islamic pattern-islamic-bg" dir="rtl" style={{ overflowX: 'hidden' }}>
        <div className="relative z-10 flex-1 flex flex-col" style={{ minHeight: '100vh' }}>
          <header className="text-center pt-4 pb-3 px-4">
            <div className="mb-3">
              <div className="animate-float" style={{ width: 80, height: 80, margin: '0 auto', background: 'linear-gradient(135deg, #f5c542, #ffd700)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>📖</div>
            </div>
            <h1 className="text-2xl md:text-4xl font-black mb-3 title-golden text-gradient text-elegant" style={{ fontFamily: "'Amiri', 'Tajawal', 'Cairo', serif" }}>منشئ اختبارات القرآن الكريم</h1>
            <p className="text-glow-gold text-sm md:text-lg text-elegant font-bold">اختر الدورة، أضف الأسئلة يدوياً، ثم اضغط توليد</p>
            {!quranDataLoaded && (
              <div style={{ marginTop: 8, background: 'rgba(245, 197, 66, 0.15)', border: '1px solid rgba(245, 197, 66, 0.3)', borderRadius: 8, padding: '6px 16px', display: 'inline-block' }}>
                <span style={{ color: '#f5c542', fontSize: 14 }}>⏳ جاري تحميل بيانات القرآن...</span>
              </div>
            )}
            {quranDataLoaded && (
              <div style={{ marginTop: 8, background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: 8, padding: '6px 16px', display: 'inline-block' }}>
                <span style={{ color: '#22c55e', fontSize: 14 }}>✅ تم تحميل جميع السور ({Object.keys(surahCache).length} سورة)</span>
              </div>
            )}
          </header>

          <main className="flex-1 max-w-6xl mx-auto w-full px-4 pb-6">
            <div className="card-glass mb-4">
              <div className="border-b p-4" style={{ background: 'rgba(8, 20, 43, 0.95)', borderColor: 'rgba(245, 197, 66, 0.25)' }}>
                <h2 className="text-2xl font-black flex items-center gap-3 text-glow-white-bright text-elegant" style={{ fontFamily: "'Amiri', 'Tajawal', 'Cairo', serif" }}>
                  <span className="text-3xl">📚</span><span className="text-gradient title-golden">اختر الدورة</span>
                </h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {COURSES_DATA.map((course) => (
                    <button key={course.name} onClick={() => handleCourseSelect(course)}
                      className={`${selectedCourse?.name === course.name ? 'btn-crimson-active' : 'btn-crimson-inactive'} ${flashCourse === course.name ? 'btn-gold-flash' : ''}`}
                      style={selectedCourse?.name === course.name ? { transform: 'scale(1.05)' } : {}}>
                      <span className="text-elegant" style={{ fontFamily: "'Amiri', 'Tajawal', 'Cairo', serif" }}>{course.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-center mb-3">
              <button onClick={() => navigateTo('allResults')} style={{ background: 'linear-gradient(45deg, #1f5eff, #245dff)', border: 'none', padding: '12px 24px', borderRadius: 24, fontSize: 16, fontWeight: 700, color: '#ffffff', cursor: 'pointer', boxShadow: '0 8px 25px rgba(37, 99, 255, 0.4)' }}>📜 عرض جميع النتائج</button>
            </div>

            <div style={{ textAlign: 'center', padding: '20px 0 10px 0', marginTop: 8 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(8, 20, 43, 0.5)', border: '1px solid rgba(255, 215, 0, 0.2)', borderRadius: 16, padding: '12px 28px' }}>
                <span className="designer-credit-sparkle" style={{ fontSize: 20 }}>✦</span>
                <span className="designer-credit" style={{ fontFamily: "'Amiri', 'Tajawal', 'Cairo', serif", fontSize: 22, direction: 'rtl' }}>أبوعبدالملك AR</span>
                <span className="designer-credit-sparkle" style={{ fontSize: 20, animationDelay: '0.5s' }}>✦</span>
              </div>
            </div>

            {selectedCourse && (
              <div className="grid lg:grid-cols-3 gap-4">
                <div className="card-glass">
                  <div className="border-b p-3" style={{ background: 'rgba(8, 20, 43, 0.95)', borderColor: 'rgba(245, 197, 66, 0.25)' }}>
                    <h2 className="text-xl font-black flex items-center gap-2 text-glow-white-bright text-elegant" style={{ fontFamily: "'Amiri', 'Tajawal', 'Cairo', serif" }}>
                      <span className="text-2xl">📖</span><span className="text-gradient">اختر السورة</span>
                    </h2>
                    <p className="text-xs font-medium text-glow-gold" style={{ color: '#fff5cc' }}>نطاق الصفحات: {selectedCourse.pageStart} - {selectedCourse.pageEnd}</p>
                  </div>
                  <div className="p-3">
                    <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto custom-scrollbar">
                      {courseSurahs.map((surah) => (
                        <button key={surah} onClick={() => handleSurahSelect(surah)}
                          className={`${selectedSurah === surah ? 'btn-crimson-active' : 'btn-crimson-inactive'} ${flashSurah === surah ? 'btn-gold-flash' : ''}`}
                          style={{ ...(selectedSurah === surah ? { transform: 'scale(1.05)' } : {}), padding: 10, fontSize: 12, height: 40, fontWeight: 700 }}>
                          {surah}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                  {selectedSurah && (
                    <div className="card-glass">
                      <div className="border-b p-4 flex items-center justify-between flex-wrap gap-2" style={{ background: 'rgba(10, 22, 40, 0.95)', borderColor: 'rgba(245, 197, 66, 0.25)' }}>
                        <div className="flex-1">
                          <h2 className="text-xl font-black mb-1 text-glow-white-bright text-elegant" style={{ fontFamily: "'Amiri', 'Tajawal', 'Cairo', serif" }}>سورة {selectedSurah}</h2>
                          <p className="text-xs font-medium text-glow-gold" style={{ color: '#fff5cc' }}>
                            نطاق الدورة: صفحة {selectedCourse.pageStart} - {selectedCourse.pageEnd}
                            {surahData.length > 0 && <span> | عدد الآيات: {surahData.length}</span>}
                          </p>
                        </div>
                        <button onClick={() => setSelection({ active: false, startIdx: null, endIdx: null })} style={{ background: 'rgba(8, 20, 43, 0.72)', border: '2px solid rgba(245, 197, 66, 0.25)', color: '#fff5cc', padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}>إلغاء التحديد</button>
                      </div>
                      <div className="p-4">
                        {loading ? (
                          <div className="text-center py-8 text-glow-gold text-elegant">
                            <div style={{ fontSize: 40, marginBottom: 12 }}>📖</div>
                            <div>جاري تحميل الآيات...</div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-between mb-3 p-3" style={{ background: 'rgba(8, 20, 43, 0.72)', border: '2px solid rgba(245, 197, 66, 0.25)', borderRadius: 12 }}>
                              <span className="font-black text-sm flex items-center gap-2 text-glow-gold text-elegant"><span className="text-lg">📏</span>حجم الخط</span>
                              <div className="flex items-center gap-2">
                                <button onClick={() => setVerseFontSize(prev => Math.max(14, prev - 2))} style={{ background: 'rgba(8, 20, 43, 0.72)', border: '2px solid rgba(245, 197, 66, 0.25)', color: '#fff5cc', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                                <span style={{ fontWeight: 'bold', fontSize: 18, color: '#fff5cc', padding: '8px 16px' }}>{verseFontSize}</span>
                                <button onClick={() => setVerseFontSize(prev => Math.min(36, prev + 2))} style={{ background: 'rgba(8, 20, 43, 0.72)', border: '2px solid rgba(245, 197, 66, 0.25)', color: '#fff5cc', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>+</button>
                              </div>
                            </div>
                            <div className="custom-scrollbar" style={{ background: 'rgba(8, 20, 43, 0.72)', border: '2px solid rgba(245, 197, 66, 0.25)', borderRadius: 12, padding: 16, maxHeight: 400, overflowY: 'auto' }}>
                              <div className="leading-loose text-right" style={{ fontSize: verseFontSize + 'px', fontFamily: "'Traditional Arabic', 'Scheherazade New', Arial", direction: 'rtl' }}>
                                {surahData.map((verse, index) => {
                                  let hl: React.CSSProperties = {};
                                  let ts: React.CSSProperties = { color: '#ffffff' };
                                  if (selection.startIdx !== null && selection.endIdx !== null) {
                                    const s = Math.min(selection.startIdx, selection.endIdx);
                                    const e = Math.max(selection.startIdx, selection.endIdx);
                                    if (index >= s && index <= e) { hl = { background: 'rgba(255, 215, 0, 0.6)' }; ts = { color: '#000000' }; }
                                  } else if (selection.active && selection.startIdx === index) {
                                    hl = { background: 'rgba(255, 215, 0, 0.8)', borderRadius: 4 };
                                  }
                                  return (
                                    <span key={index} onClick={() => handleVerseClick(index)} style={{ cursor: 'pointer', display: 'inline-block', padding: '6px', borderRadius: 4, transition: 'all 0.3s', ...hl, ...ts }}>
                                      {verse.text}<span style={{ color: '#f5c542', fontSize: 16, fontWeight: 600, marginRight: 8 }}>({verse.numberInSurah})</span>
                                    </span>
                                  );
                                })}
                              </div>
                              <p className="text-sm mt-4 text-glow-gold text-elegant" style={{ background: 'rgba(8, 20, 43, 0.72)', border: '2px solid rgba(245, 197, 66, 0.25)', padding: 12, borderRadius: 8 }}>💡 اضغط على بداية الموضع ثم نهايته. سيتم حفظ السؤال تلقائياً.</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="card-glass">
                    <div className="border-b-2 p-4" style={{ background: 'rgba(10, 22, 40, 0.95)', borderColor: 'rgba(245, 197, 66, 0.25)' }}>
                      <h2 className="text-xl font-black flex items-center gap-2 text-glow-white-bright text-elegant" style={{ fontFamily: "'Amiri', 'Tajawal', 'Cairo', serif" }}>
                        <span className="text-2xl">❓</span><span className="text-gradient">بنك الأسئلة</span>
                      </h2>
                    </div>
                    <div className="p-4 space-y-3">
                      <div style={{ background: 'rgba(8, 20, 43, 0.72)', border: '2px solid rgba(245, 197, 66, 0.25)', padding: 12, borderRadius: 8, fontSize: 14 }}>
                        <div className="flex justify-between items-center text-glow-gold text-elegant" style={{ marginBottom: 4 }}><span>الدورة:</span><strong style={{ color: '#fff5cc' }}>{selectedCourse.name}</strong></div>
                        <div className="flex justify-between items-center text-glow-gold text-elegant" style={{ marginBottom: 4 }}><span>نطاق الصفحات:</span><strong style={{ color: '#fff5cc' }}>{selectedCourse.pageStart} - {selectedCourse.pageEnd}</strong></div>
                        <div className="flex justify-between items-center text-glow-gold text-elegant" style={{ marginBottom: 4 }}><span>نظام التوليد:</span><strong style={{ color: '#fff5cc' }}>{getGenerationRule(selectedCourse)}</strong></div>
                        <div className="flex justify-between items-center text-glow-gold text-elegant"><span>الأسئلة المحفوظة:</span><strong style={{ color: '#fff5cc' }}>{courseQuestions.length}</strong></div>
                      </div>
                      <button onClick={generateFinalTest} disabled={generating} style={{ width: '100%', background: 'linear-gradient(90deg, #ffd700 0%, #b8860b 50%, #ffd700 100%)', color: '#0a1628', fontWeight: 900, border: '2px solid #ffd700', borderRadius: 12, padding: 16, fontSize: 18, cursor: generating ? 'not-allowed' : 'pointer', opacity: generating ? 0.5 : 1 }}>
                        {generating ? '⏳ جاري التوليد...' : '🏆 توليد الأسئلة'}
                      </button>
                      <div style={{ maxHeight: 300, overflowY: 'auto' }} className="custom-scrollbar">
                        {sortedQuestions.length === 0 ? (
                          <p className="text-center text-glow-gold text-elegant" style={{ padding: 20 }}>لا توجد أسئلة محفوظة. اختر سورة وأضف أسئلة يدوياً.</p>
                        ) : sortedQuestions.map((q, idx) => (
                          <div key={q.surah + '-' + q.from + '-' + q.page + '-' + idx} onClick={() => deleteQuestion(q)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(8, 20, 43, 0.72)', border: '2px solid rgba(245, 197, 66, 0.25)', borderRadius: 12, padding: 12, marginBottom: 8, cursor: 'pointer', transition: 'all 0.3s' }}>
                            <div>
                              <strong style={{ color: '#fff5cc', fontFamily: "'Amiri', serif" }}>{q.surah}</strong>
                              <div style={{ marginTop: 4 }}>
                                <span className="badge">من {q.from} إلى {q.to}</span>
                                <span style={{ color: '#fff5cc', marginRight: 8 }}>صفحة {q.page} - جزء {q.juz}</span>
                              </div>
                            </div>
                            <span style={{ color: '#ff6b6b', fontSize: 20 }}>🗑️</span>
                          </div>
                        ))}
                      </div>
                      {sortedQuestions.length > 0 && (
                        <button onClick={clearAllQuestions} style={{ width: '100%', background: 'linear-gradient(90deg, #ff6b6b, #ee5a5a)', color: '#ffffff', fontWeight: 900, border: '2px solid #ffd700', borderRadius: 12, padding: 12, fontSize: 16, cursor: 'pointer' }}>🗑️ مسح جميع الأسئلة</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════
     عرض بيانات الطالب
     ═══════════════════════════════════════════════ */

  const renderStudentInfo = () => (
    <div className="pattern-islamic" dir="rtl">
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-6">
        <BackButton />
        <div className="card-glass">
          <div className="border-b p-4" style={{ background: 'rgba(8, 20, 43, 0.95)', borderColor: 'rgba(245, 197, 66, 0.25)' }}>
            <h2 className="text-2xl font-black text-glow-white-bright text-elegant" style={{ fontFamily: "'Amiri', 'Tajawal', 'Cairo', serif" }}>📝 بيانات الطالب</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: '👤 اسم الطالب', key: 'name' as const, required: true, type: 'text', placeholder: 'أدخل اسم الطالب' },
              { label: '📅 تاريخ الميلاد', key: 'birthDate' as const, required: true, type: 'date', placeholder: '' },
              { label: '📍 مكان الميلاد', key: 'birthPlace' as const, required: false, type: 'text', placeholder: 'أدخل مكان الميلاد' },
              { label: '🏢 اسم المركز', key: 'center' as const, required: false, type: 'text', placeholder: 'أدخل اسم المركز' },
              { label: '🎓 اسم المحفظ', key: 'teacher' as const, required: true, type: 'text', placeholder: 'أدخل اسم المحفظ' },
              { label: '🏛️ المحافظة', key: 'governorate' as const, required: false, type: 'text', placeholder: 'أدخل المحافظة' }
            ].map(field => (
              <div key={field.key}>
                <label style={{ display: 'block', color: '#fff5cc', fontWeight: 700, marginBottom: 8 }}>
                  {field.label}{field.required && <span style={{ color: '#f87171' }}> *</span>}
                </label>
                <input
                  type={field.type}
                  className="quran-input"
                  value={studentInfo[field.key]}
                  onChange={(e) => setStudentInfo(prev => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                />
              </div>
            ))}
            <div style={{ gridColumn: '1 / -1', marginTop: 16 }}>
              <button onClick={handleStartTest} style={{ width: '100%', background: 'linear-gradient(90deg, #ffd700 0%, #b8860b 50%, #ffd700 100%)', color: '#0a1628', fontWeight: 900, border: '2px solid #ffd700', borderRadius: 12, padding: 16, fontSize: 18, cursor: 'pointer' }}>🏆 بدء الاختبار</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════
     عرض الاختبار
     ═══════════════════════════════════════════════ */

  const renderTest = () => {
    const currentQ = testQuestions[currentQuestionIndex];
    if (!currentQ) return null;

    return (
      <div className="pattern-islamic" dir="rtl">
        <div className="relative z-10 max-w-7xl mx-auto px-2 py-4">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(8, 20, 43, 0.95)', border: '2px solid rgba(245, 197, 66, 0.25)', borderRadius: 12, padding: '6px 10px', marginBottom: 8, gap: 8, flexWrap: 'wrap' }}>
            <BackButton />
            <h2 style={{ fontSize: 13, fontWeight: 700, color: '#fff5cc', textAlign: 'left', flex: 1 }}>{selectedCourse?.name} | سؤال {currentQuestionIndex + 1}/{testQuestions.length}</h2>
          </div>

          {/* الصفحات المصورة للقرآن - استدعاء تلقائي */}
          <QuranPagesViewer question={currentQ} surahCache={surahCache} />

          <div style={{ background: 'rgba(8, 20, 43, 0.95)', border: '2px solid rgba(245, 197, 66, 0.25)', borderRadius: 12, padding: 10, marginBottom: 8 }}>
            <h3 style={{ color: '#fff5cc', fontWeight: 700, marginBottom: 8, textAlign: 'center', fontSize: 14 }}>اختر الأخطاء إذا وجدت:</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 8 }}>
              <button onClick={() => handleErrorClick('small', 0.5)} style={{ background: 'linear-gradient(180deg, #10224d, #09142e)', border: '1px solid rgba(245, 197, 66, 0.25)', padding: 10, borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#ffffff', cursor: 'pointer', minHeight: 44 }}>❌ خطأ صغير (0.5)</button>
              <button onClick={() => handleErrorClick('medium', 1)} style={{ background: 'linear-gradient(180deg, #10224d, #09142e)', border: '1px solid rgba(245, 197, 66, 0.25)', padding: 10, borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#ffffff', cursor: 'pointer', minHeight: 44 }}>⚠️ خطأ متوسط (1)</button>
              <button onClick={() => handleErrorClick('position', 3)} style={{ background: 'linear-gradient(180deg, #10224d, #09142e)', border: '1px solid rgba(245, 197, 66, 0.25)', padding: 10, borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#ffffff', cursor: 'pointer', minHeight: 44 }}>🔄 تغيير موضع (3)</button>
              <button onClick={() => setShowWeaknessDialog(true)} style={{ background: 'linear-gradient(180deg, #10224d, #09142e)', border: '1px solid rgba(245, 197, 66, 0.25)', padding: 10, borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#ffffff', cursor: 'pointer', minHeight: 44 }}>📉 ضعف التلاوة</button>
            </div>

            {showWeaknessDialog && (
              <div style={{ background: 'rgba(8, 20, 43, 0.95)', border: '2px solid rgba(245, 197, 66, 0.5)', borderRadius: 12, padding: 12, marginBottom: 12 }}>
                <h4 style={{ color: '#fff5cc', marginBottom: 8 }}>اختر درجة ضعف التلاوة:</h4>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[1, 2, 3, 5, 10].map(v => (
                    <button key={v} onClick={() => handleWeaknessClick(v)} style={{ background: '#ffd700', color: '#000', padding: '8px 16px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>{v} {v === 1 ? 'درجة' : 'درجات'}</button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ background: 'rgba(8, 20, 43, 0.72)', border: '1px solid rgba(245, 197, 66, 0.15)', borderRadius: 8, padding: 6, marginBottom: 8, textAlign: 'center', fontSize: 12, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4 }}>
              <span style={{ color: '#fff5cc' }}>صغير: <strong style={{ color: '#f5c542' }}>{errors.small}</strong></span>
              <span style={{ color: '#fff5cc' }}>متوسط: <strong style={{ color: '#f5c542' }}>{errors.medium}</strong></span>
              <span style={{ color: '#fff5cc' }}>تغيير: <strong style={{ color: '#f5c542' }}>{errors.position}</strong></span>
              <span style={{ color: '#fff5cc' }}>ضعف: <strong style={{ color: '#f5c542' }}>{errors.weakness}</strong></span>
            </div>

            <button onClick={handleQuestionComplete} style={{ width: '100%', background: 'linear-gradient(90deg, #ffd700 0%, #b8860b 50%, #ffd700 100%)', color: '#0a1628', fontWeight: 900, border: '2px solid #ffd700', borderRadius: 12, padding: 12, fontSize: 16, cursor: 'pointer', minHeight: 48 }}>
              ✓ {currentQuestionIndex === testQuestions.length - 1 ? 'عرض النتيجة' : 'السؤال التالي'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════
     عرض النتائج
     ═══════════════════════════════════════════════ */

  const renderResults = () => {
    if (!testResult) return null;
    const scoreTier = getScoreTier(testResult.finalScore);

    return (
      <div className="pattern-islamic" dir="rtl">
        {showFireworks && <FireworksCanvas />}
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-6">
          <BackButton />
          <div className="card-glass mb-4" style={{ borderColor: scoreTier.borderColor, borderWidth: 2 }}>
            <div className="border-b p-8" style={{ background: 'rgba(8, 20, 43, 0.95)', borderColor: scoreTier.borderColor }}>
              <div style={{ textAlign: 'center' }}>
                {scoreTier.tier !== 'fail' ? (
                  <>
                    <div style={{ fontSize: 80, marginBottom: 8, filter: scoreTier.tier === 'gold' ? 'drop-shadow(0 0 20px rgba(255,215,0,0.8))' : scoreTier.tier === 'silver' ? 'drop-shadow(0 0 20px rgba(192,192,192,0.8))' : 'drop-shadow(0 0 20px rgba(205,127,50,0.8))', animation: 'trophyBounce 1.5s ease-in-out infinite' }}>{scoreTier.cupEmoji}</div>
                    <p style={{ color: scoreTier.color, fontSize: 22, fontWeight: 800, marginBottom: 8, textShadow: `0 0 10px ${scoreTier.color}80` }}>{scoreTier.label}</p>
                  </>
                ) : (
                  <div style={{ fontSize: 60, marginBottom: 8, filter: 'grayscale(0.5)' }}>😔</div>
                )}
                <p style={{ color: '#fff5cc', marginBottom: 8, fontSize: 16 }}>الدرجة النهائية</p>
                <p style={{ fontSize: 'clamp(40px, 12vw, 64px)', fontWeight: 900, background: scoreTier.gradient, backgroundSize: '200% auto', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'goldenShimmer 3s linear infinite', fontFamily: "'Amiri', serif" }}>{testResult.finalScore}%</p>
                {scoreTier.tier === 'fail' && (
                  <div style={{ marginTop: 12, padding: '12px 24px', background: 'rgba(255,107,107,0.15)', border: '2px solid rgba(255,107,107,0.4)', borderRadius: 12, display: 'inline-block' }}>
                    <p style={{ color: '#ff6b6b', fontSize: 28, fontWeight: 900, fontFamily: "'Amiri', 'Tajawal', serif" }}>حظاً أوفر</p>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div style={{ background: 'rgba(8, 20, 43, 0.72)', border: '2px solid rgba(245, 197, 66, 0.25)', borderRadius: 12, padding: 16 }}>
                <h3 style={{ color: '#fff5cc', fontWeight: 700, marginBottom: 12 }}>📚 الدورة</h3>
                <p style={{ color: '#ffffff', fontSize: 18 }}>{testResult.courseName}</p>
              </div>
              <div style={{ background: 'rgba(8, 20, 43, 0.72)', border: '2px solid rgba(245, 197, 66, 0.25)', borderRadius: 12, padding: 16 }}>
                <h3 style={{ color: '#fff5cc', fontWeight: 700, marginBottom: 12 }}>🔴 الأخطاء</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 12 }}>
                  <div style={{ color: '#ffffff' }}>• خطأ صغير (0.5): <strong style={{ color: '#fff5cc' }}>{testResult.errors.small}</strong></div>
                  <div style={{ color: '#ffffff' }}>• خطأ متوسط (1): <strong style={{ color: '#fff5cc' }}>{testResult.errors.medium}</strong></div>
                  <div style={{ color: '#ffffff' }}>• تغيير الموضع (3): <strong style={{ color: '#fff5cc' }}>{testResult.errors.position}</strong></div>
                  <div style={{ color: '#ffffff' }}>• ضعف التلاوة: <strong style={{ color: '#fff5cc' }}>{testResult.errors.weakness}</strong></div>
                </div>
              </div>
              <div style={{ background: 'rgba(8, 20, 43, 0.72)', border: '2px solid rgba(245, 197, 66, 0.25)', borderRadius: 12, padding: 16 }}>
                <h3 style={{ color: '#fff5cc', fontWeight: 700, marginBottom: 12 }}>👤 بيانات الطالب</h3>
                <div style={{ color: '#ffffff', lineHeight: 2 }}>
                  <div>الاسم: <strong style={{ color: '#fff5cc' }}>{testResult.studentInfo.name}</strong></div>
                  <div>المحفظ: <strong style={{ color: '#fff5cc' }}>{testResult.studentInfo.teacher}</strong></div>
                  <div>التاريخ: <strong style={{ color: '#fff5cc' }}>{testResult.date}</strong></div>
                  <div>الوقت: <strong style={{ color: '#fff5cc' }}>{testResult.time}</strong></div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                <button onClick={shareOnWhatsApp} style={{ width: '100%', background: 'linear-gradient(90deg, #25D366, #128C7E)', color: '#ffffff', fontWeight: 900, border: '2px solid #25D366', borderRadius: 12, padding: 14, fontSize: 16, cursor: 'pointer', minHeight: 48 }}>📤 مشاركة على واتساب</button>
                <button onClick={() => {
                  if (confirm('هل أنت متأكد من حذف هذه النتيجة؟')) {
                    const idx = allResults.findIndex(r => r.finalScore === testResult!.finalScore && r.date === testResult!.date && r.studentInfo.name === testResult!.studentInfo.name);
                    if (idx !== -1) deleteResult(idx);
                    setTestResult(null);
                    goBack();
                  }
                }} style={{ width: '100%', background: 'linear-gradient(90deg, #ff6b6b, #ee5a5a)', color: '#ffffff', fontWeight: 900, border: '2px solid #ff6b6b', borderRadius: 12, padding: 14, fontSize: 16, cursor: 'pointer', minHeight: 48 }}>🗑️ حذف النتيجة</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════
     عرض جميع النتائج
     ═══════════════════════════════════════════════ */

  const renderAllResults = () => (
    <div className="pattern-islamic" dir="rtl">
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-6">
        <BackButton />
        <div className="card-glass">
          <div className="border-b p-4" style={{ background: 'rgba(8, 20, 43, 0.95)', borderColor: 'rgba(245, 197, 66, 0.25)' }}>
            <h2 className="text-2xl font-black text-glow-white-bright text-elegant" style={{ fontFamily: "'Amiri', 'Tajawal', 'Cairo', serif" }}>📜 جميع النتائج</h2>
          </div>
          <div className="p-4 custom-scrollbar" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {allResults.length === 0 ? (
              <p className="text-center text-glow-gold text-elegant" style={{ padding: 40 }}>لا توجد نتائج محفوظة بعد</p>
            ) : allResults.map((result, index) => {
              const resultTier = getScoreTier(result.finalScore);
              return (
                <div key={'result-' + index + '-' + result.date} style={{ background: 'rgba(8, 20, 43, 0.72)', border: `2px solid ${resultTier.borderColor}40`, borderRadius: 12, padding: 16, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                    <div>
                      <h3 style={{ color: '#fff5cc', fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{result.studentInfo.name}</h3>
                      <p style={{ color: '#ffffff', fontSize: 14 }}>{result.courseName} - {result.date}</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      {resultTier.tier !== 'fail' && <div style={{ fontSize: 24, marginBottom: 2 }}>{resultTier.cupEmoji}</div>}
                      <p style={{ fontSize: 24, fontWeight: 900, color: resultTier.color }}>{result.finalScore}%</p>
                      {resultTier.tier === 'fail' && <p style={{ fontSize: 12, color: '#ff6b6b', fontWeight: 700 }}>حظاً أوفر</p>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button onClick={() => shareResultOnWhatsApp(result)} style={{ flex: 1, background: 'linear-gradient(90deg, #25D366, #128C7E)', color: '#ffffff', fontWeight: 700, border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>📤 مشاركة</button>
                    <button onClick={() => deleteResult(index)} style={{ flex: 1, background: 'linear-gradient(90deg, #ff6b6b, #ee5a5a)', color: '#ffffff', fontWeight: 700, border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>🗑️ حذف</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════
     العرض الرئيسي
     ═══════════════════════════════════════════════ */

  return (
    <>
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={'toast' + (toast.isError ? ' error' : '')}>
            <div className="text-glow-white-bright font-bold text-elegant" style={{ fontSize: 16 }}>{toast.title}</div>
            <div className="text-glow-gold text-elegant" style={{ fontSize: 14, marginTop: 4 }}>{toast.description}</div>
          </div>
        ))}
      </div>
      {viewMode === 'home' && renderHome()}
      {viewMode === 'studentInfo' && renderStudentInfo()}
      {viewMode === 'test' && renderTest()}
      {viewMode === 'results' && renderResults()}
      {viewMode === 'allResults' && renderAllResults()}
    </>
  );
}
