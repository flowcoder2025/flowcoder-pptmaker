/**
 * Presentation API - 프레젠테이션 CRUD
 *
 * GET /api/presentations - 내 프레젠테이션 목록 조회
 * POST /api/presentations - 새 프레젠테이션 생성
 *
 * Updated: 2025-11-11 - Added slides field for thumbnail rendering
 */

import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { grantPresentationOwnership } from '@/lib/permissions'
import { getCurrentUserId } from '@/lib/auth'
import { calculateBalance, consumeCredits } from '@/lib/credits'
import { logger } from '@/lib/logger'
import { presentationCreateRequestSchema, validateRequest } from '@/lib/validations'
import { hasUnlimitedGeneration } from '@/constants/subscription'
import type { SubscriptionPlan } from '@/types/monetization'

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
    logger.error('프레젠테이션 목록 조회 실패', error)
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

    // Zod 스키마 검증
    const body = await request.json()
    const validation = validateRequest(presentationCreateRequestSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { title, description, slideData, slides, metadata } = validation.data

    logger.info('프레젠테이션 생성 시작', {
      userId,
      title,
      hasDescription: !!description,
      hasSlideData: !!slideData,
      hasSlides: !!slides,
      slidesLength: slides?.length,
      hasMetadata: !!metadata,
    })

    // 1. 구독 정보 조회 (PRO/Premium은 무제한 생성)
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      select: { tier: true, status: true, endDate: true },
    })

    // 구독 상태 확인 및 무제한 생성 여부 체크
    const userPlan = (subscription?.tier?.toLowerCase() || 'free') as SubscriptionPlan
    const isSubscriptionActive = subscription
      ? subscription.status === 'ACTIVE' && (!subscription.endDate || new Date(subscription.endDate) > new Date())
      : false
    const userHasUnlimitedGeneration = isSubscriptionActive && hasUnlimitedGeneration(userPlan)

    logger.debug('구독 정보 확인', { userPlan, isSubscriptionActive, userHasUnlimitedGeneration })

    // 2. 크레딧 차감 금액 계산 (무제한 생성 구독자는 무료)
    const useProContentModel = metadata?.useProContentModel || false
    const researchMode = metadata?.researchMode || 'none'

    let creditsToCharge = 0

    // PRO/Premium 구독자는 심층 검색 + 고품질 생성 무료
    if (!userHasUnlimitedGeneration) {
      // Pro 모델 사용 시 50 크레딧 (무료 사용자만)
      if (useProContentModel) {
        creditsToCharge += 50
      }

      // 심층 조사 사용 시 40 크레딧 추가 (무료 사용자만)
      if (researchMode === 'deep') {
        creditsToCharge += 40
      }
    } else {
      logger.info('PRO/Premium 구독 혜택: 심층 검색 + 고품질 생성 무료', { userPlan })
    }

    // Flash + 빠른 조사 = 0 크레딧 (무료)
    // Flash + 조사 안함 = 0 크레딧 (무료)

    if (creditsToCharge > 0) {
      logger.info('유료 옵션 사용', { creditsToCharge })

      // 크레딧 잔액 확인
      let balance = 0
      try {
        const balanceResult = await calculateBalance(userId)
        balance = balanceResult.balance
        logger.debug('크레딧 잔액 확인', { balance })
      } catch (balanceError) {
        logger.error('잔액 조회 실패', balanceError)
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
      logger.debug('무료 옵션 사용 - 크레딧 차감 없음')
    }

    // 3. 프레젠테이션 생성
    let presentation
    try {
      presentation = await prisma.presentation.create({
        data: {
          userId,
          title,
          description: description || null,
          slideData: slideData as Prisma.InputJsonValue,
          slides: slides ? (slides as Prisma.InputJsonValue) : undefined,
          metadata: metadata ? (metadata as Prisma.InputJsonValue) : undefined,
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
      logger.info('프레젠테이션 생성 완료', { presentationId: presentation.id })
    } catch (dbError) {
      logger.error('DB 생성 실패', dbError)
      throw new Error(`데이터베이스 저장에 실패했어요: ${dbError instanceof Error ? dbError.message : '알 수 없는 오류'}`)
    }

    // 4. 크레딧 차감 (유료 옵션만)
    if (creditsToCharge > 0) {
      try {
        const creditDescription = `프리젠테이션 생성: ${title} (${useProContentModel ? 'Pro 모델 50' : ''}${useProContentModel && researchMode === 'deep' ? ' + ' : ''}${researchMode === 'deep' ? '심층 조사 40' : ''} 크레딧)`
        await consumeCredits(userId, creditsToCharge, creditDescription)
        logger.info('크레딧 차감 완료', { creditsToCharge })
      } catch (creditError) {
        logger.error('크레딧 차감 실패', creditError)
        // 크레딧 차감 실패 시 프레젠테이션 삭제 (롤백)
        try {
          await prisma.presentation.delete({ where: { id: presentation.id } })
          logger.info('롤백: 프레젠테이션 삭제')
        } catch (rollbackError) {
          logger.error('롤백 실패', rollbackError)
        }
        throw new Error(`크레딧 차감에 실패했어요: ${creditError instanceof Error ? creditError.message : '알 수 없는 오류'}`)
      }
    } else {
      logger.debug('무료 옵션 - 크레딧 차감 건너뜀')
    }

    // 5. GenerationHistory 생성 (모니터링용)
    try {
      const historyData = {
        userId,
        presentationId: presentation.id,
        prompt: (metadata?.prompt as string) || title, // fallback: title
        model: (metadata?.model as string) || 'gemini-flash', // fallback
        useResearch: (metadata?.useResearch as boolean) || false,
        creditsUsed: creditsToCharge, // 실제 사용한 크레딧
        result: slideData as Prisma.InputJsonValue, // 생성된 데이터
      }

      logger.debug('GenerationHistory 생성 중', {
        userId,
        presentationId: presentation.id,
        model: historyData.model,
        useResearch: historyData.useResearch,
      })

      await prisma.generationHistory.create({ data: historyData })
      logger.info('GenerationHistory 생성 완료')
    } catch (historyError) {
      logger.warn('GenerationHistory 생성 실패 (계속 진행)', historyError)
      // 히스토리 생성 실패는 치명적이지 않으므로 계속 진행
    }

    // 6. Zanzibar 권한 부여: 생성자를 owner로 설정
    try {
      await grantPresentationOwnership(presentation.id, userId)
      logger.info('권한 부여 완료')
    } catch (permissionError) {
      logger.error('권한 부여 실패', permissionError)
      // 권한 부여 실패 시 프레젠테이션 삭제 (롤백)
      try {
        await prisma.presentation.delete({ where: { id: presentation.id } })
        logger.info('롤백: 프레젠테이션 삭제')
      } catch (rollbackError) {
        logger.error('롤백 실패', rollbackError)
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
    logger.error('프레젠테이션 생성 실패', error)

    // 상세 에러 메시지
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'

    return NextResponse.json(
      {
        error: '프레젠테이션을 생성하지 못했어요.',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    )
  }
}
