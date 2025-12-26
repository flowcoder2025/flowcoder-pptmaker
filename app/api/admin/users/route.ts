import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { requireAdmin, check } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { calculateBalance } from '@/lib/credits'
import { logger } from '@/lib/logger'

/**
 * Admin 사용자 목록 API
 * GET /api/admin/users
 */
export async function GET() {
  try {
    // 인증 및 관리자 권한 체크
    const session = await auth()
    await requireAdmin(session?.user?.id)

    // 사용자 목록 조회 (구독 정보 포함)
    const users = await prisma.user.findMany({
      include: {
        subscription: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // 각 사용자의 크래딧 잔액 및 관리자 여부 조회
    const usersWithDetails = await Promise.all(
      users.map(async (user) => {
        // 정확한 크래딧 잔액 계산 (만료된 크래딧 제외)
        const { balance } = await calculateBalance(user.id)

        // 관리자 여부 확인
        const isAdmin = await check(user.id, 'system', 'global', 'admin')

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt.toISOString(),
          creditBalance: balance,
          subscription: user.subscription
            ? {
                tier: user.subscription.tier,
                status: user.subscription.status,
                endDate: user.subscription.endDate?.toISOString() || null,
              }
            : null,
          isAdmin,
        }
      })
    )

    // 통계 계산
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const stats = {
      totalUsers: usersWithDetails.length,
      todaySignups: usersWithDetails.filter((u) => new Date(u.createdAt) >= today).length,
      weekSignups: usersWithDetails.filter((u) => new Date(u.createdAt) >= weekAgo).length,
      monthSignups: usersWithDetails.filter((u) => new Date(u.createdAt) >= monthAgo).length,
      adminCount: usersWithDetails.filter((u) => u.isAdmin).length,
      activeSubscriptions: usersWithDetails.filter(
        (u) => u.subscription?.status === 'ACTIVE'
      ).length,
    }

    return NextResponse.json({
      stats,
      users: usersWithDetails,
      total: users.length,
    })
  } catch (error) {
    logger.error('관리자 사용자 목록 조회 실패', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes('Unauthorized') ? 401 : 403 }
      )
    }

    return NextResponse.json(
      { error: '사용자 목록 조회에 실패했어요.' },
      { status: 500 }
    )
  }
}
