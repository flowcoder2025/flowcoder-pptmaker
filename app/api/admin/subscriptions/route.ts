import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { requireAdmin } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    await requireAdmin(session?.user?.id)

    const [tierStats, subscriptions] = await Promise.all([
      prisma.subscription.groupBy({
        by: ['tier', 'status'],
        _count: true,
      }),

      prisma.subscription.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ])

    return NextResponse.json({
      stats: tierStats,
      subscriptions: subscriptions.map((sub) => ({
        id: sub.id,
        userId: sub.userId,
        userName: sub.user.name || sub.user.email || '알 수 없음',
        tier: sub.tier,
        status: sub.status,
        startDate: sub.startDate.toISOString(),
        endDate: sub.endDate?.toISOString() || null,
      })),
    })
  } catch (error) {
    console.error('Admin subscriptions error:', error)
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes('Unauthorized') ? 401 : 403 }
      )
    }
    return NextResponse.json(
      { error: '구독 통계 조회에 실패했어요.' },
      { status: 500 }
    )
  }
}
