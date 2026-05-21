import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 
    تم إزالة output: "standalone" لأنه يسبب خطأ PreconditionFailed
    في بيئات السيرفرلس (serverless). التطبيق يعمل بشكل طبيعي بدونه.
  */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // تحسين أداء الصور الثابتة
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
