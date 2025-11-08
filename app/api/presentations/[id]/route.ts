/**
 * Presentation API - 개별 프레젠테이션 CRUD
 *
 * GET /api/presentations/[id] - 프레젠테이션 조회
 * PATCH /api/presentations/[id] - 프레젠테이션 수정
 * DELETE /api/presentations/[id] - 프레젠테이션 삭제 (소프트 삭제)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  requirePresentationViewer,
  requirePresentationEditor,
  requirePresentationOwner,
} from '@/lib/permissions'
import { getCurrentUserId } from '@/lib/auth'

// ============================================
// GET /api/presentations/[id]
// ============================================

/**
 * 프레젠테이션 상세 조회
 *
 * @auth Required
 * @permission viewer
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // NextAuth 세션에서 userId 가져오기
    const userId = await getCurrentUserId()
    const resolvedParams = await params
    const { id } = resolvedParams

    if (!userId) {
      return NextResponse.json(
        { error: '로그인이 필요해요.' },
        { status: 401 }
      )
    }

    // Zanzibar 권한 확인: viewer 이상
    await requirePresentationViewer(userId, id)

    // 프레젠테이션 조회 (소프트 삭제 제외)
    const presentation = await prisma.presentation.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    if (!presentation) {
      return NextResponse.json(
        { error: '프레젠테이션을 찾지 못했어요.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ presentation })
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

    console.error('프레젠테이션 조회 실패:', error)
    return NextResponse.json(
      { error: '프레젠테이션을 불러오지 못했어요.' },
      { status: 500 }
    )
  }
}

// ============================================
// PATCH /api/presentations/[id]
// ============================================

/**
 * 프레젠테이션 수정
 *
 * @auth Required
 * @permission editor
 * @body {
 *   title?: string
 *   description?: string
 *   slideData?: UnifiedPPTJSON
 *   metadata?: object
 *   isPublic?: boolean
 * }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // NextAuth 세션에서 userId 가져오기
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
    const { title, description, slideData, slides, metadata, isPublic } = body

    // 프레젠테이션 수정
    const presentation = await prisma.presentation.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(slideData !== undefined && { slideData }),
        ...(slides !== undefined && { slides }),  // HTML 캐시 업데이트
        ...(metadata !== undefined && { metadata }),
        ...(isPublic !== undefined && { isPublic }),
      },
      select: {
        id: true,
        title: true,
        description: true,
        metadata: true,
        isPublic: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      presentation,
      message: '프레젠테이션을 수정했어요.',
    })
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : '알 수 없는 에러가 발생했어요.'

    // 권한 에러 처리
    if (errorMessage.includes('권한')) {
      return NextResponse.json({ error: errorMessage }, { status: 403 })
    }

    if (errorMessage.includes('로그인')) {
      return NextResponse.json({ error: errorMessage }, { status: 401 })}

    console.error('프레젠테이션 수정 실패:', error)
    return NextResponse.json(
      { error: '프레젠테이션을 수정하지 못했어요.' },
      { status: 500 }
    )
  }
}

// ============================================
// DELETE /api/presentations/[id]
// ============================================

/**
 * 프레젠테이션 삭제 (소프트 삭제)
 *
 * @auth Required
 * @permission owner
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // NextAuth 세션에서 userId 가져오기
    const userId = await getCurrentUserId()
    const resolvedParams = await params
    const { id } = resolvedParams

    if (!userId) {
      return NextResponse.json(
        { error: '로그인이 필요해요.' },
        { status: 401 }
      )
    }

    // Zanzibar 권한 확인: owner만
    await requirePresentationOwner(userId, id)

    // 소프트 삭제
    await prisma.presentation.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: '프레젠테이션을 삭제했어요.',
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

    console.error('프레젠테이션 삭제 실패:', error)
    return NextResponse.json(
      { error: '프레젠테이션을 삭제하지 못했어요.' },
      { status: 500 }
    )
  }
}
