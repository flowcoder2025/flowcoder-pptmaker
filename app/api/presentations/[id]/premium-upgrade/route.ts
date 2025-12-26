/**
 * Premium Upgrade API - 슬라이드 프리미엄 품질 업그레이드
 *
 * POST /api/presentations/[id]/premium-upgrade
 * - 기존 슬라이드 HTML을 Gemini 3.0 Flash로 고품질 개선
 * - 크레딧 차감 (예상 비용 기반)
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { requirePresentationEditor } from '@/lib/permissions'
import { getCurrentUserId } from '@/lib/auth'
import { calculateBalance, consumeCredits } from '@/lib/credits'
import { upgradeAllSlides } from '@/services/gemini'

// 프리미엄 업그레이드 크레딧 비용 (슬라이드당)
const CREDITS_PER_SLIDE = 3 // 약 30원/슬라이드 (100원 = 10크레딧 기준)

/**
 * POST /api/presentations/[id]/premium-upgrade
 *
 * 프레젠테이션의 모든 슬라이드를 프리미엄 품질로 업그레이드
 *
 * @auth Required
 * @permission editor
 * @body {
 *   slides: string[] - 업그레이드할 슬라이드 HTML 배열
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId()
    const resolvedParams = await params
    const { id } = resolvedParams

    if (!userId) {
      return NextResponse.json(
        { error: '로그인이 필요해요.' },
        { status: 401 }
      )
    }

    // Zanzibar 권한 확인: editor 이상
    await requirePresentationEditor(userId, id)

    const body = await request.json()
    const { slides } = body as { slides: string[] }

    if (!slides || !Array.isArray(slides) || slides.length === 0) {
      return NextResponse.json(
        { error: '업그레이드할 슬라이드가 없어요.' },
        { status: 400 }
      )
    }

    // 필요한 크레딧 계산
    const requiredCredits = slides.length * CREDITS_PER_SLIDE

    // 사용자 크레딧 잔액 확인
    const { balance: currentCredits } = await calculateBalance(userId)

    if (currentCredits < requiredCredits) {
      return NextResponse.json(
        {
          error: `크레딧이 부족해요. 필요: ${requiredCredits}, 잔액: ${currentCredits}`,
          requiredCredits,
          currentCredits,
        },
        { status: 402 }
      )
    }

    // 프리미엄 업그레이드 실행
    logger.info('프리미엄 업그레이드 시작', { presentationId: id, slideCount: slides.length })

    const result = await upgradeAllSlides(slides)

    // 크레딧 차감 (우선순위 기반 소모)
    const consumeResult = await consumeCredits(
      userId,
      requiredCredits,
      `프리미엄 업그레이드 (${slides.length}장)`
    )

    // 프레젠테이션 업데이트 (업그레이드된 슬라이드로 교체)
    const presentation = await prisma.presentation.findUnique({
      where: { id },
      select: { slideData: true, metadata: true },
    })

    if (presentation) {
      // 업그레이드된 슬라이드를 HTMLSlide 형식으로 변환
      // result.upgradedSlides는 string[]이므로 { html, css } 형식으로 변환
      const formattedSlides = result.upgradedSlides.map(html => ({
        html,
        css: '', // 업그레이드된 HTML에는 inline style이 포함됨
      }))

      await prisma.presentation.update({
        where: { id },
        data: {
          slides: formattedSlides,
          metadata: {
            ...(presentation.metadata as object || {}),
            premiumUpgraded: true,
            premiumUpgradedAt: new Date().toISOString(),
            upgradeTokenUsage: result.totalTokenUsage,
            upgradeEstimatedCost: result.totalEstimatedCost,
          },
        },
      })
    }

    logger.info('프리미엄 업그레이드 완료', { presentationId: id })
    logger.info('크레딧 차감 완료', { creditsUsed: requiredCredits, remaining: consumeResult.remaining })

    return NextResponse.json({
      success: true,
      message: '프리미엄 업그레이드가 완료되었어요!',
      upgradedSlides: result.upgradedSlides,
      stats: {
        slideCount: slides.length,
        creditsUsed: requiredCredits,
        remainingCredits: consumeResult.remaining,
        tokenUsage: result.totalTokenUsage,
        estimatedCostKRW: Math.round(result.totalEstimatedCost),
      },
    })
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : '알 수 없는 에러가 발생했어요.'

    // 권한 에러 처리
    if (errorMessage.includes('권한')) {
      return NextResponse.json({ error: errorMessage }, { status: 403 })
    }

    if (errorMessage.includes('로그인')) {
      return NextResponse.json({ error: errorMessage }, { status: 401 })
    }

    // 크레딧 부족 에러
    if (errorMessage.includes('크레딧이 부족')) {
      return NextResponse.json({ error: errorMessage }, { status: 402 })
    }

    logger.error('프리미엄 업그레이드 실패', error)
    return NextResponse.json(
      { error: '프리미엄 업그레이드에 실패했어요. 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/presentations/[id]/premium-upgrade
 *
 * 프리미엄 업그레이드 예상 비용 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId()
    const resolvedParams = await params
    const { id } = resolvedParams

    if (!userId) {
      return NextResponse.json(
        { error: '로그인이 필요해요.' },
        { status: 401 }
      )
    }

    // 프레젠테이션 조회
    const presentation = await prisma.presentation.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        slides: true,
        metadata: true,
      },
    })

    if (!presentation) {
      return NextResponse.json(
        { error: '프레젠테이션을 찾지 못했어요.' },
        { status: 404 }
      )
    }

    const slides = presentation.slides as string[]
    const slideCount = slides?.length || 0
    const requiredCredits = slideCount * CREDITS_PER_SLIDE

    // 사용자 크레딧 잔액 확인
    const { balance: currentCredits } = await calculateBalance(userId)

    // 이미 업그레이드된 경우 체크
    const metadata = presentation.metadata as { premiumUpgraded?: boolean } | null
    const alreadyUpgraded = metadata?.premiumUpgraded === true

    return NextResponse.json({
      slideCount,
      requiredCredits,
      currentCredits,
      canUpgrade: currentCredits >= requiredCredits && !alreadyUpgraded,
      alreadyUpgraded,
      estimatedCostKRW: requiredCredits * 10, // 1크레딧 = 10원
    })
  } catch (error: unknown) {
    logger.error('프리미엄 업그레이드 정보 조회 실패', error)
    return NextResponse.json(
      { error: '정보를 불러오지 못했어요.' },
      { status: 500 }
    )
  }
}
