/**
 * Presentation API - 프레젠테이션 CRUD
 *
 * GET /api/presentations - 내 프레젠테이션 목록 조회
 * POST /api/presentations - 새 프레젠테이션 생성
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { grantPresentationOwnership } from '@/lib/permissions'
import { getCurrentUserId } from '@/lib/auth'

// ============================================
// GET /api/presentations
// ============================================

/**
 * 내 프레젠테이션 목록 조회
 *
 * @auth Required
 * @permission viewer (본인의 프레젠테이션만 조회)
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

    // 본인의 프레젠테이션만 조회 (소프트 삭제 제외)
    const presentations = await prisma.presentation.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        description: true,
        metadata: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return NextResponse.json({
      presentations,
      count: presentations.length,
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

    // 프레젠테이션 생성
    const presentation = await prisma.presentation.create({
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

    // Zanzibar 권한 부여: 생성자를 owner로 설정
    await grantPresentationOwnership(presentation.id, userId)

    console.log('[POST /api/presentations] Ownership granted')

    return NextResponse.json(
      {
        presentation,
        message: '프레젠테이션을 생성했어요.',
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
