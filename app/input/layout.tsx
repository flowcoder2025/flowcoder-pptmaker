import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '프리젠테이션 생성하기',
  description: 'AI 기반 프리젠테이션 생성을 시작하세요. 주제만 입력하면 자동으로 슬라이드를 만들어 드립니다. 무료로 시작하세요.',
  keywords: ['AI 프리젠테이션 생성', 'PPT 만들기', '슬라이드 자동 생성', '프리젠테이션 도구'],
  openGraph: {
    title: '프리젠테이션 생성하기 - PPT Maker',
    description: 'AI 기반 프리젠테이션 생성을 시작하세요. 주제만 입력하면 자동으로 슬라이드를 만들어 드립니다.',
    url: 'https://pptmaker.flowcoder.co.kr/input',
    siteName: 'PPT Maker by FlowCoder',
    images: ['/og-image.png'],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '프리젠테이션 생성하기 - PPT Maker',
    description: 'AI 기반 프리젠테이션 생성을 시작하세요. 주제만 입력하면 자동으로 슬라이드를 만들어 드립니다.',
    images: ['/og-image.png'],
  },
};

export default function InputLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: '프리젠테이션 생성하기',
    description: 'AI 기반 프리젠테이션 생성을 시작하세요. 주제만 입력하면 자동으로 슬라이드를 만들어 드립니다.',
    url: 'https://pptmaker.flowcoder.co.kr/input',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: '홈',
          item: 'https://pptmaker.flowcoder.co.kr',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: '프리젠테이션 생성',
          item: 'https://pptmaker.flowcoder.co.kr/input',
        },
      ],
    },
    potentialAction: {
      '@type': 'CreateAction',
      name: '프리젠테이션 생성',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://pptmaker.flowcoder.co.kr/input',
        actionPlatform: [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/MobileWebPlatform',
        ],
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
