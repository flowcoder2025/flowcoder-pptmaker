/**
 * Admin Users API - 전체 사용자 관리
 *
 * GET /api/admin/users - 전체 사용자 목록 조회
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/permissions'
import { getCurrentUserId } from '@/lib/auth'

// ============================================
// GET /api/admin/users
// ============================================

/**
 * 전체 사용자 목록 조회 (관리자 전용)
 *
 * @auth Required
 * @permission admin (Zanzibar 'system:global#admin')
 * @query {
 *   limit?: number  // 조회할 사용자 수 (기본: 50, 최대: 100)
 *   offset?: number  // 건너뛸 사용자 수 (페이지네이션)
 *   search?: string  // 이메일 또는 이름 검색
 * }
 * @returns {
 *   users: User[]
 *   total: number
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // NextAuth 세션에서 userId 가져오기
    const userId = await getCurrentUserId()

    // 관리자 권한 확인 (에러 발생 시 catch에서 처리)
    await requireAdmin(userId)

    // Query 파라미터 파싱
    const { searchParams } = new URL(request.url)
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '50'),
      100
    )
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search')

    // Where 조건 구성 (검색)
    const where: any = {}
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ]
    }

    // 사용자 목록 조회 (페이지네이션)
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          createdAt: true,
          updatedAt: true,
          subscription: {
            select: {
              tier: true,
              status: true,
              endDate: true,
            },
          },
          _count: {
            select: {
              presentations: true,
              creditTransactions: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      users,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('사용자 목록 조회 실패:', error)

    // 권한 에러 처리
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json(
          { error: '로그인이 필요해요.' },
          { status: 401 }
        )
      }
      if (error.message.includes('Forbidden')) {
        return NextResponse.json(
          { error: '관리자 권한이 필요해요.' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(
      { error: '사용자 목록을 불러오지 못했어요.' },
      { status: 500 }
    )
  }
}
