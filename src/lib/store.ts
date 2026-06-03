/* ═══════════════════════════════════════════════
   مخزن Zustand لتطبيق اختبارات القرآن الكريم
   ═══════════════════════════════════════════════ */

import { create } from 'zustand';
import { loadQuranData, type QuranDataMap } from '@/lib/quran-data-loader';
import type { QuranVerseData } from '@/lib/quran-pages';
import {
  type ViewMode, type CourseData, type Question, type QuranVerse,
  type StudentInfo, type TestErrors, type TestResult,
  SURAH_NAMES, SURAH_JUZ,
} from './quran-constants';

interface ToastItem {
  id: number;
  title: string;
  description: string;
  isError: boolean;
}

interface QuranStore {
  /* --- حالة العرض --- */
  viewMode: ViewMode;
  viewHistory: ViewMode[];
  navigateTo: (view: ViewMode) => void;
  goBack: () => void;

  /* --- الدورة والسورة --- */
  selectedCourse: CourseData | null;
  courseSurahs: string[];
  selectedSurah: string;
  surahData: QuranVerse[];
  loading: boolean;
  surahCache: Record<string, QuranVerseData[]>;
  quranDataLoaded: boolean;

  /* --- الأسئلة --- */
  questions: Question[];
  selection: { active: boolean; startIdx: number | null; endIdx: number | null };
  verseFontSize: number;

  /* --- الاختبار --- */
  generating: boolean;
  testQuestions: Question[];
  errors: TestErrors;
  testResult: TestResult | null;
  allResults: TestResult[];
  studentInfo: StudentInfo;
  currentQuestionIndex: number;
  completedQuestions: number[];
  positionChangedQuestions: number[];
  showWeaknessDialog: boolean;

  /* --- المشاهدات --- */
  showFireworks: boolean;
  flashCourse: string | null;
  flashSurah: string | null;
  previewQuestion: Question | null;
  showPagePreview: boolean;

  /* --- الإشعارات --- */
  toasts: ToastItem[];
  toastIdCounter: number;
  showToast: (title: string, description: string, isError?: boolean) => void;

  /* --- الإجراءات --- */
  handleCourseSelect: (course: CourseData) => void;
  handleSurahSelect: (surahName: string) => void;
  handleVerseClick: (index: number) => void;
  deleteQuestion: (q: Question) => void;
  clearAllQuestions: () => void;
  handleQuestionPreview: (q: Question) => void;
  closePagePreview: () => void;
  cancelSelection: () => void;
  setVerseFontSize: (size: number) => void;
  generateFinalTest: () => void;
  handleStartTest: () => void;
  handleQuestionComplete: () => void;
  handlePrevQuestion: () => void;
  handleErrorClick: (type: 'small' | 'medium' | 'position' | 'weakness', value: number) => void;
  handleWeaknessClick: (value: number) => void;
  setShowWeaknessDialog: (show: boolean) => void;
  shareOnWhatsApp: () => void;
  shareResultOnWhatsApp: (result: TestResult) => void;
  deleteResult: (index: number) => void;
  setStudentInfo: (info: Partial<StudentInfo>) => void;
  loadQuranDataAction: () => void;
  loadSavedData: () => void;
}

