import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * API route لخدمة بيانات القرآن الكريم
 * يقرأ البيانات من مجلد data وليس public
 * أكثر كفاءة وأماناً - يدعم التخزين المؤقت
 */
export async function GET() {
  try {
    const filePath = join(process.cwd(), 'data', 'quran-data.json');
    const data = await readFile(filePath, 'utf-8');
    
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('[API] فشل قراءة بيانات القرآن:', error);
    return NextResponse.json(
      { error: 'فشل تحميل بيانات القرآن' },
      { status: 500 }
    );
  }
}
