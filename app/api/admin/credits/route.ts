import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { requireAdmin } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

/**
 * Admin 크레딧 통계 및 거래 내역 조회 API
 * GET /api/admin/credits?search=email&sourceType=FREE&includeExpired=false
 */
export async function GET(req: Request) {
  try {
    // 인증 및 권한 체크
    const session = await auth()
    await requireAdmin(session?.user?.id)

    // Query 파라미터 파싱
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const sourceType = searchParams.get('sourceType') || ''
    const includeExpired = searchParams.get('includeExpired') === 'true'

    // Where 조건 구성
    const whereClause: Record<string, unknown> = {}

    // sourceType 필터 (FREE, EVENT, SUBSCRIPTION, PURCHASE)
    if (sourceType && ['FREE', 'EVENT', 'SUBSCRIPTION', 'PURCHASE'].includes(sourceType)) {
      whereClause.sourceType = sourceType
    }

    // 만료 필터 (만료된 크레딧 제외 또는 포함)
    if (!includeExpired) {
      whereClause.OR = [
        { expiresAt: null }, // 영구 크레딧
        { expiresAt: { gt: new Date() } }, // 아직 만료 안됨
      ]
    }

    // 검색 필터 (사용자 이메일 또는 이름)
    if (search) {
      whereClause.user = {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ],
      }
    }

    // 병렬로 통계 및 거래 내역 조회
    const [stats, transactions] = await Promise.all([
      // type별 통계
      prisma.creditTransaction.groupBy({
        by: ['type'],
        _sum: { amount: true },
      }),

      // 거래 내역 (필터 적용, 최대 100개)
      prisma.creditTransaction.findMany({
        where: whereClause,
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
        sourceType: tx.sourceType,
        amount: tx.amount,
        balance: tx.balance,
        description: tx.description,
        expiresAt: tx.expiresAt ? tx.expiresAt.toISOString() : null,
        createdAt: tx.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    logger.error('관리자 크레딧 통계 조회 실패', error)

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
