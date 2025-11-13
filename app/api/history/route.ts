/**
 * Generation History API - AI 생성 이력 조회
 *
 * GET /api/history - 내 AI 생성 이력 목록 조회
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'

// ============================================
// GET /api/history
// ============================================

/**
 * 내 AI 생성 이력 목록 조회
 *
 * @auth Required
 * @permission 본인만 조회 가능
 * @query {
 *   limit?: number  // 조회할 이력 수 (기본: 20, 최대: 100)
 *   offset?: number  // 건너뛸 이력 수 (페이지네이션)
 *   model?: 'gemini-flash' | 'gemini-pro'  // AI 모델 필터
 *   useResearch?: boolean  // 자료 조사 사용 여부 필터
 * }
 * @returns {
 *   history: GenerationHistory[]
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
      parseInt(searchParams.get('limit') || '20'),
      100
    )
    const offset = parseInt(searchParams.get('offset') || '0')
    const model = searchParams.get('model') as
      | 'gemini-flash'
      | 'gemini-pro'
      | null
    const useResearchParam = searchParams.get('useResearch')
    const useResearch =
      useResearchParam === 'true'
        ? true
        : useResearchParam === 'false'
        ? false
        : undefined

    // Where 조건 구성
    const where: Record<string, unknown> = { userId }
    if (model) {
      where.model = model
    }
    if (useResearch !== undefined) {
      where.useResearch = useResearch
    }

    // 생성 이력 조회 (페이지네이션)
    const [history, total] = await Promise.all([
      prisma.generationHistory.findMany({
        where,
        select: {
          id: true,
          presentationId: true,
          prompt: true,
          model: true,
          useResearch: true,
          creditsUsed: true,
          createdAt: true,
          // result는 크기가 크므로 목록에서는 제외
          presentation: {
            select: {
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: limit,
      }),
      prisma.generationHistory.count({ where }),
    ])

    return NextResponse.json({
      history,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('생성 이력 조회 실패:', error)
    return NextResponse.json(
      { error: '생성 이력을 불러오지 못했어요.' },
      { status: 500 }
    )
  }
}
