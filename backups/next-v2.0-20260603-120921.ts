import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
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
  // إعداد Turbopack (المستخدم افتراضياً في Next.js 16)
  turbopack: {},
};

export default nextConfig;
