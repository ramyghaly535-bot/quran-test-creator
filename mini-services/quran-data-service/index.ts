/**
 * خدمة بيانات القرآن الكريم
 * تعمل على منفذ مستقل (3002) لتجنب ضغط خادم Next.js
 * تخدم ملف quran-data.json بكفاءة
 */

const PORT = 3002;
const DATA_PATH = new URL('../../data/quran-data.json', import.meta.url).pathname;

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (url.pathname === '/quran-data.json' || url.pathname === '/') {
      const file = Bun.file(DATA_PATH);
      return new Response(file, {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'public, max-age=31536000, immutable',
          ...corsHeaders,
        },
      });
    }

    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', service: 'quran-data' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },
});

console.log(`[QuranData] ✅ Ready on port ${PORT}`);
