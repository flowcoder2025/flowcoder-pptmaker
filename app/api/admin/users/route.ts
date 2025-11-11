import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { requireAdmin, check } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { calculateBalance } from '@/lib/credits'

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

    return NextResponse.json({
      users: usersWithDetails,
      total: users.length,
    })
  } catch (error) {
    console.error('Admin users list error:', error)

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
