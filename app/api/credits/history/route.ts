/**
 * Credit History API - 크레딧 거래 내역
 *
 * GET /api/credits/history - 내 크레딧 거래 내역 조회
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'

// ============================================
// GET /api/credits/history
// ============================================

/**
 * 내 크레딧 거래 내역 조회
 *
 * @auth Required
 * @permission 본인만 조회 가능
 * @query {
 *   limit?: number  // 조회할 거래 수 (기본: 50, 최대: 100)
 *   offset?: number  // 건너뛸 거래 수 (페이지네이션)
 *   type?: 'PURCHASE' | 'USAGE' | 'REFUND' | 'BONUS'  // 거래 유형 필터
 * }
 * @returns {
 *   transactions: CreditTransaction[]
 *   total: number
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // NextAuth 세션에서 userId 가져오기
    const userId = await getCurrentUserId()

    if (!userId) {
      return NextResponse.json(
        { error: '로그인이 필요해요.' },
        { status: 401 }
      )
    }

    // Query 파라미터 파싱
    const { searchParams } = new URL(request.url)
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '50'),
      100
    )
    const offset = parseInt(searchParams.get('offset') || '0')
    const type = searchParams.get('type') as
      | 'PURCHASE'
      | 'USAGE'
      | 'REFUND'
      | 'BONUS'
      | null

    // Where 조건 구성
    const where: any = { userId }
    if (type) {
      where.type = type
    }

    // 거래 내역 조회 (페이지네이션)
    const [transactions, total] = await Promise.all([
      prisma.creditTransaction.findMany({
        where,
        select: {
          id: true,
          type: true,
          amount: true,
          balance: true,
          description: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: limit,
      }),
      prisma.creditTransaction.count({ where }),
    ])

    return NextResponse.json({
      transactions,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('크레딧 거래 내역 조회 실패:', error)
    return NextResponse.json(
      { error: '크레딧 거래 내역을 불러오지 못했어요.' },
      { status: 500 }
    )
  }
}
