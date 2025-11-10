import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { requireAdmin } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

/**
 * Admin 대시보드 통계 API
 * GET /api/admin/stats
 */
export async function GET() {
  try {
    // 인증 및 관리자 권한 체크
    const session = await auth()
    await requireAdmin(session?.user?.id)

    // 오늘 날짜 (00:00:00)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 병렬로 통계 데이터 조회
    const [
      totalUsers,
      activeSubscriptions,
      creditStats,
      todayGenerations,
      recentActivities,
    ] = await Promise.all([
      // 1. 전체 사용자 수
      prisma.user.count(),

      // 2. 활성 구독 수
      prisma.subscription.count({
        where: { status: 'ACTIVE' },
      }),

      // 3. 크래딧 통계
      prisma.creditTransaction.aggregate({
        where: { type: 'PURCHASE' },
        _sum: { amount: true },
      }),

      // 4. 오늘의 생성 횟수
      prisma.generationHistory.count({
        where: {
          createdAt: { gte: today },
        },
      }),

      // 5. 최근 활동 내역 (최근 10개)
      prisma.generationHistory.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
    ])

    // 응답 데이터 구성
    const stats = {
      totalUsers,
      activeSubscriptions,
      totalCreditsPurchased: creditStats._sum.amount || 0,
      todayGenerations,
      recentActivities: recentActivities.map((activity) => ({
        id: activity.id,
        userId: activity.userId,
        userName: activity.user.name || activity.user.email || '알 수 없음',
        prompt: activity.prompt.substring(0, 50) + (activity.prompt.length > 50 ? '...' : ''),
        model: activity.model,
        creditsUsed: activity.creditsUsed,
        createdAt: activity.createdAt.toISOString(),
      })),
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Admin stats error:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes('Unauthorized') ? 401 : 403 }
      )
    }

    return NextResponse.json(
      { error: '통계 조회에 실패했어요.' },
      { status: 500 }
    )
  }
}
