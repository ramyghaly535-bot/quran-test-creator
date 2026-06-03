/* ═══════════════════════════════════════════════
   ثوابت القرآن الكريم والأنواع المشتركة
   ═══════════════════════════════════════════════ */

export const SURAH_NAMES = [
  "الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف","الأنفال","التوبة","يونس",
  "هود","يوسف","الرعد","إبراهيم","الحجر","النحل","الإسراء","الكهف","مريم","طه",
  "الأنبياء","الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم",
  "لقمان","السجدة","الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر",
  "فصلت","الشورى","الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق",
  "الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة",
  "الصف","الجمعة","المنافقون","التغابن","الطلاق","التحريم","الملك","القلم","الحاقة","المعارج",
  "نوح","الجن","المزمل","المدثر","القيامة","الإنسان","المرسلات","النبأ","النازعات","عبس",
  "التكوير","الانفطار","المطففين","الإنشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد",
  "الشمس","الليل","الضحى","الشرح","التين","العلق","القدر","البينة","الزلزلة","العاديات",
  "القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر",
  "المسد","الإخلاص","الفلق","الناس"
];

export const SURAH_JUZ: Record<string, number> = {
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
  "التحريم":29,"الملك":29,"القلم":29,"الحاقة":29,"المعارج":29,
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

export interface CourseData {
  name: string;
  start: string;
  end: string;
  type: string;
  pageStart: number;
  pageEnd: number;
  questionCount: number;
  hasJuz30: boolean;
}

export interface Question {
  surah: string;
  from: number;
  to: number;
  page: number;
  courseName: string;
  juz: number;
}

export interface QuranVerse {
  text: string;
  numberInSurah: number;
  page: number;
  juz: number;
}

export interface StudentInfo {
  name: string;
  birthDate: string;
  birthPlace: string;
  center: string;
  teacher: string;
  governorate: string;
}

export interface TestErrors {
  small: number;
  medium: number;
  position: number;
  weakness: number;
}

export interface TestResult {
  courseName: string;
  questions: Question[];
  errors: TestErrors;
  finalScore: number;
  date: string;
  time: string;
  studentInfo: StudentInfo;
}

export type ViewMode = 'home' | 'studentInfo' | 'test' | 'results' | 'allResults';

export const COURSES_DATA: CourseData[] = [
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

export function getSurahJuz(surahName: string): number {
  return SURAH_JUZ[surahName] || 1;
}

/* تحديد رقم الجزء من رقم الصفحة
   الجزء 1: صفحات 1-21 (21 صفحة)
   الجزء 2-29: كل جزء 20 صفحة
   الجزء 30: صفحات 582-604 (23 صفحة) */
export function getPageJuz(page: number): number {
  if (page <= 21) return 1;
  if (page >= 582) return 30;
  return Math.floor((page - 22) / 20) + 2;
}

/* الحصول على نطاق صفحات الجزء */
export function getJuzPageRange(juz: number): { start: number; end: number } {
  if (juz === 1) return { start: 1, end: 21 };
  if (juz === 30) return { start: 582, end: 604 };
  return { start: 22 + (juz - 2) * 20, end: 21 + (juz - 1) * 20 };
}

export function getGenerationRule(course: CourseData): string {
  const nameMatch = course.name.match(/(\d+)-(\d+)/);
  const juzStart = nameMatch ? parseInt(nameMatch[1]) : 1;
  const juzEnd = nameMatch ? parseInt(nameMatch[2]) : 30;
  const juzCount = juzEnd - juzStart + 1;

  if (course.type === "3juz") {
    return course.questionCount + ' أسئلة (سؤال واحد من كل جزء: ' + juzStart + '، ' + (juzStart + 1) + '، ' + juzEnd + ')';
  }
  if (course.hasJuz30) {
    return course.questionCount + ' أسئلة (1 من الجزء 30 + ' + (course.questionCount - 1) + ' موزعة على الأجزاء الأخرى)';
  }
  if (course.type === "5juz") {
    return course.questionCount + ' أسئلة (موزعة على ' + juzCount + ' أجزاء)';
  }
  return course.questionCount + ' أسئلة (موزعة على ' + juzCount + ' جزء)';
}

export function getScoreTier(score: number) {
  if (score >= 90) {
    return { tier: 'gold', color: '#ffd700', colorLight: '#fff5cc', gradient: 'linear-gradient(135deg, #ffd700 0%, #ffec80 50%, #ffd700 100%)', shadow: '0 0 30px rgba(255, 215, 0, 0.5)', cupEmoji: '🏆', label: 'ممتاز', borderColor: '#ffd700' };
  }
  if (score >= 80) {
    return { tier: 'silver', color: '#c0c0c0', colorLight: '#e8e8e8', gradient: 'linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 50%, #c0c0c0 100%)', shadow: '0 0 30px rgba(192, 192, 192, 0.5)', cupEmoji: '🏆', label: 'جيد جداً', borderColor: '#c0c0c0' };
  }
  if (score >= 75) {
    return { tier: 'bronze', color: '#cd7f32', colorLight: '#e8c49a', gradient: 'linear-gradient(135deg, #cd7f32 0%, #e8c49a 50%, #cd7f32 100%)', shadow: '0 0 30px rgba(205, 127, 50, 0.5)', cupEmoji: '🏆', label: 'جيد', borderColor: '#cd7f32' };
  }
  return { tier: 'fail', color: '#ff6b6b', colorLight: '#ffb3b3', gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%)', shadow: '0 0 20px rgba(255, 107, 107, 0.3)', cupEmoji: '', label: '', borderColor: '#ff6b6b' };
}
