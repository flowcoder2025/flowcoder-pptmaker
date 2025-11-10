import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { requireAdmin } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    await requireAdmin(session?.user?.id)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [todayCount, weekCount, monthCount, recentGenerations] = await Promise.all([
      prisma.generationHistory.count({
        where: { createdAt: { gte: today } },
      }),

      prisma.generationHistory.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),

      prisma.generationHistory.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),

      prisma.generationHistory.findMany({
        take: 50,
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
      stats: {
        today: todayCount,
        week: weekCount,
        month: monthCount,
      },
      generations: recentGenerations.map((gen) => ({
        id: gen.id,
        userId: gen.userId,
        userName: gen.user.name || gen.user.email || '알 수 없음',
        prompt: gen.prompt.substring(0, 100) + (gen.prompt.length > 100 ? '...' : ''),
        model: gen.model,
        useResearch: gen.useResearch,
        creditsUsed: gen.creditsUsed,
        createdAt: gen.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Admin monitoring error:', error)
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes('Unauthorized') ? 401 : 403 }
      )
    }
    return NextResponse.json(
      { error: '모니터링 데이터 조회에 실패했어요.' },
      { status: 500 }
    )
  }
}
