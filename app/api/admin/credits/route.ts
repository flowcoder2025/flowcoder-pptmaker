import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { requireAdmin } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

/**
 * Admin 크레딧 통계 및 거래 내역 조회 API
 * GET /api/admin/credits
 */
export async function GET() {
  try {
    // 인증 및 권한 체크
    const session = await auth()
    await requireAdmin(session?.user?.id)

    // 병렬로 통계 및 거래 내역 조회
    const [stats, transactions] = await Promise.all([
      // type별 통계
      prisma.creditTransaction.groupBy({
        by: ['type'],
        _sum: { amount: true },
      }),

      // 최근 거래 내역 (50개)
      prisma.creditTransaction.findMany({
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

    // 통계 데이터 변환
    const statsMap = stats.reduce(
      (acc, stat) => {
        acc[stat.type] = stat._sum.amount || 0
        return acc
      },
      {} as Record<string, number>
    )

    return NextResponse.json({
      stats: {
        purchase: statsMap.PURCHASE || 0,
        usage: Math.abs(statsMap.USAGE || 0), // 음수를 양수로
        refund: Math.abs(statsMap.REFUND || 0),
        bonus: statsMap.BONUS || 0,
      },
      transactions: transactions.map((tx) => ({
        id: tx.id,
        userId: tx.userId,
        userName: tx.user.name || tx.user.email || '알 수 없음',
        type: tx.type,
        amount: tx.amount,
        balance: tx.balance,
        description: tx.description,
        createdAt: tx.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Admin credits error:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes('Unauthorized') ? 401 : 403 }
      )
    }

    return NextResponse.json(
      { error: '크레딧 통계 조회에 실패했어요.' },
      { status: 500 }
    )
  }
}
