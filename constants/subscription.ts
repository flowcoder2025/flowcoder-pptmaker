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
   */
  free: {
    id: 'free',
    name: '무료',
    price: 0,
    benefits: {
      adFree: false,
      unlimitedBasic: true,
      unlimitedBasicResearch: true,
      monthlyCredits: 0,
      payPerUseDiscount: 0,
      maxSlides: 10,
      hasWatermark: true,
      premiumTemplates: 'none',
    },
  },

  /**
   * Pro 플랜 (₩4,900/월)
   * - 광고 제거
   * - 워터마크 제거
   * - 슬라이드 수 20페이지 제한
   * - 매월 490 크래딧 제공
   * - 건당 결제 20% 할인
   */
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 4900,
    benefits: {
      adFree: true,
      unlimitedBasic: true,
      unlimitedBasicResearch: true,
      monthlyCredits: 490,
      payPerUseDiscount: 0.2,
      maxSlides: 20,
      hasWatermark: false,
      premiumTemplates: 'none',
    },
  },

  /**
   * Premium 플랜 (₩9,900/월)
   * - Pro 플랜 모든 혜택
   * - 슬라이드 수 50페이지 제한
   * - 무제한 크래딧
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
      monthlyCredits: 9999999, // 사실상 무제한
      payPerUseDiscount: 0.2,
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
