/**
 * 크레딧 시스템 타입 정의
 *
 * 유효기간 관리 및 우선순위 기반 소모 시스템
 */

// ============================================
// 크레딧 소스 타입 (우선순위 순서)
// ============================================

/**
 * 크레딧 소스 타입
 *
 * 우선순위:
 * 1. FREE - 무료 크레딧 (최초 1회, 유효기간 없음)
 * 2. EVENT - 이벤트 크레딧 (유효기간 지정 가능)
 * 3. SUBSCRIPTION - 구독 크레딧 (1달 유효기간)
 * 4. PURCHASE - 유료 구매 크레딧 (유효기간 없음)
 */
export enum CreditSourceType {
  FREE = 'FREE',
  EVENT = 'EVENT',
  SUBSCRIPTION = 'SUBSCRIPTION',
  PURCHASE = 'PURCHASE',
}

/**
 * 거래 타입 (소스 + 액션)
 */
export enum CreditTransactionType {
  // 소스 타입 (지급)
  FREE = 'FREE',
  EVENT = 'EVENT',
  SUBSCRIPTION = 'SUBSCRIPTION',
  PURCHASE = 'PURCHASE',

  // 액션 타입 (사용/환불/만료)
  USAGE = 'USAGE', // 크레딧 사용
  REFUND = 'REFUND', // 환불
  EXPIRED = 'EXPIRED', // 만료 처리
}

/**
 * 우선순위 (낮은 숫자가 먼저 소모됨)
 */
export const CREDIT_PRIORITY: Record<CreditSourceType, number> = {
  [CreditSourceType.FREE]: 1, // 1순위
  [CreditSourceType.EVENT]: 2, // 2순위
  [CreditSourceType.SUBSCRIPTION]: 3, // 3순위
  [CreditSourceType.PURCHASE]: 4, // 4순위 (마지막)
}

// ============================================
// 크레딧 잔액 타입
// ============================================

/**
 * 타입별 크레딧 잔액
 */
export interface CreditBalanceByType {
  FREE: number
  EVENT: number
  SUBSCRIPTION: number
  PURCHASE: number
}

/**
 * 크레딧 잔액 조회 응답
 */
export interface CreditBalanceResponse {
  balance: number // 총 잔액 (만료 제외)
  balanceByType: CreditBalanceByType // 타입별 잔액
  firstTimeDeepResearchUsed: boolean
  firstTimeQualityGenerationUsed: boolean
  expiringCredits: ExpiringCredit[] // 곧 만료될 크레딧 (7일 이내)
}

/**
 * 만료 예정 크레딧
 */
export interface ExpiringCredit {
  sourceType: CreditSourceType
  amount: number
  expiresAt: string // ISO 8601
}

// ============================================
// 크레딧 사용 타입
// ============================================

/**
 * 크레딧 사용 내역 (타입별)
 */
export interface CreditUsageBreakdown {
  sourceType: CreditSourceType
  amount: number
}

/**
 * 크레딧 사용 응답
 */
export interface CreditConsumeResponse {
  transaction: {
    id: string
    type: string
    amount: number
    description: string
    createdAt: string
  }
  remainingBalance: number
  message: string
  usageBreakdown: CreditUsageBreakdown[] // 어떤 타입에서 얼마나 사용했는지
}

// ============================================
// 크레딧 지급 타입
// ============================================

/**
 * 크레딧 지급 요청
 */
export interface CreditGrantRequest {
  userId: string
  sourceType: CreditSourceType
  amount: number
  description: string
  expiresInDays?: number // 선택적 (EVENT만 해당)
}

/**
 * 크레딧 지급 응답
 */
export interface CreditGrantResponse {
  transaction: {
    id: string
    userId: string
    type: string
    sourceType: string
    amount: number
    description: string
    expiresAt: string | null
    createdAt: string
  }
  message: string
}

// ============================================
// 크레딧 거래 내역 타입
// ============================================

/**
 * 크레딧 거래 내역
 */
export interface CreditTransactionRecord {
  id: string
  type: string
  sourceType: string | null
  amount: number
  description: string | null
  expiresAt: string | null // ISO 8601
  createdAt: string // ISO 8601
}

/**
 * 크레딧 거래 내역 응답
 */
export interface CreditHistoryResponse {
  transactions: CreditTransactionRecord[]
  total: number
  limit: number
  offset: number
}

// ============================================
// 내부 유틸리티 타입
// ============================================

/**
 * 사용 가능한 크레딧 (내부 계산용)
 */
export interface AvailableCredit {
  id: string
  userId: string
  type: string
  sourceType: string
  amount: number
  expiresAt: Date | null
  createdAt: Date
}

/**
 * 타입별 크레딧 그룹 (내부 계산용)
 */
export interface CreditGroup {
  balance: number
  transactions: AvailableCredit[]
}
