/**
 * Subscription API - 구독 관리
 *
 * GET /api/subscriptions - 내 구독 정보 조회
 * POST /api/subscriptions - 구독 신청
 * DELETE /api/subscriptions - 구독 해지
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'

// ============================================
// GET /api/subscriptions
// ============================================

/**
 * 내 구독 정보 조회
 *
 * @auth Required
 * @permission 본인만 조회 가능
 * @returns {
 *   subscription: {
 *     id: string
 *     tier: 'FREE' | 'PRO' | 'PREMIUM'
 *     status: 'ACTIVE' | 'CANCELED' | 'EXPIRED'
 *     startDate: DateTime
 *     endDate?: DateTime
 *     createdAt: DateTime
 *     updatedAt: DateTime
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // NextAuth 세션에서 userId 가져오기
    const userId = await getCurrentUserId()

    if (!userId) {
      return NextResponse.json(
        { error: '로그인이 필요해요.' },
        { status: 401 }
      )
    }

    // 현재 ACTIVE 구독 조회
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        tier: true,
        status: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // 구독이 없으면 FREE 플랜 정보 반환
    if (!subscription) {
      return NextResponse.json({
        subscription: {
          tier: 'FREE',
          status: 'ACTIVE',
          startDate: new Date().toISOString(),
          endDate: null,
        },
      })
    }

    return NextResponse.json({
      subscription,
    })
  } catch (error) {
    console.error('구독 정보 조회 실패:', error)
    return NextResponse.json(
      { error: '구독 정보를 불러오지 못했어요.' },
      { status: 500 }
    )
  }
}

// ============================================
// POST /api/subscriptions
// ============================================

/**
 * 구독 신청
 *
 * @auth Required
 * @body {
 *   tier: 'PRO' | 'PREMIUM'
 *   paymentToken?: string  // 결제 토큰 (향후 인앱 결제 연동)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // NextAuth 세션에서 userId 가져오기
    const userId = await getCurrentUserId()

    if (!userId) {
      return NextResponse.json(
        { error: '로그인이 필요해요.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { tier, paymentToken } = body

    // 입력 검증
    if (!tier || !['PRO', 'PREMIUM'].includes(tier)) {
      return NextResponse.json(
        { error: '올바른 요금제를 선택해주세요.' },
        { status: 400 }
      )
    }

    // 기존 ACTIVE 구독 확인
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
    })

    if (existingSubscription) {
      return NextResponse.json(
        {
          error: '이미 구독 중이에요. 기존 구독을 해지한 후 다시 시도해주세요.',
          currentPlan: existingSubscription.tier,
        },
        { status: 400 }
      )
    }

    // TODO: 결제 검증 (향후 인앱 결제 API 연동)
    // if (paymentToken) {
    //   const paymentValid = await verifyPayment(paymentToken)
    //   if (!paymentValid) {
    //     return NextResponse.json(
    //       { error: '결제 검증에 실패했어요.' },
    //       { status: 400 }
    //     )
    //   }
    // }

    // 구독 기간 계산 (1개월)
    const startDate = new Date()
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + 1)

    // 구독 생성
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        tier,
        status: 'ACTIVE',
        startDate,
        endDate,
      },
      select: {
        id: true,
        tier: true,
        status: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(
      {
        subscription,
        message: `${tier} 요금제 구독을 시작했어요.`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('구독 신청 실패:', error)
    return NextResponse.json(
      { error: '구독을 시작하지 못했어요.' },
      { status: 500 }
    )
  }
}

// ============================================
// DELETE /api/subscriptions
// ============================================

/**
 * 구독 해지
 *
 * @auth Required
 * @permission 본인만 해지 가능
 */
export async function DELETE(request: NextRequest) {
  try {
    // NextAuth 세션에서 userId 가져오기
    const userId = await getCurrentUserId()

    if (!userId) {
      return NextResponse.json(
        { error: '로그인이 필요해요.' },
        { status: 401 }
      )
    }

    // 현재 ACTIVE 구독 찾기
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
    })

    if (!subscription) {
      return NextResponse.json(
        { error: '해지할 구독이 없어요.' },
        { status: 404 }
      )
    }

    // FREE 플랜은 해지 불가
    if (subscription.tier === 'FREE') {
      return NextResponse.json(
        { error: 'FREE 플랜은 해지할 수 없어요.' },
        { status: 400 }
      )
    }

    // 구독 상태를 CANCELED로 변경 (소프트 해지)
    const updatedSubscription = await prisma.subscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        status: 'CANCELED',
      },
      select: {
        id: true,
        tier: true,
        status: true,
        startDate: true,
        endDate: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      subscription: updatedSubscription,
      message: '구독을 해지했어요. 기간 종료 시까지 계속 사용하실 수 있어요.',
    })
  } catch (error) {
    console.error('구독 해지 실패:', error)
    return NextResponse.json(
      { error: '구독을 해지하지 못했어요.' },
      { status: 500 }
    )
  }
}
