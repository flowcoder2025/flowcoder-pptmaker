import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '로그인',
  description: 'PPT Maker 서비스를 이용하려면 로그인하세요. GitHub, Google 계정으로 간편하게 시작할 수 있습니다.',
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: '로그인 - PPT Maker',
    description: 'PPT Maker 서비스를 이용하려면 로그인하세요.',
    url: 'https://pptmaker.flowcoder.co.kr/login',
    siteName: 'PPT Maker by FlowCoder',
    images: ['/icon.png'],
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
