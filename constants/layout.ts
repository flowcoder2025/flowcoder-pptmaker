/**
 * 레이아웃 상수
 * 웹 서비스 전체에서 사용하는 레이아웃 관련 상수
 */

/**
 * 컨테이너 최대 너비
 */
export const MAX_WIDTH = {
  /** 메인 컨텐츠 최대 너비 (1200px) */
  container: '1200px',
  /** 좁은 컨텐츠 영역 (예: 블로그 포스트) */
  narrow: '800px',
  /** 넓은 컨텐츠 영역 (예: 대시보드) */
  wide: '1400px',
} as const;

/**
 * 패딩 및 간격
 */
export const SPACING = {
  /** 페이지 좌우 패딩 */
  pagePadding: {
    mobile: '20px',
    tablet: '32px',
    desktop: '40px',
  },
  /** 섹션 간 간격 */
  section: {
    sm: '40px',
    md: '60px',
    lg: '80px',
  },
  /** 컴포넌트 간 간격 */
  component: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
} as const;

/**
 * 브레이크포인트 (Tailwind 기본값)
 */
export const BREAKPOINTS = {
  mobile: '640px',   // sm
  tablet: '768px',   // md
  desktop: '1024px', // lg
  wide: '1280px',    // xl
} as const;

/**
 * 내비게이션 바 높이
 */
export const NAV_HEIGHT = {
  mobile: '64px',
  desktop: '72px',
} as const;

/**
 * 애니메이션 지속 시간
 */
export const TRANSITION = {
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
} as const;
