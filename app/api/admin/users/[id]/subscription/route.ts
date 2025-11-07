/**
 * Admin User Subscription API - 사용자 구독 관리
 *
 * POST /api/admin/users/[id]/subscription - 사용자 구독 수정
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/permissions'
import { getCurrentUserId } from '@/lib/auth'

// ============================================
// POST /api/admin/users/[id]/subscription
// ============================================

/**
 * 사용자 구독 수정 (관리자 전용)
 *
 * @auth Required
 * @permission admin (Zanzibar 'system:global#admin')
 * @param id - 사용자 ID
 * @body {
 *   tier: 'FREE' | 'PRO' | 'PREMIUM'
 *   status?: 'ACTIVE' | 'CANCELED' | 'EXPIRED'
 *   endDate?: DateTime  // null이면 만료일 없음
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // NextAuth 세션에서 userId 가져오기
    const adminUserId = await getCurrentUserId()

    // 관리자 권한 확인 (에러 발생 시 catch에서 처리)
    await requireAdmin(adminUserId)

    const { id: targetUserId } = await params
    const body = await request.json()
    const { tier, status, endDate } = body

    // 입력 검증
    if (!tier || !['FREE', 'PRO', 'PREMIUM'].includes(tier)) {
      return NextResponse.json(
        { error: '올바른 요금제를 선택해주세요.' },
        { status: 400 }
      )
    }

    // 대상 사용자 존재 확인
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, email: true },
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: '사용자를 찾지 못했어요.' },
        { status: 404 }
      )
    }

    // 기존 구독 확인
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId: targetUserId },
    })

    let subscription

    if (existingSubscription) {
      // 기존 구독 업데이트
      subscription = await prisma.subscription.update({
        where: { userId: targetUserId },
        data: {
          tier,
          status: status || existingSubscription.status,
          endDate: endDate !== undefined ? endDate : existingSubscription.endDate,
        },
        select: {
          id: true,
          tier: true,
          status: true,
          startDate: true,
          endDate: true,
          updatedAt: true,
        },
      })
    } else {
      // 새 구독 생성
      subscription = await prisma.subscription.create({
        data: {
          userId: targetUserId,
          tier,
          status: status || 'ACTIVE',
          startDate: new Date(),
          endDate: endDate || null,
        },
        select: {
          id: true,
          tier: true,
          status: true,
          startDate: true,
          endDate: true,
          createdAt: true,
          updatedAt: true,
        },
      })
    }

    return NextResponse.json({
      subscription,
      user: {
        id: targetUser.id,
        email: targetUser.email,
      },
      message: `${targetUser.email}의 구독을 ${tier}로 변경했어요.`,
    })
  } catch (error) {
    console.error('사용자 구독 수정 실패:', error)

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
      { error: '사용자 구독을 수정하지 못했어요.' },
      { status: 500 }
    )
  }
}
