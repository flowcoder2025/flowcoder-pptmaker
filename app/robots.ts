import { MetadataRoute } from 'next';

/**
 * Next.js 자동 robots.txt 생성
 *
 * 이 파일은 /robots.txt 경로에서 자동으로 제공됩니다.
 * 검색 엔진 크롤러의 동작을 제어합니다.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',        // API 라우트 크롤링 금지
          '/dev-tools/',  // 개발자 도구 크롤링 금지
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
