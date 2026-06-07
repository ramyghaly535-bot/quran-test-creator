import type { Metadata, Viewport } from "next";
import "./globals.css";
import "../../public/fonts/fonts.css";

// كشف basePath من متغيرات البيئة
const basePath = process.env.GITHUB_PAGES === 'true' || process.env.CI === 'true'
  ? '/quran-test-creator'
  : '';

export const metadata: Metadata = {
  title: "منشئ اختبارات القرآن الكريم",
  description: "تطبيق لإنشاء اختبارات حفظ القرآن الكريم مع نظام تقييم متكامل",
  manifest: `${basePath}/manifest.json`,
  icons: {
    icon: [
      { url: `${basePath}/icon-48.png`, sizes: "48x48", type: "image/png" },
      { url: `${basePath}/icon-192.png`, sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: `${basePath}/apple-touch-icon.png`, sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "اختبارات القرآن",
  },
  formatDetection: {
    telephone: false,
  },
  applicationName: "اختبارات القرآن",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0c1f3d" },
    { media: "(prefers-color-scheme: dark)", color: "#0c1f3d" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/* توافق الأجهزة القديمة */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-TileColor" content="#0c1f3d" />
        <meta name="msapplication-tap-highlight" content="no" />
        {/* دعم الشاشات المليئة بالحزوز */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* تحميل الخطوط مسبقاً - مع basePath */}
        <link rel="preload" href={`${basePath}/fonts/amiri-400-arabic.woff2`} as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href={`${basePath}/fonts/amiri-700-arabic.woff2`} as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href={`${basePath}/fonts/tajawal-400-arabic.woff2`} as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href={`${basePath}/fonts/tajawal-700-arabic.woff2`} as="font" type="font/woff2" crossOrigin="anonymous" />
        {/* أيقونات PWA - مع basePath */}
        <link rel="icon" type="image/png" sizes="48x48" href={`${basePath}/icon-48.png`} />
        <link rel="icon" type="image/png" sizes="192x192" href={`${basePath}/icon-192.png`} />
        <link rel="apple-touch-icon" sizes="180x180" href={`${basePath}/apple-touch-icon.png`} />
      </head>
      <body
        className="antialiased"
        style={{ background: '#050b18', color: '#ffffff', fontFamily: "'Amiri', 'Tajawal', 'Cairo', serif" }}
      >
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // تسجيل Service Worker مع دعم basePath
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  var bp = '';
                  try {
                    bp = window.__NEXT_DATA__ && window.__NEXT_DATA__.basePath ? window.__NEXT_DATA__.basePath : '';
                  } catch(e) {}
                  // كشف من اسم المضيف (GitHub Pages)
                  if (!bp && window.location.hostname.endsWith('.github.io')) {
                    var segs = window.location.pathname.split('/').filter(Boolean);
                    if (segs.length > 0) bp = '/' + segs[0];
                  }
                  if (!bp && window.location.pathname !== '/') {
                    var s = window.location.pathname.split('/').filter(Boolean);
                    var skip = ['_next','api','quran-pages','fonts','sw.js','manifest.json','index.html'];
                    var valid = s.filter(function(seg){ return skip.indexOf(seg) === -1 && !seg.endsWith('.html') && !seg.endsWith('.json') && !seg.endsWith('.js'); });
                    if (valid.length > 0) bp = '/' + valid[0];
                  }
                  navigator.serviceWorker.register(bp + '/sw.js').catch(function(){});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
