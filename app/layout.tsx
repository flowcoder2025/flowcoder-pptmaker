import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { logEnvironmentDiagnostics } from "@/utils/env-validator";
import LayoutWrapper from "@/components/LayoutWrapper";

export const metadata: Metadata = {
  metadataBase: new URL('https://pptmaker.flowcoder.co.kr'),
  title: {
    default: "PPT Maker by FlowCoder - AI 프리젠테이션 생성",
    template: "%s | PPT Maker by FlowCoder",
  },
  description: "AI 워크플로우 자동화 플랫폼 - 업무 생산성을 10배 향상시키는 혁신. 텍스트만 입력하면 AI가 자동으로 프리젠테이션을 생성합니다.",
  keywords: ["AI", "프리젠테이션", "PPT", "자동화", "워크플로우", "생산성", "FlowCoder"],
  authors: [{ name: "FlowCoder" }],
  creator: "FlowCoder",
  publisher: "FlowCoder",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://pptmaker.flowcoder.co.kr',
    title: "PPT Maker by FlowCoder - AI 프리젠테이션 생성",
    description: "텍스트만 입력하면 AI가 자동으로 프리젠테이션을 생성합니다. 업무 생산성을 10배 향상시키는 혁신적인 플랫폼.",
    siteName: "PPT Maker by FlowCoder",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PPT Maker - AI 프리젠테이션 자동 생성',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "PPT Maker by FlowCoder - AI 프리젠테이션 생성",
    description: "텍스트만 입력하면 AI가 자동으로 프리젠테이션을 생성합니다.",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_SEARCH_CONSOLE_VERIFICATION,
    other: {
      'naver-site-verification': '6dcd04f12c9c8e879d5ac4bace964eb74f99548b',
    },
  },
};

// 환경 변수 진단 (프로덕션 디버깅용)
if (typeof window === 'undefined') {
  logEnvironmentDiagnostics();
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  const jsonLd = [
    // WebApplication Schema
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'PPT Maker by FlowCoder',
      description: 'AI 워크플로우 자동화 플랫폼 - 텍스트만 입력하면 AI가 자동으로 프리젠테이션을 생성합니다.',
      url: 'https://pptmaker.flowcoder.co.kr',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'KRW',
      },
      creator: {
        '@type': 'Organization',
        name: 'FlowCoder',
        url: 'https://flowcoder.co.kr',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '1250',
      },
    },
    // Organization Schema
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'FlowCoder',
      url: 'https://flowcoder.co.kr',
      logo: 'https://pptmaker.flowcoder.co.kr/icon.png',
      description: 'AI 워크플로우 자동화 솔루션 제공 기업',
      sameAs: [
        'https://pptmaker.flowcoder.co.kr',
      ],
    },
  ];

  return (
    <html lang="ko">
      <head>
        {jsonLd.map((schema, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </head>
      <body className="antialiased">
        <LayoutWrapper>{children}</LayoutWrapper>

        {/*
          카카오 애드핏 스크립트는 각 광고 컴포넌트에서 개별적으로 로드됩니다.
          Next.js 페이지 전환 시 광고가 제대로 표시되도록 useEffect를 사용합니다.
          자세한 내용은 components/ads/*.tsx를 참고하세요.
        */}

        {/* Google Analytics 4 (GA4) */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
