'use client';

import NavigationBar from './layout/NavigationBar';
import Footer from './layout/Footer';
import { SessionProvider } from './auth/SessionProvider';
import { Toaster } from 'sonner';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { PLAN_BENEFITS } from '@/constants/subscription';

/**
 * LayoutWrapper 컴포넌트
 *
 * @description
 * NavigationBar와 SessionProvider를 포함한 레이아웃 래퍼입니다.
 * NavigationBar는 자체적으로 viewer, editor, dev-tools 페이지에서 숨김 처리됩니다.
 *
 * **NavigationBar가 표시되는 페이지**:
 * - /: 홈
 * - /input: 입력
 * - /subscription: 구독
 * - /credits: 크레딧
 * - /profile: 프로필
 * - /history: 히스토리
 * - /login, /signup: 인증 페이지
 *
 * **NavigationBar가 숨겨지는 페이지**:
 * - /viewer: 슬라이드 전체 화면
 * - /editor: 편집 전체 화면
 * - /dev-tools: 개발자 도구
 */

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { plan } = useSubscriptionStore();
  // 광고 표시 여부 결정 (유료 플랜은 광고 제거)
  const showAds = !PLAN_BENEFITS[plan].benefits.adFree;

  return (
    <SessionProvider>
      <div className="min-h-screen flex flex-col">
        <NavigationBar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <Toaster position="top-center" />
      </div>
    </SessionProvider>
  );
}
