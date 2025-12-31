/**
 * 크레딧 시스템 유틸리티 함수
 *
 * 유효기간 관리 및 우선순위 기반 소모 시스템
 */

import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import {
  CreditSourceType,
  CreditTransactionType,
  type CreditBalanceByType,
  type CreditUsageBreakdown,
  type ExpiringCredit,
} from '@/types/credits'

// ============================================
// 크레딧 잔액 계산
// ============================================

/**
 * 사용자의 크레딧 잔액 계산 (만료되지 않은 크레딧만)
 *
 * @param userId - 사용자 ID
 * @returns 총 잔액 및 타입별 잔액
 */
export async function calculateBalance(userId: string): Promise<{
  balance: number
  balanceByType: CreditBalanceByType
}> {
  // 1. 만료되지 않은 크레딧만 조회
  const transactions = await prisma.creditTransaction.findMany({
    where: {
      userId,
      OR: [
        { expiresAt: null }, // 영구 크레딧
        { expiresAt: { gt: new Date() } }, // 아직 만료 안됨
      ],
    },
    select: {
      amount: true,
      sourceType: true,
    },
  })

  // 2. 타입별로 합산
  const balanceByType: CreditBalanceByType = {
    FREE: 0,
    EVENT: 0,
    SUBSCRIPTION: 0,
    PURCHASE: 0,
  }

  let totalBalance = 0

  for (const tx of transactions) {
    totalBalance += tx.amount

    // sourceType이 있는 경우만 타입별 합산
    if (tx.sourceType && tx.sourceType in balanceByType) {
      balanceByType[tx.sourceType as CreditSourceType] += tx.amount
    }
  }

  return {
    balance: totalBalance,
    balanceByType,
  }
}

// ============================================
// 만료 예정 크레딧 조회
// ============================================

/**
 * 7일 이내 만료 예정인 크레딧 조회
 *
 * @param userId - 사용자 ID
 * @returns 만료 예정 크레딧 목록
 */
export async function getExpiringCredits(
  userId: string
): Promise<ExpiringCredit[]> {
  const sevenDaysFromNow = new Date()
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

  const transactions = await prisma.creditTransaction.findMany({
    where: {
      userId,
      sourceType: {
        in: [CreditSourceType.EVENT, CreditSourceType.SUBSCRIPTION],
      },
      expiresAt: {
        gt: new Date(), // 아직 만료 안됨
        lte: sevenDaysFromNow, // 7일 이내
      },
    },
    select: {
      sourceType: true,
      amount: true,
      expiresAt: true,
    },
    orderBy: {
      expiresAt: 'asc', // 빨리 만료되는 순
    },
  })

  // 타입별로 그룹화하여 합산
  const groupedByType = transactions.reduce(
    (acc, tx) => {
      const key = tx.sourceType as CreditSourceType
      if (!acc[key]) {
        acc[key] = {
          sourceType: key,
          amount: 0,
          expiresAt: tx.expiresAt!.toISOString(), // Date → string 변환
        }
      }
      acc[key].amount += tx.amount
      return acc
    },
    {} as Record<string, ExpiringCredit>
  )

  return Object.values(groupedByType)
}

// ============================================
// 크레딧 소모 (우선순위 기반)
// ============================================

/**
 * 크레딧 소모 (우선순위: FREE → EVENT → SUBSCRIPTION → PURCHASE)
 *
 * @param userId - 사용자 ID
 * @param amount - 소모할 크레딧 양
 * @param description - 사용 내역 설명
 * @returns 소모 내역 및 잔여 잔액
 */
