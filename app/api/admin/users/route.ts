import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { requireAdmin, checkAdminBatch } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { calculateBalanceBatch } from '@/lib/credits'
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

    // 사용자 ID 목록 추출
    const userIds = users.map((user) => user.id)

    // 배치로 크레딧 잔액 및 admin 권한 조회 (N+1 쿼리 문제 해결)
    const [balanceMap, adminMap] = await Promise.all([
      calculateBalanceBatch(userIds),
      checkAdminBatch(userIds),
    ])

    // 결과 조합
    const usersWithDetails = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      creditBalance: balanceMap.get(user.id) || 0,
      subscription: user.subscription
        ? {
            tier: user.subscription.tier,
            status: user.subscription.status,
            endDate: user.subscription.endDate?.toISOString() || null,
          }
        : null,
      isAdmin: adminMap.get(user.id) || false,
    }))

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
