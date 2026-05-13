import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "../../public/fonts/fonts.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = localFont({
  src: "../../public/fonts/geist-sans.woff2",
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = localFont({
  src: "../../public/fonts/geist-mono.woff2",
  variable: "--font-geist-mono",
  display: "swap",
});

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ background: '#050b18', color: '#ffffff' }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
