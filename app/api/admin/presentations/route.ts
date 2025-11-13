/**
 * Admin Presentations API - 전체 프레젠테이션 관리
 *
 * GET /api/admin/presentations - 전체 프레젠테이션 목록 조회
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/permissions'
import { getCurrentUserId } from '@/lib/auth'

// ============================================
// GET /api/admin/presentations
// ============================================

/**
 * 전체 프레젠테이션 목록 조회 (관리자 전용)
 *
 * @auth Required
 * @permission admin (Zanzibar 'system:global#admin')
 * @query {
 *   limit?: number  // 조회할 프레젠테이션 수 (기본: 50, 최대: 100)
 *   offset?: number  // 건너뛸 프레젠테이션 수 (페이지네이션)
 *   includeDeleted?: boolean  // 삭제된 프레젠테이션 포함 여부
 * }
 * @returns {
 *   presentations: Presentation[]
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
    const includeDeleted = searchParams.get('includeDeleted') === 'true'

    // Where 조건 구성
    const where: Record<string, unknown> = {}
    if (!includeDeleted) {
      where.deletedAt = null // 기본: 삭제되지 않은 것만
    }

    // 프레젠테이션 목록 조회 (페이지네이션)
    const [presentations, total] = await Promise.all([
      prisma.presentation.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          isPublic: true,
          metadata: true,
          deletedAt: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: limit,
      }),
      prisma.presentation.count({ where }),
    ])

    return NextResponse.json({
      presentations,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('프레젠테이션 목록 조회 실패:', error)

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
      { error: '프레젠테이션 목록을 불러오지 못했어요.' },
      { status: 500 }
    )
  }
}
