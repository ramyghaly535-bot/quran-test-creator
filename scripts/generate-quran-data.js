// Script to generate quran-data.json from AlQuran Cloud API
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

async function generateQuranData() {
  console.log('Fetching Quran data from API...');
  
  try {
    const response = await fetch('https://api.alquran.cloud/v1/quran/quran-uthmani');
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    const data = await response.json();
    const surahs = data.data.surahs;
    
    const result = {};
    
    for (let i = 0; i < surahs.length; i++) {
      const surah = surahs[i];
      const surahName = SURAH_NAMES[i];
      
      const verses = surah.ayahs.map(ayah => ({
        text: ayah.text,
        numberInSurah: ayah.numberInSurah,
        page: ayah.page,
        juz: ayah.juz
      }));
      
      result[surahName] = verses;
      console.log(`Processed surah ${i + 1}/114: ${surahName} (${verses.length} verses)`);
    }
    
    const fs = require('fs');
    const outputPath = './public/quran-data.json';
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
    
    const stats = fs.statSync(outputPath);
    console.log(`\nGenerated quran-data.json (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
    console.log(`Total surahs: ${Object.keys(result).length}`);
    
    let totalVerses = 0;
    for (const key of Object.keys(result)) {
      totalVerses += result[key].length;
    }
    console.log(`Total verses: ${totalVerses}`);
    
  } catch (error) {
    console.error('Error fetching Quran data:', error);
    process.exit(1);
  }
}

generateQuranData();
