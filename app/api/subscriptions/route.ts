/**
 * 구독 정보 조회 및 생성 API
 *
 * GET /api/subscriptions - 현재 구독 정보 조회
 * POST /api/subscriptions - 새 구독 시작 (크레딧 지급)
 *
 * 이 엔드포인트는 subscriptionStore.fetchSubscription()에서 호출됩니다.
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { grantCredits } from '@/lib/credits'
import { CreditSourceType } from '@/types/credits'

// ============================================
// GET /api/subscriptions
// ============================================

export async function GET() {
  try {
    // 1. 인증 체크
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요해요' },
        { status: 401 }
      )
    }

    // 2. Prisma로 구독 정보 조회
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    })

    // 3. 구독 정보가 없으면 404 (FREE 플랜은 DB에 저장 안 함)
    if (!subscription) {
      return NextResponse.json(
        { error: '구독 정보가 없어요' },
        { status: 404 }
      )
    }

    // 4. 응답 반환 (subscriptionStore.fetchSubscription() 기대 형식)
    return NextResponse.json({
      subscription: {
        id: subscription.id,
        tier: subscription.tier, // 'FREE', 'PRO', 'PREMIUM'
        status: subscription.status, // 'ACTIVE', 'CANCELED', 'EXPIRED'
        startDate: subscription.startDate.toISOString(),
        endDate: subscription.endDate?.toISOString() || null,
      },
    })
  } catch (error) {
    console.error('[API] 구독 정보 조회 실패:', error)
    return NextResponse.json(
      { error: '구독 정보를 가져올 수 없어요' },
      { status: 500 }
    )
  }
}

// ============================================
// POST /api/subscriptions
// ============================================

/**
 * 구독 시작 (크레딧 자동 지급)
 *
 * @auth Required
 * @body {
 *   tier: 'PRO' | 'PREMIUM'  // 구독 플랜
 * }
 * @returns {
 *   subscription: Subscription
 *   creditsGranted: number
 *   message: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 인증 체크
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요해요' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { tier } = body

    // 2. 입력 검증
    if (!tier || !['PRO', 'PREMIUM'].includes(tier)) {
      return NextResponse.json(
        { error: '올바른 플랜을 선택해주세요' },
        { status: 400 }
      )
    }

    // 3. 크레딧 지급 수량 결정
    const creditsAmount = tier === 'PRO' ? 490 : 1000 // Premium은 임시로 1000

    // 4. 기존 구독 확인
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    })

    let subscription
    const now = new Date()
    const endDate = new Date(now)
    endDate.setDate(endDate.getDate() + 30) // 30일 후

    if (existingSubscription) {
      // 기존 구독 업데이트
      subscription = await prisma.subscription.update({
        where: { userId: session.user.id },
        data: {
          tier,
          status: 'ACTIVE',
          startDate: now,
          endDate,
        },
      })
      console.log('[POST /api/subscriptions] 구독 업데이트:', subscription.id)
    } else {
      // 신규 구독 생성
      subscription = await prisma.subscription.create({
        data: {
          userId: session.user.id,
          tier,
          status: 'ACTIVE',
          startDate: now,
          endDate,
        },
      })
      console.log('[POST /api/subscriptions] 신규 구독 생성:', subscription.id)
    }

    // 5. 크레딧 지급 (30일 유효기간)
    await grantCredits(
      session.user.id,
      CreditSourceType.SUBSCRIPTION,
      creditsAmount,
      `${tier} 플랜 월간 크레딧`,
      30 // 30일 유효기간
    )

    console.log(`[POST /api/subscriptions] 크레딧 지급 완료: ${creditsAmount} 크레딧`)

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        tier: subscription.tier,
        status: subscription.status,
        startDate: subscription.startDate.toISOString(),
        endDate: subscription.endDate?.toISOString() || null,
      },
      creditsGranted: creditsAmount,
      message: `${tier} 플랜 구독을 시작했어요. ${creditsAmount} 크레딧을 지급했어요.`,
    })
  } catch (error) {
    console.error('❌ [POST /api/subscriptions] 구독 생성 실패:', error)
    return NextResponse.json(
      { error: '구독을 시작하지 못했어요' },
      { status: 500 }
    )
  }
}
