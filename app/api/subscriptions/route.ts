/**
 * 구독 정보 조회 API
 *
 * GET /api/subscriptions
 * 현재 로그인한 사용자의 구독 정보를 반환해요
 *
 * 이 엔드포인트는 subscriptionStore.fetchSubscription()에서 호출됩니다.
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
