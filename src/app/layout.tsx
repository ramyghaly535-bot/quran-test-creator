import type { Metadata } from "next";
import "./globals.css";
import "../../public/fonts/fonts.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "منشئ اختبارات القرآن الكريم",
  description: "تطبيق لإنشاء اختبارات حفظ القرآن الكريم مع نظام تقييم متكامل",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/* سكريبت معالجة خطأ PreconditionFailed على مستوى HTML - قبل تحميل React */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            // التحقق مما إذا كانت الاستجابة تحتوي على خطأ PreconditionFailed
            // هذا يعمل قبل تحميل React ويضمن إعادة المحاولة التلقائية
            var originalFetch = window.fetch;
            window.fetch = function() {
              return originalFetch.apply(this, arguments).then(function(response) {
                if (response.status === 412 || response.status === 503) {
                  return response.text().then(function(text) {
                    if (text && (text.indexOf('PreconditionFailed') !== -1 || text.indexOf('pending state') !== -1)) {
                      console.warn('[FetchRetry] خطأ PreconditionFailed - إعادة المحاولة...');
                      // إعادة المحاولة بعد تأخير
                      return new Promise(function(resolve) {
                        setTimeout(function() {
                          resolve(originalFetch.apply(this, arguments));
                        }.bind(this), 2000);
                      }.bind(this));
                    }
                    // إعادة إنشاء الاستجابة بالنص الأصلي
                    return new Response(text, {
                      status: response.status,
                      statusText: response.statusText,
                      headers: response.headers
                    });
                  });
                }
                return response;
              });
            };
          })();
        `}} />
      </head>
      <body
        className="antialiased"
        style={{ background: '#050b18', color: '#ffffff', fontFamily: "'Amiri', 'Tajawal', 'Cairo', serif" }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
