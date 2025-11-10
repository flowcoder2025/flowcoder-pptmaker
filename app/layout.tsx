import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { logEnvironmentDiagnostics } from "@/utils/env-validator";
import LayoutWrapper from "@/components/LayoutWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PPT Maker by FlowCoder",
  description: "AI 워크플로우 자동화 플랫폼 - 업무 생산성을 10배 향상시키는 혁신",
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
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LayoutWrapper>{children}</LayoutWrapper>

        {/*
          카카오 애드핏 스크립트는 각 광고 컴포넌트에서 개별적으로 로드됩니다.
          Next.js 페이지 전환 시 광고가 제대로 표시되도록 useEffect를 사용합니다.
          자세한 내용은 components/ads/*.tsx를 참고하세요.
        */}
      </body>
    </html>
  );
}
