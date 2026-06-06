import type { Metadata, Viewport } from "next";
import "./globals.css";
import "../../public/fonts/fonts.css";

export const metadata: Metadata = {
  title: "منشئ اختبارات القرآن الكريم",
  description: "تطبيق لإنشاء اختبارات حفظ القرآن الكريم مع نظام تقييم متكامل",
  // المسارات ستُضاف إليها basePath تلقائياً من Next.js
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "اختبارات القرآن",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c1f3d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className="antialiased"
        style={{ background: '#050b18', color: '#ffffff', fontFamily: "'Amiri', 'Tajawal', 'Cairo', serif" }}
      >
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  var bp = window.__NEXT_DATA__ && window.__NEXT_DATA__.basePath ? window.__NEXT_DATA__.basePath : '';
                  if (!bp && window.location.pathname !== '/') {
                    var s = window.location.pathname.split('/').filter(Boolean);
                    if (s.length > 0) bp = '/' + s[0];
                  }
                  navigator.serviceWorker.register(bp + '/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
