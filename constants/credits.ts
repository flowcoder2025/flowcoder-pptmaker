/**
 * 크래딧 시스템 상수 정의
 *
 * @description
 * 크래딧 소모량, 묶음 구매 옵션, 환율 정보 등
 */

/**
 * 크래딧 환율
 */
export const CREDIT_EXCHANGE_RATE = {
  /** 100원 = 10 크래딧 */
  WON_PER_10_CREDITS: 100,
} as const;

/**
 * 크래딧 소모량
 */
export const CREDIT_COST = {
  /** 심층 검색: 40 크래딧 (400원) */
  DEEP_RESEARCH: 40,

  /** 고품질 생성: 50 크래딧 (500원) */
  QUALITY_GENERATION: 50,
} as const;

/**
 * 최초 무료 제공 크래딧
 */
export const FIRST_TIME_FREE_CREDITS = {
  /** 심층 검색 최초 1회 무료: 40 크래딧 */
  DEEP_RESEARCH: 40,

  /** 고품질 생성 최초 1회 무료: 50 크래딧 */
  QUALITY_GENERATION: 50,
} as const;

/**
 * 크래딧 묶음 구매 옵션
 */
export interface CreditBundle {
  id: string;
  name: string;
  credits: number;
  price: number;
  badge?: string;
}

export const CREDIT_BUNDLES: CreditBundle[] = [
  {
    id: 'credits_100',
    name: '100 크래딧',
    credits: 100,
    price: 1000,
  },
  {
    id: 'credits_300',
    name: '300 크래딧',
    credits: 300,
    price: 3000,
  },
  {
    id: 'credits_500',
    name: '500 크래딧',
    credits: 500,
    price: 5000,
    badge: '추천',
  },
  {
    id: 'credits_1000',
    name: '1000 크래딧',
    credits: 1000,
    price: 10000,
  },
];

/**
 * Pro 플랜 월간 크래딧 (DEPRECATED)
 *
 * @deprecated PRO 이상 구독자는 무제한 생성으로 변경됨 (2025-12-02)
 * 이 상수는 하위 호환성을 위해 유지되지만 더 이상 사용되지 않음
 * 대신 hasUnlimitedGeneration(plan)을 사용하세요
 */
export const PRO_MONTHLY_CREDITS = 0;
