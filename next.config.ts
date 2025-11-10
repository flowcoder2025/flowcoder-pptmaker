import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ⚠️ Note: API Routes를 사용하려면 output: 'export'를 제거해야 합니다
  // Apps in Toss WebView는 CSR/SSG만 지원하지만, API는 별도 서버로 배포 가능
  // output: 'export', // API Routes 활성화를 위해 주석 처리

  images: {
    unoptimized: true, // Apps in Toss 최적화 대응
  },

  // Vercel 배포 시 Prisma 바이너리 파일 포함
  outputFileTracingIncludes: {
    '/api/**/*': ['./node_modules/.prisma/client/**/*'],
  },

  env: {
    // 환경 변수 명시적 주입
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    NEXT_PUBLIC_AD_GROUP_ID: process.env.NEXT_PUBLIC_AD_GROUP_ID,
  },
};

export default nextConfig;
