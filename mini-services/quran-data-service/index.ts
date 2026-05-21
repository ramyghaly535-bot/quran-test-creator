/**
 * خدمة بيانات القرآن الكريم
 * تعمل على منفذ مستقل (3002) لتجنب ضغط خادم Next.js
 * تخدم ملف quran-data.json بكفاءة مع ضغط gzip
 */

const PORT = 3002;
const DATA_PATH = new URL('../../data/quran-data.json', import.meta.url).pathname;

console.log(`[QuranDataService] Starting on port ${PORT}...`);
console.log(`[QuranDataService] Data file: ${DATA_PATH}`);

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Serve quran data
    if (url.pathname === '/quran-data.json' || url.pathname === '/') {
      try {
        const file = Bun.file(DATA_PATH);
        const exists = await file.exists();
        
        if (!exists) {
          console.error(`[QuranDataService] File not found: ${DATA_PATH}`);
          return new Response(JSON.stringify({ error: 'Data file not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        // Return the file with caching headers
        return new Response(file, {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'public, max-age=31536000, immutable',
            ...corsHeaders,
          },
        });
      } catch (error) {
        console.error('[QuranDataService] Error serving data:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    // Health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', service: 'quran-data' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },
});

console.log(`[QuranDataService] ✅ Ready on port ${PORT}`);
