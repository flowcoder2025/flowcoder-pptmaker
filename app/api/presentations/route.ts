/**
 * Presentation API - 프레젠테이션 CRUD
 *
 * GET /api/presentations - 내 프레젠테이션 목록 조회
 * POST /api/presentations - 새 프레젠테이션 생성
 *
 * Updated: 2025-11-11 - Added slides field for thumbnail rendering
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { grantPresentationOwnership } from '@/lib/permissions'
import { getCurrentUserId } from '@/lib/auth'
import { calculateBalance, consumeCredits } from '@/lib/credits'

// ============================================
// GET /api/presentations
// ============================================

/**
 * 내 프레젠테이션 목록 조회
 *
 * @auth Required
 * @permission viewer (본인의 프레젠테이션만 조회)
 * @query page - 페이지 번호 (기본값: 1)
 * @query limit - 페이지당 아이템 수 (기본값: 12)
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

    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '12', 10)

    // 페이지네이션 계산
    const skip = (page - 1) * limit

    // 병렬 쿼리: 프레젠테이션 목록 + 전체 개수
    const [presentations, totalCount] = await Promise.all([
      prisma.presentation.findMany({
        where: {
          userId,
          deletedAt: null,
        },
        select: {
          id: true,
          title: true,
          description: true,
          slides: true,      // 썸네일 렌더링용 (HTMLSlide[] - 렌더링된 HTML)
          slideData: true,   // 편집용 (UnifiedPPTJSON - 구조화된 데이터)
          metadata: true,
          isPublic: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.presentation.count({
        where: {
          userId,
          deletedAt: null,
        },
      }),
    ])

    // 총 페이지 수 계산
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      presentations,
      count: presentations.length,
      totalCount,
      totalPages,
      currentPage: page,
      limit,
    })
  } catch (error) {
    console.error('프레젠테이션 목록 조회 실패:', error)
    return NextResponse.json(
      { error: '프레젠테이션 목록을 불러오지 못했어요.' },
      { status: 500 }
    )
  }
}

// ============================================
// POST /api/presentations
// ============================================

/**
 * 새 프레젠테이션 생성
 *
 * @auth Required
 * @body {
 *   title: string
 *   description?: string
 *   slideData: UnifiedPPTJSON
 *   metadata?: object
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // NextAuth 세션에서 userId 가져오기
    const userId = await getCurrentUserId()

    if (!userId) {
      return NextResponse.json(
        { error: '로그인이 필요해요.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, description, slideData, slides, metadata } = body

    // 입력 검증
    if (!title || !slideData) {
      return NextResponse.json(
        { error: '제목과 슬라이드 데이터는 필수예요.' },
        { status: 400 }
      )
    }

    console.log('[POST /api/presentations] Creating presentation:', {
      userId,
      title,
      hasDescription: !!description,
      hasSlideData: !!slideData,
      hasSlides: !!slides,
      slidesLength: slides?.length,
      hasMetadata: !!metadata,
    })

    // 1. 크레딧 차감 금액 계산
    const useProContentModel = metadata?.useProContentModel || false
    const researchMode = metadata?.researchMode || 'none'

    let creditsToCharge = 0

    // Pro 모델 사용 시 50 크레딧
    if (useProContentModel) {
      creditsToCharge += 50
    }

    // 심층 조사 사용 시 40 크레딧 추가
    if (researchMode === 'deep') {
      creditsToCharge += 40
    }

    // Flash + 빠른 조사 = 0 크레딧 (무료)
    // Flash + 조사 안함 = 0 크레딧 (무료)

    if (creditsToCharge > 0) {
      console.log(`[POST /api/presentations] 유료 옵션 사용 - ${creditsToCharge} 크레딧 필요`)

      // 크레딧 잔액 확인
      let balance = 0
      try {
        const balanceResult = await calculateBalance(userId)
        balance = balanceResult.balance
        console.log('[POST /api/presentations] 크레딧 잔액:', balance)
      } catch (balanceError) {
        console.error('❌ [POST /api/presentations] 잔액 조회 실패:', balanceError)
        return NextResponse.json(
          { error: '크레딧 잔액 조회에 실패했어요' },
          { status: 500 }
        )
      }

      if (balance < creditsToCharge) {
        return NextResponse.json(
          {
            error: '크레딧이 부족해요',
            currentBalance: balance,
            required: creditsToCharge,
          },
          { status: 400 }
        )
      }
    } else {
      console.log('[POST /api/presentations] 무료 옵션 (Flash + 조사 안함/빠른 조사) - 크레딧 차감 안함')
    }

    // 2. 프레젠테이션 생성
    let presentation
    try {
      presentation = await prisma.presentation.create({
        data: {
          userId,
          title,
          description: description || null,
          slideData,
          slides: slides || null,  // HTML 캐시 (optional)
          metadata: metadata || null,
          isPublic: false,
        },
        select: {
          id: true,
          title: true,
          description: true,
          metadata: true,
          createdAt: true,
          updatedAt: true,
        },
      })
      console.log('[POST /api/presentations] Presentation created:', presentation.id)
    } catch (dbError) {
      console.error('❌ [POST /api/presentations] DB 생성 실패:', dbError)
      console.error('DB Error details:', {
        error: dbError instanceof Error ? dbError.message : String(dbError),
        stack: dbError instanceof Error ? dbError.stack : undefined,
      })
      throw new Error(`데이터베이스 저장에 실패했어요: ${dbError instanceof Error ? dbError.message : '알 수 없는 오류'}`)
    }

    // 3. 크레딧 차감 (유료 옵션만)
    if (creditsToCharge > 0) {
      try {
        const description = `프리젠테이션 생성: ${title} (${useProContentModel ? 'Pro 모델 50' : ''}${useProContentModel && researchMode === 'deep' ? ' + ' : ''}${researchMode === 'deep' ? '심층 조사 40' : ''} 크레딧)`
        await consumeCredits(userId, creditsToCharge, description)
        console.log(`[POST /api/presentations] Credit consumed (${creditsToCharge} credits)`)
      } catch (creditError) {
        console.error('❌ [POST /api/presentations] 크레딧 차감 실패:', creditError)
        console.error('Credit Error details:', {
          error: creditError instanceof Error ? creditError.message : String(creditError),
          stack: creditError instanceof Error ? creditError.stack : undefined,
        })
        // 크레딧 차감 실패 시 프레젠테이션 삭제 (롤백)
        try {
          await prisma.presentation.delete({ where: { id: presentation.id } })
          console.log('[POST /api/presentations] Rollback: Presentation deleted')
        } catch (rollbackError) {
          console.error('❌ [POST /api/presentations] Rollback 실패:', rollbackError)
        }
        throw new Error(`크레딧 차감에 실패했어요: ${creditError instanceof Error ? creditError.message : '알 수 없는 오류'}`)
      }
    } else {
      console.log('[POST /api/presentations] 무료 옵션 - 크레딧 차감 건너뜀')
    }

    // 4. GenerationHistory 생성 (모니터링용)
    try {
      const historyData = {
        userId,
        presentationId: presentation.id,
        prompt: (metadata?.prompt as string) || title, // fallback: title
        model: (metadata?.model as string) || 'gemini-flash', // fallback
        useResearch: (metadata?.useResearch as boolean) || false,
        creditsUsed: creditsToCharge, // 실제 사용한 크레딧
        result: slideData, // 생성된 데이터
      }

      console.log('[POST /api/presentations] Creating GenerationHistory with:', {
        userId,
        presentationId: presentation.id,
        prompt: historyData.prompt.substring(0, 50) + '...',
        model: historyData.model,
        useResearch: historyData.useResearch,
      })

      await prisma.generationHistory.create({ data: historyData })
      console.log('[POST /api/presentations] GenerationHistory created')
    } catch (historyError) {
      console.error('❌ [POST /api/presentations] GenerationHistory 생성 실패:', historyError)
      console.error('History Error details:', {
        error: historyError instanceof Error ? historyError.message : String(historyError),
        stack: historyError instanceof Error ? historyError.stack : undefined,
        metadata,
      })
      // 히스토리 생성 실패는 치명적이지 않으므로 계속 진행
    }

    // 5. Zanzibar 권한 부여: 생성자를 owner로 설정
    try {
      await grantPresentationOwnership(presentation.id, userId)
      console.log('[POST /api/presentations] Ownership granted')
    } catch (permissionError) {
      console.error('❌ [POST /api/presentations] 권한 부여 실패:', permissionError)
      console.error('Permission Error details:', {
        error: permissionError instanceof Error ? permissionError.message : String(permissionError),
        stack: permissionError instanceof Error ? permissionError.stack : undefined,
      })
      // 권한 부여 실패 시 프레젠테이션 삭제 (롤백)
      try {
        await prisma.presentation.delete({ where: { id: presentation.id } })
        console.log('[POST /api/presentations] Rollback: Presentation deleted')
      } catch (rollbackError) {
        console.error('❌ [POST /api/presentations] Rollback 실패:', rollbackError)
      }
      throw new Error(`권한 설정에 실패했어요: ${permissionError instanceof Error ? permissionError.message : '알 수 없는 오류'}`)
    }

    return NextResponse.json(
      {
        presentation,
        message: '프리젠테이션을 생성했어요.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('❌ [POST /api/presentations] 프레젠테이션 생성 실패:', error)

    // 상세 에러 메시지
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
    const errorStack = error instanceof Error ? error.stack : ''

    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
    })

    return NextResponse.json(
      {
        error: '프레젠테이션을 생성하지 못했어요.',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    )
  }
}