export async function consumeCredits(
  userId: string,
  amount: number,
  description: string
): Promise<{
  consumed: number
  remaining: number
  usageBreakdown: CreditUsageBreakdown[]
}> {
  // 1. 사용 가능한 크레딧 조회 (만료 안됨 + 우선순위 정렬)
  const availableCredits = await prisma.creditTransaction.findMany({
    where: {
      userId,
      type: {
        in: [
          CreditTransactionType.FREE,
          CreditTransactionType.EVENT,
          CreditTransactionType.SUBSCRIPTION,
          CreditTransactionType.PURCHASE,
        ]
      }, // 지급된 크레딧만 (USAGE, REFUND, EXPIRED 제외)
      amount: { gt: 0 }, // 양수만 (적립)
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
    select: {
      id: true,
      sourceType: true,
      amount: true,
      expiresAt: true,
      createdAt: true,
    },
  })

  logger.debug('사용 가능한 크레딧 조회', {
    count: availableCredits.length,
    sample: availableCredits[0] || null,
  });

  // 2. 타입별로 그룹화 및 잔액 계산
  interface CreditGroup {
    balance: number
    transactions: (typeof availableCredits)[0][]
  }

  const balanceByType: Record<string, CreditGroup> = {}

  for (const tx of availableCredits) {
    // sourceType이 null인 경우 LEGACY로 처리 (하위 호환성)
    const key = tx.sourceType || 'LEGACY'
    if (!balanceByType[key]) {
      balanceByType[key] = { balance: 0, transactions: [] }
    }
    balanceByType[key].balance += tx.amount
    balanceByType[key].transactions.push(tx)
  }

  // 3. 총 잔액 확인
  const totalBalance = Object.values(balanceByType).reduce(
    (sum, { balance }) => sum + balance,
    0
  )

  if (totalBalance < amount) {
    throw new Error('크레딧이 부족해요')
  }

  // 4. 우선순위에 따라 소모
  let remaining = amount
  const usageRecords: CreditUsageBreakdown[] = []

  const priorityOrder: (CreditSourceType | 'LEGACY')[] = [
    CreditSourceType.FREE,
    CreditSourceType.EVENT,
    CreditSourceType.SUBSCRIPTION,
    CreditSourceType.PURCHASE,
    'LEGACY', // sourceType이 null인 구형 크레딧 (가장 낮은 우선순위)
  ]

  for (const sourceType of priorityOrder) {
    if (remaining <= 0) break
    if (!balanceByType[sourceType]) continue

    const available = balanceByType[sourceType].balance
    const toConsume = Math.min(remaining, available)

    if (toConsume > 0) {
      usageRecords.push({
        sourceType: sourceType === 'LEGACY' ? null : (sourceType as CreditSourceType),
        amount: toConsume,
      })
      remaining -= toConsume
    }
  }

  // 5. USAGE 거래 기록 생성
  await prisma.creditTransaction.createMany({
    data: usageRecords.map(({ sourceType, amount }) => ({
      userId,
      type: CreditTransactionType.USAGE,
      sourceType: null, // USAGE는 sourceType 없음
      amount: -amount, // 음수
      balance: 0, // DEPRECATED
      description: `${description} (${sourceType} 크레딧 ${amount} 사용)`,
      expiresAt: null,
    })),
  })

  // 6. 최신 잔액 다시 계산 (USAGE 거래 반영 후)
  const { balance: currentBalance } = await calculateBalance(userId)

  return {
    consumed: amount,
    remaining: currentBalance,
    usageBreakdown: usageRecords,
  }
}

// ============================================
// 크레딧 지급 (유효기간 설정)
// ============================================

/**
 * 크레딧 지급
 *
 * @param userId - 사용자 ID
 * @param sourceType - 크레딧 소스 타입
 * @param amount - 지급할 크레딧 양
 * @param description - 지급 사유
 * @param expiresInDays - 유효기간 (일 단위, 선택적)
 * @returns 생성된 거래 기록
 */
export async function grantCredits(
  userId: string,
  sourceType: CreditSourceType,
  amount: number,
  description: string,
  expiresInDays?: number
): Promise<{
  id: string
  userId: string
  type: string
  sourceType: string | null
  amount: number
  description: string | null
  expiresAt: Date | null
  createdAt: Date
}> {
  // 1. 유효기간 계산
  let expiresAt: Date | null = null

  if (expiresInDays !== undefined && expiresInDays > 0) {
    expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)
  } else if (sourceType === CreditSourceType.SUBSCRIPTION) {
    // 구독 크레딧은 기본 30일
    expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)
  }
  // FREE와 PURCHASE는 expiresAt이 null (영구)

  // 2. 거래 기록 생성
  const transaction = await prisma.creditTransaction.create({
    data: {
      userId,
      type: sourceType, // type과 sourceType 동일
      sourceType,
      amount,
      balance: 0, // DEPRECATED
      description,
      expiresAt,
    },
  })

  return transaction
}

