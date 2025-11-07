/**
 * PPT Maker 수익화 타입 정의 (하이브리드 모델)
 *
 * @description
 * 건당 과금 + 구독 + IAP + 광고 하이브리드 수익 모델
 *
 * @reference
 * - 수익 모델 v3.0 (하이브리드)
 */

/**
 * AI 모델 타입
 */
export type AIModel = 'flash' | 'pro';

/**
 * 자료 조사 타입
 */
export type ResearchType = 'none' | 'basic' | 'deep';

/**
 * 생성 옵션 (사용자 선택)
 */
export interface GenerationOptions {
  /** AI 모델 선택 */
  aiModel: AIModel;

  /** 자료 조사 레벨 */
  research: ResearchType;
}

/**
 * 옵션별 추가 비용
 */
export interface OptionPricing {
  /** Pro 모델 사용 시 추가 비용 */
  proModelSurcharge: 500;

  /** 깊은 조사 시 추가 비용 */
  deepResearchSurcharge: 400;
}

/**
 * 무료 사용 정책 (광고 시청 필수)
 */
export interface FreeUsagePolicy {
  /** 기본 품질: 조사 없음 + Flash */
  basicQuality: {
    research: 'none';
    aiModel: 'flash';
    adRequired: true; // 생성 시 1회 + 다운로드 시 1회
    unlimited: true;
  };

  /** 기본 조사: 빠른 조사 + Flash */
  basicResearch: {
    research: 'basic';
    aiModel: 'flash';
    adRequired: true; // 생성 시 1회 + 다운로드 시 1회
    unlimited: true;
  };
}

/**
 * 건당 결제 타입
 */
export type PayPerUse = 'pro_model' | 'deep_research';

/**
 * 건당 결제 가격
 */
export interface PayPerUsePricing {
  /** Pro 모델 사용 (Flash → Pro 업그레이드) */
  pro_model: 500;

  /** 깊은 조사 (basic → deep 업그레이드) */
  deep_research: 400;
}

/**
 * 구독 플랜 타입
 */
export type SubscriptionPlan = 'free' | 'pro' | 'premium';

/**
 * 구독 플랜 정보
 */
export interface PlanInfo {
  id: SubscriptionPlan;
  name: string;
  price: number;
  benefits: {
    /** 광고 제거 여부 */
    adFree: boolean;

    /** 기본 품질 무제한 여부 */
    unlimitedBasic: boolean;

    /** 기본 조사 무제한 여부 */
    unlimitedBasicResearch: boolean;

    /** 매월 제공 크래딧 (Pro: 490, Premium: 무제한) */
    monthlyCredits: number;

    /** 건당 결제 시 할인율 */
    payPerUseDiscount: number; // 0.2 = 20%

    /** 슬라이드 수 제한 */
    maxSlides: number;

    /** 워터마크 표시 여부 */
    hasWatermark: boolean;

    /** 프리미엄 템플릿 접근 권한 */
    premiumTemplates: 'none' | 'discount' | 'unlimited'; // none: 접근 불가, discount: 할인, unlimited: 무제한
  };
}

/**
 * 묶음 구매 타입
 */
export type BundleType =
  | 'pro_model_10'
  | 'deep_research_10'
  | 'combo_package_10';

/**
 * 묶음 구매 정보
 */
export interface BundleInfo {
  type: BundleType;
  name: string;
  price: number;
  originalPrice: number;
  discount: number; // 0.1 = 10%
  contents: {
    proModel?: number;
    deepResearch?: number;
  };
  subscriberExtraDiscount: number; // 0.2 = 20%
}

/**
 * 구독 상태
 */
export interface SubscriptionStatus {
  plan: SubscriptionPlan;
  status: 'active' | 'canceled' | 'expired';
  startDate: string;
  endDate: string;
  autoRenewal: boolean;
  subscriptionId?: string;

  /** 이번 달 제공된 크래딧 (Pro 플랜 전용) */
  monthlyCreditsProvided: number;
}

/**
 * 크레딧 잔액 (단일 크래딧 시스템)
 */
export interface CreditBalance {
  /** 총 크래딧 수 (100원 = 10 크래딧) */
  totalCredits: number;
}

/**
 * 크래딧 사용 타입
 */
export type CreditUsageType = 'deepResearch' | 'qualityGeneration';

/**
 * 크래딧 소모량 정의
 */
export interface CreditCost {
  /** 심층 검색 비용 (40 크래딧 = 400원) */
  deepResearch: 40;

  /** 고품질 생성 비용 (50 크래딧 = 500원) */
  qualityGeneration: 50;
}

/**
 * 최초 무료 사용 추적
 */
export interface FirstTimeFreeUsage {
  /** 심층 검색 최초 무료 사용 여부 */
  deepResearch: boolean;

  /** 고품질 생성 최초 무료 사용 여부 */
  qualityGeneration: boolean;
}

/**
 * 결제 방법
 */
export type PaymentMethod = 'free' | 'subscription' | 'pay_per_use' | 'bundle';

/**
 * 생성 요청 정보
 */
export interface GenerationRequest {
  options: GenerationOptions;
  paymentMethod: PaymentMethod;
  useCredit?: boolean; // 크레딧 사용 여부
}

/**
 * 결제 검증 결과
 */
export interface PaymentValidation {
  allowed: boolean;
  method: PaymentMethod;
  price: number;
  requiresAd: boolean;
  message?: string;
}
