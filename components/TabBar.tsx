'use client';

import { useRouter, usePathname } from 'next/navigation';
import { TOSS_COLORS } from '@/constants/design';

/**
 * TabBar 컴포넌트
 *
 * @description
 * Apps in Toss 가이드에 따른 플로팅 형태의 하단 탭바입니다.
 *
 * **디자인 규칙**:
 * - 플로팅 형태 필수 (토스 메인 탭과 구분)
 * - 2~5개 탭 지원 (현재 3개)
 * - 현재 페이지 활성화 표시
 *
 * **UX Writing**:
 * - 모든 레이블은 "~해요" 체 준수
 *
 * @see https://developers-apps-in-toss.toss.im/design/miniapp-branding-guide.html#_4-탭바
 */

interface Tab {
  id: string;
  label: string;
  icon: string;
  path: string;
}

const TABS: Tab[] = [
  {
    id: 'home',
    label: '홈',
    icon: '🏠',
    path: '/'
  },
  {
    id: 'subscription',
    label: '구독',
    icon: '⭐',
    path: '/subscription'
  },
  {
    id: 'credits',
    label: '크레딧',
    icon: '💎',
    path: '/credits'
  },
];

export default function TabBar() {
  const router = useRouter();
  const pathname = usePathname();

  // 현재 활성 탭 감지
  const getActiveTab = () => {
    // input 페이지는 홈으로 간주
    if (pathname === '/input') return '/';
    return pathname;
  };

  const activeTab = getActiveTab();

  return (
    <nav
      role="navigation"
      aria-label="메인 네비게이션"
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '16px',
        right: '16px',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      {/* 플로팅 탭바 컨테이너 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          maxWidth: '600px',
          width: '100%',
          height: '64px',
          background: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          padding: '0 8px',
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.path;

          return (
            <button
              key={tab.id}
              onClick={() => router.push(tab.path)}
              aria-label={`${tab.label} 페이지로 이동`}
              aria-current={isActive ? 'page' : undefined}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                padding: '8px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                minHeight: '44px',
                minWidth: '44px',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = '#F9FAFB';
                  e.currentTarget.style.borderRadius = '12px';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {/* 아이콘 */}
              <span
                style={{
                  fontSize: '24px',
                  lineHeight: 1,
                  filter: isActive ? 'none' : 'grayscale(100%)',
                  opacity: isActive ? 1 : 0.6,
                  transition: 'all 0.2s ease',
                }}
              >
                {tab.icon}
              </span>

              {/* 레이블 */}
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: isActive ? '600' : '400',
                  color: isActive ? TOSS_COLORS.primary : TOSS_COLORS.textSecondary,
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
