/**
 * 구독 플랜 상수 정의
 *
 * @description
 * 무료/Pro/Premium 플랜별 혜택 및 제한사항 정의
 */

import type { PlanInfo, SubscriptionPlan } from '@/types/monetization';

/**
 * 플랜별 혜택 정의
 */
export const PLAN_BENEFITS: Record<SubscriptionPlan, PlanInfo> = {
  /**
   * 무료 플랜
   * - 워터마크 표시
   * - 슬라이드 수 10페이지 제한
   * - 광고 시청 필요 (생성 1회 + 다운로드 1회)
   * - 최초 1회 무료: 심층 검색 + 고품질 생성
   * - 유료 기능은 크레딧 구매 필요
   */
  free: {
    id: 'free',
    name: '무료',
    price: 0,
    benefits: {
      adFree: false,
      unlimitedBasic: true,
      unlimitedBasicResearch: true,
      unlimitedGeneration: false, // 크레딧 구매 필요
      monthlyCredits: 0,
      payPerUseDiscount: 0,
      maxSlides: 10,
      hasWatermark: true,
      premiumTemplates: 'none',
    },
  },

  /**
   * Pro 플랜 (₩7,900/월)
   * - 광고 제거
   * - 워터마크 제거
   * - 슬라이드 수 20페이지 제한
   * - 무제한 생성 (심층 검색 + 고품질 생성)
   */
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 7900,
    benefits: {
      adFree: true,
      unlimitedBasic: true,
      unlimitedBasicResearch: true,
      unlimitedGeneration: true, // 무제한 생성
      monthlyCredits: 0, // 더 이상 월간 크레딧 제공 안함 (무제한)
      payPerUseDiscount: 0,
      maxSlides: 20,
      hasWatermark: false,
      premiumTemplates: 'none',
    },
  },

  /**
   * Premium 플랜 (₩9,900/월)
   * - Pro 플랜 모든 혜택
   * - 슬라이드 수 50페이지 제한
   * - 무제한 생성 (심층 검색 + 고품질 생성)
   * - 프리미엄 템플릿 무제한
   */
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 9900,
    benefits: {
      adFree: true,
      unlimitedBasic: true,
      unlimitedBasicResearch: true,
      unlimitedGeneration: true, // 무제한 생성
      monthlyCredits: 0, // 더 이상 월간 크레딧 제공 안함 (무제한)
      payPerUseDiscount: 0,
      maxSlides: 50,
      hasWatermark: false,
      premiumTemplates: 'unlimited',
    },
  },
};

/**
 * 플랜 정보 가져오기
 */
export function getPlanInfo(plan: SubscriptionPlan): PlanInfo {
  return PLAN_BENEFITS[plan];
}

/**
 * 슬라이드 수 제한 가져오기
 */
export function getMaxSlides(plan: SubscriptionPlan): number {
  return PLAN_BENEFITS[plan].benefits.maxSlides;
}

/**
 * 워터마크 표시 여부
 */
export function hasWatermark(plan: SubscriptionPlan): boolean {
  return PLAN_BENEFITS[plan].benefits.hasWatermark;
}

/**
 * 월간 크래딧 제공량 가져오기
 */
export function getMonthlyCredits(plan: SubscriptionPlan): number {
  return PLAN_BENEFITS[plan].benefits.monthlyCredits;
}

/**
 * 건당 결제 할인율 가져오기
 */
export function getPayPerUseDiscount(plan: SubscriptionPlan): number {
  return PLAN_BENEFITS[plan].benefits.payPerUseDiscount;
}

/**
 * 프리미엄 템플릿 접근 권한 가져오기
 */
export function getPremiumTemplatesAccess(plan: SubscriptionPlan): 'none' | 'discount' | 'unlimited' {
  return PLAN_BENEFITS[plan].benefits.premiumTemplates;
}

/**
 * 무제한 생성 여부 확인 (심층 검색 + 고품질 생성)
 * PRO 이상 구독자는 크레딧 없이 무제한 사용 가능
 */
export function hasUnlimitedGeneration(plan: SubscriptionPlan): boolean {
  return PLAN_BENEFITS[plan].benefits.unlimitedGeneration;
}

/**
 * 초과 슬라이드 수 계산
 * @param plan 현재 구독 플랜
 * @param slideCount 생성할 슬라이드 수
 * @returns 초과 슬라이드 수 (0 이상)
 */
export function getExtraSlideCount(plan: SubscriptionPlan, slideCount: number): number {
  const maxSlides = PLAN_BENEFITS[plan].benefits.maxSlides;
  return Math.max(0, slideCount - maxSlides);
}

/**
 * 초과 슬라이드 크레딧 비용 계산
 * @param plan 현재 구독 플랜
 * @param slideCount 생성할 슬라이드 수
 * @param creditPerSlide 슬라이드당 크레딧 비용 (기본값: CREDIT_COST.EXTRA_SLIDE)
 * @returns 필요한 크레딧 수
 */
export function getExtraSlideCreditCost(
  plan: SubscriptionPlan,
  slideCount: number,
  creditPerSlide: number = 2
): number {
  const extraSlides = getExtraSlideCount(plan, slideCount);
  return extraSlides * creditPerSlide;
}
