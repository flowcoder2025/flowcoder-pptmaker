import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '회원가입',
  description: 'PPT Maker에 가입하고 AI 기반 프리젠테이션 자동 생성 서비스를 이용하세요. 무료로 시작할 수 있습니다.',
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: '회원가입 - PPT Maker',
    description: 'PPT Maker에 가입하고 AI 기반 프리젠테이션 자동 생성 서비스를 이용하세요.',
    url: 'https://pptmaker.flowcoder.co.kr/signup',
    siteName: 'PPT Maker by FlowCoder',
    images: ['/icon.png'],
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