// ============================================
// 만료 크레딧 배치 처리 (선택적)
// ============================================

/**
 * 만료된 크레딧을 EXPIRED 거래로 기록 (통계용)
 *
 * 주의: 실시간 필터링으로 인해 필수는 아니며, 통계 목적으로만 사용
 *
 * @returns 처리된 사용자 수 및 만료 건수
 */
/**
 * 여러 사용자의 크레딧 잔액을 한 번에 계산 (배치 처리)
 *
 * @param userIds - 사용자 ID 배열
 * @returns userId별 잔액 맵
 */
export async function calculateBalanceBatch(
  userIds: string[]
): Promise<Map<string, number>> {
  if (userIds.length === 0) {
    return new Map()
  }

  // 한 번의 쿼리로 모든 사용자의 트랜잭션 조회
  const transactions = await prisma.creditTransaction.findMany({
    where: {
      userId: { in: userIds },
      OR: [
        { expiresAt: null }, // 영구 크레딧
        { expiresAt: { gt: new Date() } }, // 아직 만료 안됨
      ],
    },
    select: {
      userId: true,
      amount: true,
    },
  })

  // userId별로 합산
  const balanceMap = new Map<string, number>()

  // 모든 userIds에 대해 기본값 0으로 초기화
  for (const userId of userIds) {
    balanceMap.set(userId, 0)
  }

  // 트랜잭션 합산
  for (const tx of transactions) {
    const current = balanceMap.get(tx.userId) || 0
    balanceMap.set(tx.userId, current + tx.amount)
  }

  return balanceMap
}

export async function expireCreditsJob(): Promise<{
  totalUsers: number
  totalExpired: number
}> {
  const now = new Date()

  // 1. 만료된 크레딧 조회 (아직 EXPIRED 처리 안됨)
  const expiredCredits = await prisma.creditTransaction.findMany({
    where: {
      sourceType: {
        in: [CreditSourceType.EVENT, CreditSourceType.SUBSCRIPTION],
      },
      expiresAt: { lte: now }, // 만료일이 현재보다 과거
    },
    select: {
      userId: true,
      sourceType: true,
      amount: true,
      expiresAt: true,
    },
  })

  if (expiredCredits.length === 0) {
    return { totalUsers: 0, totalExpired: 0 }
  }

  // 2. 사용자별로 그룹화
  const expiredByUser = expiredCredits.reduce(
    (acc, credit) => {
      if (!acc[credit.userId]) {
        acc[credit.userId] = []
      }
      acc[credit.userId].push(credit)
      return acc
    },
    {} as Record<string, typeof expiredCredits>
  )

  // 3. 각 사용자별로 만료 처리
  for (const [userId, credits] of Object.entries(expiredByUser)) {
    const totalExpired = credits.reduce((sum, c) => sum + c.amount, 0)

    // EXPIRED 거래 기록 생성
    await prisma.creditTransaction.create({
      data: {
        userId,
        type: CreditTransactionType.EXPIRED,
        sourceType: null, // EXPIRED는 sourceType 없음
        amount: -totalExpired, // 음수
        balance: 0,
        description: `만료된 크레딧 정리 (${credits.length}건)`,
        expiresAt: null,
      },
    })
  }

  return {
    totalUsers: Object.keys(expiredByUser).length,
    totalExpired: expiredCredits.length,
  }
}
