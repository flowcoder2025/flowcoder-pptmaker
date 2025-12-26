/**
 * Generation History Detail API - 특정 AI 생성 이력 상세 조회
 *
 * GET /api/history/[id] - 특정 생성 이력 상세 조회 (result 포함)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'
import { logger } from '@/lib/logger'

// ============================================
// GET /api/history/[id]
// ============================================

/**
 * 특정 AI 생성 이력 상세 조회
 *
 * @auth Required
 * @permission 본인만 조회 가능
 * @param id - 생성 이력 ID
 * @returns {
 *   history: GenerationHistory (result 포함)
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // NextAuth 세션에서 userId 가져오기
    const userId = await getCurrentUserId()

    if (!userId) {
      return NextResponse.json(
        { error: '로그인이 필요해요.' },
        { status: 401 }
      )
    }

    const { id } = await params

    // 생성 이력 조회 (본인 것만)
    const history = await prisma.generationHistory.findFirst({
      where: {
        id,
        userId, // 본인만 조회 가능
      },
      select: {
        id: true,
        presentationId: true,
        prompt: true,
        model: true,
        useResearch: true,
        creditsUsed: true,
        result: true, // 상세 조회에는 result 포함
        createdAt: true,
        presentation: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    })

    if (!history) {
      return NextResponse.json(
        { error: '생성 이력을 찾지 못했어요.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      history,
    })
  } catch (error) {
    logger.error('생성 이력 상세 조회 실패', error)
    return NextResponse.json(
      { error: '생성 이력을 불러오지 못했어요.' },
      { status: 500 }
    )
  }
}
