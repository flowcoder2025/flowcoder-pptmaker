/**
 * 구독 정보 조회 API
 *
 * GET /api/subscriptions/current
 * 현재 로그인한 사용자의 구독 정보를 반환해요
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

    // 3. 구독 정보가 없으면 FREE 플랜으로 간주
    if (!subscription) {
      return NextResponse.json({
        plan: 'free',
        status: 'active',
        startDate: null,
        endDate: null,
        daysRemaining: 0,
      })
    }

    // 4. 남은 일수 계산
    const now = new Date()
    const endDate = subscription.endDate ? new Date(subscription.endDate) : null
    const daysRemaining = endDate
      ? Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0

    // 5. 구독 상태 결정
    let status = subscription.status.toLowerCase()
    if (endDate && endDate < now) {
      status = 'expired'
    }

    // 6. 응답 반환
    return NextResponse.json({
      plan: subscription.tier.toLowerCase(), // 'FREE', 'PRO', 'PREMIUM' → 'free', 'pro', 'premium'
      status,
      startDate: subscription.startDate.toISOString(),
      endDate: subscription.endDate?.toISOString() || null,
      daysRemaining,
    })
  } catch (error) {
    console.error('[API] 구독 정보 조회 실패:', error)
    return NextResponse.json(
      { error: '구독 정보를 가져올 수 없어요' },
      { status: 500 }
    )
  }
}
