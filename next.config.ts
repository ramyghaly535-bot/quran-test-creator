import type { NextConfig } from "next";

// كشف تلقائي لـ GitHub Pages من متغيرات البيئة
const isGitHubPages = process.env.GITHUB_PAGES === 'true' || process.env.CI === 'true';

const nextConfig: NextConfig = {
  output: 'export',
  // basePath يُضاف تلقائياً لجميع الروابط والصور عند البناء
  basePath: isGitHubPages ? '/quran-test-creator' : '',
  // إضافة trailingSlash لضمان عمل GitHub Pages
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    '127.0.0.1',
    'localhost',
  ],
  // إعداد Turbopack
  turbopack: {},
};

export default nextConfig;
