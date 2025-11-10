/**
 * Google Analytics 4 (GA4) 이벤트 추적 유틸리티
 *
 * 사용 예시:
 * ```typescript
 * import { trackEvent, trackPageView } from '@/lib/analytics'
 *
 * // 페이지뷰 추적 (자동으로 되지만 수동 추적도 가능)
 * trackPageView('/new-page')
 *
 * // 커스텀 이벤트 추적
 * trackEvent('button_click', {
 *   button_name: '프리젠테이션 생성',
 *   page: '/input'
 * })
 *
 * // 비즈니스 이벤트 추적
 * trackPresentationCreated({ slideCount: 10, quality: 'pro' })
 * ```
 */

// GA4 이벤트 파라미터 타입 정의
export interface GAEventParams {
  [key: string]: string | number | boolean | undefined;
}

// gtag 함수 타입 정의 (window 객체 확장)
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: GAEventParams
    ) => void;
    dataLayer?: unknown[];
  }
}

/**
 * GA4가 로드되었는지 확인
 */
const isGALoaded = (): boolean => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

/**
 * 페이지뷰 추적
 * Next.js App Router에서는 자동으로 추적되지만, 필요시 수동 호출 가능
 *
 * @param url - 추적할 페이지 경로 (예: '/about')
 */
export const trackPageView = (url: string): void => {
  if (!isGALoaded()) return;

  window.gtag?.('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '', {
    page_path: url,
  });
};

/**
 * 커스텀 이벤트 추적
 *
 * @param action - 이벤트 이름 (예: 'button_click', 'form_submit')
 * @param params - 이벤트 파라미터 (선택)
 */
export const trackEvent = (
  action: string,
  params?: GAEventParams
): void => {
  if (!isGALoaded()) return;

  window.gtag?.('event', action, params);
};

// ==========================================
// 비즈니스 이벤트 추적 함수들
// ==========================================

/**
 * 프리젠테이션 생성 완료 이벤트
 */
export const trackPresentationCreated = (params: {
  slideCount: number;
  quality: 'flash' | 'pro';
  withResearch: boolean;
  templateId?: string;
}): void => {
  trackEvent('presentation_created', {
    slide_count: params.slideCount,
    quality: params.quality,
    with_research: params.withResearch,
    template_id: params.templateId,
  });
};

/**
 * 프리젠테이션 편집 이벤트
 */
export const trackPresentationEdited = (params: {
  presentationId: string;
  editType: 'content' | 'layout' | 'image';
}): void => {
  trackEvent('presentation_edited', {
    presentation_id: params.presentationId,
    edit_type: params.editType,
  });
};

/**
 * 프리젠테이션 저장 이벤트
 */
export const trackPresentationSaved = (params: {
  presentationId: string;
  slideCount: number;
}): void => {
  trackEvent('presentation_saved', {
    presentation_id: params.presentationId,
    slide_count: params.slideCount,
  });
};

/**
 * 프리젠테이션 공유 이벤트
 */
export const trackPresentationShared = (params: {
  presentationId: string;
  shareMethod: 'link' | 'email' | 'social';
}): void => {
  trackEvent('presentation_shared', {
    presentation_id: params.presentationId,
    share_method: params.shareMethod,
  });
};

/**
 * 구독 시작 이벤트 (전환 추적)
 */
export const trackSubscriptionStarted = (params: {
  plan: 'free' | 'pro' | 'premium';
  price?: number;
}): void => {
  trackEvent('subscription_started', {
    plan: params.plan,
    value: params.price,
    currency: 'KRW',
  });
};

/**
 * 크레딧 구매 이벤트 (전환 추적)
 */
export const trackCreditsPurchased = (params: {
  amount: number;
  price: number;
}): void => {
  trackEvent('credits_purchased', {
    credit_amount: params.amount,
    value: params.price,
    currency: 'KRW',
  });
};

/**
 * 버튼 클릭 이벤트
 */
export const trackButtonClick = (params: {
  buttonName: string;
  page: string;
}): void => {
  trackEvent('button_click', {
    button_name: params.buttonName,
    page: params.page,
  });
};

/**
 * 검색 이벤트
 */
export const trackSearch = (params: {
  searchTerm: string;
}): void => {
  trackEvent('search', {
    search_term: params.searchTerm,
  });
};

/**
 * 에러 이벤트
 */
export const trackError = (params: {
  errorMessage: string;
  errorCode?: string;
  page: string;
}): void => {
  trackEvent('error', {
    error_message: params.errorMessage,
    error_code: params.errorCode,
    page: params.page,
  });
};

/**
 * 사용자 로그인 이벤트
 */
export const trackLogin = (params: {
  method: 'github' | 'google' | 'email';
}): void => {
  trackEvent('login', {
    method: params.method,
  });
};

/**
 * 사용자 회원가입 이벤트
 */
export const trackSignUp = (params: {
  method: 'github' | 'google' | 'email';
}): void => {
  trackEvent('sign_up', {
    method: params.method,
  });
};