export const useQuranStore = create<QuranStore>((set, get) => ({
  /* --- حالة العرض --- */
  viewMode: 'home',
  viewHistory: [],

  navigateTo: (view) => {
    const { viewMode, viewHistory } = get();
    set({ viewHistory: [...viewHistory, viewMode], viewMode: view });
  },

  goBack: () => {
    const { viewHistory } = get();
    if (viewHistory.length > 0) {
      const prevView = viewHistory[viewHistory.length - 1];
      set({ viewHistory: viewHistory.slice(0, -1), viewMode: prevView });
    } else {
      set({ viewMode: 'home' });
    }
  },

  /* --- الدورة والسورة --- */
  selectedCourse: null,
  courseSurahs: [],
  selectedSurah: '',
  surahData: [],
  loading: false,
  surahCache: {},
  quranDataLoaded: false,

  /* --- الأسئلة --- */
  questions: [],
  selection: { active: false, startIdx: null, endIdx: null },
  verseFontSize: 20,

  /* --- الاختبار --- */
  generating: false,
  testQuestions: [],
  errors: { small: 0, medium: 0, position: 0, weakness: 0 },
  testResult: null,
  allResults: [],
  studentInfo: { name: '', birthDate: '', birthPlace: '', center: '', teacher: '', governorate: '' },
  currentQuestionIndex: 0,
  completedQuestions: [],
  positionChangedQuestions: [],
  showWeaknessDialog: false,

  /* --- المشاهدات --- */
  showFireworks: false,
  flashCourse: null,
  flashSurah: null,
  previewQuestion: null,
  showPagePreview: false,

  /* --- الإشعارات --- */
  toasts: [],
  toastIdCounter: 0,

  showToast: (title, description, isError = false) => {
    const id = get().toastIdCounter;
    set({ toastIdCounter: id + 1 });
    const toastItem = { id, title, description, isError };
    set(prev => ({ toasts: [...prev.toasts, toastItem] }));
    setTimeout(() => {
      set(prev => ({ toasts: prev.toasts.filter(t => t.id !== id) }));
    }, 3000);
  },

  /* --- إجراءات الدورة والسورة --- */

  handleCourseSelect: (course) => {
    const { showToast } = get();
    set({ flashCourse: course.name });
    setTimeout(() => set({ flashCourse: null }), 800);

    const startIdx = SURAH_NAMES.indexOf(course.start);
    const endIdx = SURAH_NAMES.indexOf(course.end);
    set({
      selectedCourse: course,
      courseSurahs: SURAH_NAMES.slice(startIdx, endIdx + 1),
      selectedSurah: '',
      surahData: [],
      selection: { active: false, startIdx: null, endIdx: null },
    });
    showToast('تم تحميل الدورة', course.name);
  },

  handleSurahSelect: (surahName) => {
    const { showToast, surahCache, quranDataLoaded } = get();
    set({ flashSurah: surahName });
    setTimeout(() => set({ flashSurah: null }), 800);

    const cached = surahCache[surahName];
    if (cached && cached.length > 0) {
      set({
        selectedSurah: surahName,
        surahData: cached as unknown as QuranVerse[],
        loading: false,
        selection: { active: false, startIdx: null, endIdx: null },
      });
      showToast('تم تحميل السورة', surahName + ' (' + cached.length + ' آية)');
    } else {
      set({
        selectedSurah: surahName,
        surahData: [],
        loading: false,
        selection: { active: false, startIdx: null, endIdx: null },
      });
      showToast('تنبيه', !quranDataLoaded ? 'جاري تحميل بيانات القرآن' : 'لم يتم العثور على بيانات السورة', true);
    }
  },

  /* --- إجراءات الأسئلة --- */

  handleVerseClick: (index) => {
    const { selection, surahData, selectedSurah, selectedCourse, showToast } = get();
    if (!selection.active) {
      set({ selection: { active: true, startIdx: index, endIdx: null } });
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
        juz: surahData[start].juz || (SURAH_JUZ[selectedSurah] || 1),
      };
      set(prev => ({
        questions: [...prev.questions, newQuestion],
        selection: { active: false, startIdx: null, endIdx: null },
      }));
      showToast('تمت الإضافة', 'تم إضافة السؤال من صفحة ' + newQuestion.page);
    }
  },

  deleteQuestion: (q) => {
    set(prev => ({
      questions: prev.questions.filter(item => !(item.surah === q.surah && item.from === q.from && item.page === q.page))
    }));
  },

  clearAllQuestions: () => {
    const { showToast } = get();
    if (confirm('هل أنت متأكد من مسح جميع الأسئلة؟')) {
      set({ questions: [] });
      showToast('تم المسح', 'تم مسح جميع الأسئلة');
    }
  },

  handleQuestionPreview: (q) => {
    set({ previewQuestion: q, showPagePreview: true });
  },

  closePagePreview: () => {
    set({ showPagePreview: false });
    setTimeout(() => set({ previewQuestion: null }), 300);
  },

  cancelSelection: () => {
    set({ selection: { active: false, startIdx: null, endIdx: null } });
  },

  setVerseFontSize: (size) => {
    set({ verseFontSize: size });
  },

  /* --- إجراءات الاختبار --- */

  generateFinalTest: () => {
    const { selectedCourse, questions, showToast, navigateTo } = get();
    if (!selectedCourse) { showToast('تنبيه', 'الرجاء اختيار دورة أولاً', true); return; }
    const courseQuestions = questions.filter(q => q.courseName === selectedCourse.name);
    if (courseQuestions.length < selectedCourse.questionCount) {
      showToast('تنبيه', 'تحتاج إلى ' + selectedCourse.questionCount + ' أسئلة على الأقل', true);
      return;
    }

    set({ generating: true });

    setTimeout(() => {
      const selectedQs: Question[] = [];

      // استخراج أرقام الأجزاء من اسم الدورة (مثال: "دورة 28-30" → [28, 29, 30])
      const nameMatch = selectedCourse.name.match(/(\d+)-(\d+)/);
      const juzStart = nameMatch ? parseInt(nameMatch[1]) : 1;
      const juzEnd = nameMatch ? parseInt(nameMatch[2]) : 30;
      const juzNumbers: number[] = [];
      for (let j = juzStart; j <= juzEnd; j++) {
        juzNumbers.push(j);
      }

      if (selectedCourse.type === "3juz") {
        // ═══ دورة 3 أجزاء: سؤال واحد من كل جزء ═══
        for (const juzNum of juzNumbers) {
          const juzQuestions = courseQuestions.filter(q => q.juz === juzNum);
          if (juzQuestions.length > 0) {
            const randomQ = juzQuestions[Math.floor(Math.random() * juzQuestions.length)];
            selectedQs.push(randomQ);
          } else {
            showToast('تنبيه', 'يجب إضافة سؤال واحد على الأقل من الجزء ' + juzNum, true);
            set({ generating: false });
            return;
          }
        }
      } else if (selectedCourse.type === "5juz") {
        // ═══ دورة 5 أجزاء: سؤال من كل جزء مع تخطي جزء واحد ═══
        // اختيار الأجزاء بالتساوي: نقسم الـ5 أجزاء على عدد الأسئلة
        const step = juzNumbers.length / selectedCourse.questionCount;
        for (let i = 0; i < selectedCourse.questionCount; i++) {
          const targetJuzIdx = Math.floor(i * step + step / 2);
          const targetJuz = juzNumbers[Math.min(targetJuzIdx, juzNumbers.length - 1)];
          const juzQuestions = courseQuestions.filter(q => q.juz === targetJuz);
          if (juzQuestions.length > 0) {
            const randomQ = juzQuestions[Math.floor(Math.random() * juzQuestions.length)];
            if (!selectedQs.find(sq => sq.surah === randomQ.surah && sq.from === randomQ.from && sq.page === randomQ.page)) {
              selectedQs.push(randomQ);
            }
          } else {
            // البحث عن أقرب جزء لديه أسئلة
            let found = false;
            for (const jn of juzNumbers) {
              const altQ = courseQuestions.filter(q => q.juz === jn);
              if (altQ.length > 0 && !selectedQs.find(sq => sq.juz === jn)) {
                selectedQs.push(altQ[Math.floor(Math.random() * altQ.length)]);
                found = true;
                break;
              }
            }
            if (!found) {
              showToast('تنبيه', 'لا توجد أسئلة كافية من أجزاء الدورة', true);
              set({ generating: false });
              return;
            }
          }
        }
      } else if (selectedCourse.hasJuz30) {
        // ═══ دورة 10 أو 20 جزء مع جزء 30: سؤال من جزء 30 + باقي من أجزاء متفرقة ═══
        const juz30Q = courseQuestions.filter(q => q.juz === 30);
        if (juz30Q.length > 0) {
          selectedQs.push(juz30Q[Math.floor(Math.random() * juz30Q.length)]);
        } else {
          showToast('تنبيه', 'يجب إضافة سؤال واحد على الأقل من الجزء 30', true);
          set({ generating: false });
          return;
        }
        // توزيع الأسئلة المتبقية على الأجزاء الأخرى بالتساوي
        const otherJuzNumbers = juzNumbers.filter(j => j !== 30);
        const remaining = selectedCourse.questionCount - 1;
        const step = otherJuzNumbers.length / remaining;
        for (let i = 0; i < remaining; i++) {
          const targetJuzIdx = Math.floor(i * step + step / 2);
          const targetJuz = otherJuzNumbers[Math.min(targetJuzIdx, otherJuzNumbers.length - 1)];
          const juzQuestions = courseQuestions.filter(q => q.juz === targetJuz);
          if (juzQuestions.length > 0) {
            const randomQ = juzQuestions[Math.floor(Math.random() * juzQuestions.length)];
            if (!selectedQs.find(sq => sq.surah === randomQ.surah && sq.from === randomQ.from && sq.page === randomQ.page)) {
              selectedQs.push(randomQ);
            }
          } else {
            // البحث عن بديل من جزء قريب
            let found = false;
            for (const jn of otherJuzNumbers) {
              const altQ = courseQuestions.filter(q => q.juz === jn);
              if (altQ.length > 0 && !selectedQs.find(sq => sq.juz === jn)) {
                selectedQs.push(altQ[Math.floor(Math.random() * altQ.length)]);
                found = true;
                break;
              }
            }
            if (!found) {
              const fallback = courseQuestions.filter(q => q.juz !== 30 && !selectedQs.find(sq => sq.surah === q.surah && sq.from === q.from));
              if (fallback.length > 0) {
                selectedQs.push(fallback[Math.floor(Math.random() * fallback.length)]);
              } else {
                showToast('تنبيه', 'لا توجد أسئلة كافية من أجزاء الدورة', true);
                set({ generating: false });
                return;
              }
            }
          }
        }
      } else {
        // ═══ دورة 10 أجزاء بدون جزء 30: توزيع الأسئلة على الأجزاء بالتساوي ═══
        const step = juzNumbers.length / selectedCourse.questionCount;
        for (let i = 0; i < selectedCourse.questionCount; i++) {
          const targetJuzIdx = Math.floor(i * step + step / 2);
          const targetJuz = juzNumbers[Math.min(targetJuzIdx, juzNumbers.length - 1)];
          const juzQuestions = courseQuestions.filter(q => q.juz === targetJuz);
          if (juzQuestions.length > 0) {
            const randomQ = juzQuestions[Math.floor(Math.random() * juzQuestions.length)];
            if (!selectedQs.find(sq => sq.surah === randomQ.surah && sq.from === randomQ.from && sq.page === randomQ.page)) {
              selectedQs.push(randomQ);
            }
          } else {
            let found = false;
            for (const jn of juzNumbers) {
              const altQ = courseQuestions.filter(q => q.juz === jn);
              if (altQ.length > 0 && !selectedQs.find(sq => sq.juz === jn)) {
                selectedQs.push(altQ[Math.floor(Math.random() * altQ.length)]);
                found = true;
                break;
              }
            }
            if (!found) {
              showToast('تنبيه', 'لا توجد أسئلة كافية من أجزاء الدورة', true);
              set({ generating: false });
              return;
            }
          }
        }
      }

      selectedQs.sort((a, b) => a.page - b.page);
      set({
        testQuestions: selectedQs,
        generating: false,
        errors: { small: 0, medium: 0, position: 0, weakness: 0 },
      });
      navigateTo('studentInfo');
      showToast('تم التوليد!', selectedQs.length + ' أسئلة متنوعة');
    }, 1000);
  },

  handleStartTest: () => {
    const { studentInfo, showToast, navigateTo } = get();
    if (!studentInfo.name || !studentInfo.birthDate || !studentInfo.teacher) {
      showToast('تنبيه', 'الرجاء إدخال الاسم، تاريخ الميلاد، واسم المحفظ', true);
      return;
    }
    set({
      currentQuestionIndex: 0,
      completedQuestions: [],
      positionChangedQuestions: [],
    });
    navigateTo('test');
  },

  handleQuestionComplete: () => {
    const { currentQuestionIndex, testQuestions, errors, selectedCourse, studentInfo, showToast, navigateTo } = get();
    set({ completedQuestions: [...get().completedQuestions, currentQuestionIndex] });

    if (currentQuestionIndex === testQuestions.length - 1) {
      // حساب النتيجة النهائية
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
        studentInfo: { ...studentInfo },
      };
      set(prev => ({
        testResult: result,
        allResults: [...prev.allResults, result],
        viewHistory: [...prev.viewHistory, 'test'],
        viewMode: 'results',
        showFireworks: finalScore >= 75,
      }));
    } else {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
      showToast('تمت الإجابة', 'السؤال ' + (currentQuestionIndex + 2));
    }
  },

  handlePrevQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 });
    }
  },

  handleErrorClick: (type, value) => {
    const { currentQuestionIndex, positionChangedQuestions, selectedCourse, testQuestions, questions, showToast } = get();

    if (type === 'position') {
      if (positionChangedQuestions.has(currentQuestionIndex)) {
        showToast('تنبيه', 'لايمكن تغيير الموضع مرتين', true);
        return;
      }
      set(prev => ({ errors: { ...prev.errors, position: prev.errors.position + 1 } }));
      if (selectedCourse) {
        const currentQ = testQuestions[currentQuestionIndex];
        const currentJuz = currentQ.juz;
        const sameJuzQuestions = questions.filter(q =>
          q.juz === currentJuz &&
          q.courseName === selectedCourse.name &&
          !(q.surah === currentQ.surah && q.from === currentQ.from && q.page === currentQ.page)
        );
        if (sameJuzQuestions.length > 0) {
          const newQ = sameJuzQuestions[Math.floor(Math.random() * sameJuzQuestions.length)];
          const updated = [...testQuestions];
          updated[currentQuestionIndex] = newQ;
          const newChanged = new Set(positionChangedQuestions);
          newChanged.add(currentQuestionIndex);
          set({ testQuestions: updated, positionChangedQuestions: newChanged });
          showToast('تم تغيير الموضع', 'سورة ' + newQ.surah + ' صفحة ' + newQ.page + ' (خصم 3 درجات)');
        } else {
          showToast('تنبيه', 'لا يوجد مواضع أخرى متاحة من جزء ' + currentJuz, true);
        }
      }
    } else {
      set(prev => ({ errors: { ...prev.errors, [type]: (prev.errors as Record<string, number>)[type] + 1 } }));
      showToast('تم تسجيل الخطأ', value + ' درجة');
    }
  },

  handleWeaknessClick: (value) => {
    const { showToast } = get();
    set(prev => ({ errors: { ...prev.errors, weakness: prev.errors.weakness + value }, showWeaknessDialog: false }));
    showToast('تم تسجيل الخطأ', value + ' درجات (ضعف تلاوة)');
  },

  setShowWeaknessDialog: (show) => {
    set({ showWeaknessDialog: show });
  },

  /* --- المشاركة --- */

  shareOnWhatsApp: () => {
    const { testResult } = get();
    if (!testResult) return;
    const text = '📚 اختبار حفظ القرآن الكريم\n━━━━━━━━━━━━━━━━━\n👤 اسم الطالب: ' + testResult.studentInfo.name + '\n📅 التاريخ: ' + testResult.date + '\n🕐 الوقت: ' + testResult.time + '\n👨\u200D🏫 المحفظ: ' + testResult.studentInfo.teacher + '\n━━━━━━━━━━━━━━━━━\n📖 الدورة: ' + testResult.courseName + '\n📊 النتيجة: ' + testResult.finalScore + '/100\n🔴 الأخطاء:\n• خطأ صغير: ' + testResult.errors.small + '\n• خطأ متوسط: ' + testResult.errors.medium + '\n• تغيير موضع: ' + testResult.errors.position + '\n• ضعف التلاوة: ' + testResult.errors.weakness + '\n💯 الدرجة: ' + testResult.finalScore + '%';
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
  },

  shareResultOnWhatsApp: (result) => {
    const text = '📚 اختبار القرآن\n👤 ' + result.studentInfo.name + '\n📖 ' + result.courseName + '\n📊 ' + result.finalScore + '/100';
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
  },

  deleteResult: (index) => {
    const { showToast } = get();
    if (confirm('هل أنت متأكد من حذف هذا الاختبار؟')) {
      set(prev => ({ allResults: prev.allResults.filter((_, i) => i !== index) }));
      showToast('تم الحذف', 'تم حذف الاختبار');
    }
  },

  setStudentInfo: (info) => {
    set(prev => ({ studentInfo: { ...prev.studentInfo, ...info } }));
  },

  /* --- تحميل البيانات --- */

  loadQuranDataAction: () => {
    loadQuranData(8, 1500)
      .then((data) => {
        set({ surahCache: data as unknown as Record<string, QuranVerseData[]>, quranDataLoaded: true });
      })
      .catch(e => console.error('فشل تحميل بيانات القرآن:', e));
  },

  loadSavedData: () => {
    try {
      const savedQuestions = localStorage.getItem('quran_app_questions');
      const savedResults = localStorage.getItem('quran_test_results');
      const parsedQuestions = savedQuestions ? JSON.parse(savedQuestions) : [];
      const parsedResults = savedResults ? JSON.parse(savedResults) : [];
      if (parsedQuestions.length > 0) set({ questions: parsedQuestions });
      if (parsedResults.length > 0) set({ allResults: parsedResults });
    } catch (e) { console.error('Error loading saved data:', e); }
  },
}));
