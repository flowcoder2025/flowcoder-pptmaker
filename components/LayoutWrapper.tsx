'use client';

import { usePathname } from 'next/navigation';
import TabBar from './TabBar';

/**
 * LayoutWrapper 컴포넌트
 *
 * @description
 * 조건부 TabBar 렌더링을 위한 Client Component Wrapper입니다.
 *
 * **TabBar를 숨기는 페이지**:
 * - /viewer: 슬라이드 전체 화면
 * - /editor: 편집 전체 화면
 * - /dev-tools: 개발자 도구
 *
 * **TabBar를 표시하는 페이지**:
 * - /: 홈
 * - /input: 입력
 * - /subscription: 구독
 * - /credits: 크레딧
 */

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();

  // TabBar를 숨길 페이지 목록
  const hideTabBar =
    pathname === '/viewer' ||
    pathname === '/editor' ||
    pathname === '/dev-tools';

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingBottom: hideTabBar ? '0' : '100px', // TabBar 공간 확보
      }}
    >
      {children}
      {!hideTabBar && <TabBar />}
    </div>
  );
}
