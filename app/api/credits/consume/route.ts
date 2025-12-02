/**
 * Credit Consume API - 크레딧 사용
 *
 * POST /api/credits/consume - 크레딧 사용 (AI 생성 시)
 *
 * v2.0: 우선순위 기반 소모 로직 (FREE → EVENT → SUBSCRIPTION → PURCHASE)
 * v2.1: PRO 이상 구독자 무제한 생성 지원 (2025-12-02)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth'
import { consumeCredits, calculateBalance } from '@/lib/credits'
import { prisma } from '@/lib/prisma'
import { hasUnlimitedGeneration } from '@/constants/subscription'
import type { SubscriptionPlan } from '@/types/monetization'

// ============================================
// POST /api/credits/consume
// ============================================

/**
 * 크레딧 사용 (AI 생성 시)
 *
 * @auth Required
 * @permission 본인만 사용 가능
 * @body {
 *   amount: number  // 사용할 크레딧 수량
 *   description?: string  // 사용 내역 설명
 * }
 * @returns {
 *   transaction: CreditTransaction
 *   remainingBalance: number
 *   usageBreakdown: Array<{ sourceType: string, amount: number }>  // 타입별 사용 내역
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // NextAuth 세션에서 userId 가져오기
    const userId = await getCurrentUserId()

    if (!userId) {
      return NextResponse.json(
        { error: '로그인이 필요해요' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { amount, description } = body

    // 입력 검증
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: '올바른 크레딧 수량을 입력해주세요' },
        { status: 400 }
      )
    }

    // 구독 상태 확인 - PRO 이상 구독자는 무제한 생성
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      select: { tier: true, status: true },
    })

    // PRO 또는 PREMIUM 활성 구독자인지 확인
    const isActiveSubscriber =
      subscription?.status === 'ACTIVE' &&
      (subscription?.tier === 'PRO' || subscription?.tier === 'PREMIUM')

    // 무제한 생성 가능 여부 확인
    const plan = (subscription?.tier?.toLowerCase() || 'free') as SubscriptionPlan
    const isUnlimited = isActiveSubscriber && hasUnlimitedGeneration(plan)

    // PRO 이상 구독자는 크레딧 차감 없이 성공 반환
    if (isUnlimited) {
      // 현재 잔액 조회 (표시용)
      const { balance } = await calculateBalance(userId)

      return NextResponse.json({
        message: '구독자 무제한 생성으로 사용했어요',
        remainingBalance: balance,
        usageBreakdown: [], // 크레딧 사용 없음
        unlimitedGeneration: true,
      })
    }

    // Free 사용자: 크레딧 소모 (우선순위 기반: FREE → EVENT → SUBSCRIPTION → PURCHASE)
    try {
      const result = await consumeCredits(
        userId,
        amount,
        description || `${amount} 크레딧 사용`
      )

      return NextResponse.json({
        message: `${amount} 크레딧을 사용했어요`,
        remainingBalance: result.remaining,
        usageBreakdown: result.usageBreakdown, // 타입별 사용 내역
        unlimitedGeneration: false,
      })
    } catch (error) {
      if (error instanceof Error && error.message === '크레딧이 부족해요') {
        // 현재 잔액 조회
        const { balance } = await calculateBalance(userId)

        return NextResponse.json(
          {
            error: '크레딧이 부족해요',
            currentBalance: balance,
            required: amount,
            shortfall: amount - balance,
          },
          { status: 400 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error('크레딧 사용 실패:', error)
    return NextResponse.json(
      { error: '크레딧을 사용하지 못했어요' },
      { status: 500 }
    )
  }
}
