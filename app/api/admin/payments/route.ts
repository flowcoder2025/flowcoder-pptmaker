import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { requireAdmin } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const session = await auth()
    await requireAdmin(session?.user?.id)

    // 병렬로 통계 및 결제 목록 조회
    const [stats, payments] = await Promise.all([
      // 상태별 통계
      prisma.payment.groupBy({
        by: ['status'],
        _count: true,
        _sum: {
          amount: true,
        },
      }),

      // 최근 결제 목록 (100개)
      prisma.payment.findMany({
        take: 100,
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

    // 통계 계산
    const totalAmount = stats.reduce((sum, stat) => sum + (stat._sum.amount || 0), 0)
    const totalCount = stats.reduce((sum, stat) => sum + stat._count, 0)
    const paidCount = stats.find((s) => s.status === 'PAID')?._count || 0
    const failedCount = stats.find((s) => s.status === 'FAILED')?._count || 0
    const refundedCount = stats.find((s) => s.status === 'REFUNDED')?._count || 0

    return NextResponse.json({
      stats: {
        totalAmount,
        totalCount,
        paidCount,
        failedCount,
        refundedCount,
      },
      payments: payments.map((payment) => ({
        id: payment.id,
        paymentId: payment.paymentId,
        userId: payment.userId,
        userName: payment.user.name || payment.user.email || '알 수 없음',
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        purpose: payment.purpose,
        receiptUrl: payment.receiptUrl,
        failReason: payment.failReason,
        createdAt: payment.createdAt.toISOString(),
        updatedAt: payment.updatedAt.toISOString(),
      })),
    })
  } catch (error) {
    logger.error('관리자 결제 목록 조회 실패', error)
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes('Unauthorized') ? 401 : 403 }
      )
    }
    return NextResponse.json(
      { error: '결제 목록 조회에 실패했어요.' },
      { status: 500 }
    )
  }
}
