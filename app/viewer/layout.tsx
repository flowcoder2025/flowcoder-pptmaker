import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '슬라이드 뷰어',
  description: '생성된 프리젠테이션을 확인하고 편집하세요. PDF, PPTX 다운로드 가능합니다.',
  keywords: ['슬라이드 뷰어', 'PPT 뷰어', '프리젠테이션 보기', 'PDF 다운로드', 'PPTX 다운로드'],
  openGraph: {
    title: '슬라이드 뷰어 - PPT Maker',
    description: '생성된 프리젠테이션을 확인하고 편집하세요. PDF, PPTX 다운로드 가능합니다.',
    url: 'https://pptmaker.flowcoder.co.kr/viewer',
    siteName: 'PPT Maker by FlowCoder',
    images: ['/icon.png'],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '슬라이드 뷰어 - PPT Maker',
    description: '생성된 프리젠테이션을 확인하고 편집하세요. PDF, PPTX 다운로드 가능합니다.',
    images: ['/icon.png'],
  },
};

export default function ViewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
