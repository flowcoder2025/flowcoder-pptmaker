/**
 * Credit Grant API - 크레딧 지급
 *
 * POST /api/credits/grant - 크레딧 지급 (관리자 전용)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth'
import { grantCredits } from '@/lib/credits'
import { requireAdmin } from '@/lib/permissions'
import { CreditSourceType } from '@/types/credits'
import { logger } from '@/lib/logger'
import { creditGrantRequestSchema, validateRequest } from '@/lib/validations'

// ============================================
// POST /api/credits/grant
// ============================================

/**
 * 크레딧 지급
 *
 * @auth Required
 * @permission admin (시스템 관리자만 가능)
 * @body {
 *   userId: string  // 지급 대상 사용자 ID
 *   sourceType: 'FREE' | 'EVENT' | 'SUBSCRIPTION' | 'PURCHASE'  // 크레딧 타입
 *   amount: number  // 지급할 크레딧 양
 *   description: string  // 지급 사유
 *   expiresInDays?: number  // 유효기간 (일 단위, 선택적)
 * }
 * @returns {
 *   transaction: CreditTransaction
 *   message: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // NextAuth 세션에서 userId 가져오기 (인증 체크)
    const currentUserId = await getCurrentUserId()

    if (!currentUserId) {
      return NextResponse.json(
        { error: '로그인이 필요해요' },
        { status: 401 }
      )
    }

    // 🔒 관리자 권한 체크 (Zanzibar ReBAC)
    try {
      await requireAdmin(currentUserId)
    } catch {
      logger.warn('크레딧 지급 권한 거부', { userId: currentUserId })
      return NextResponse.json(
        { error: '관리자만 크레딧을 지급할 수 있어요' },
        { status: 403 }
      )
    }

    // Zod 스키마 검증
    const body = await request.json()
    const validation = validateRequest(creditGrantRequestSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { userId, sourceType, amount, description, expiresInDays } = validation.data

    // 크레딧 지급
    const transaction = await grantCredits(
      userId,
      sourceType as CreditSourceType,
      amount,
      description,
      expiresInDays
    )

    // 감사 로그 (항상 기록)
    logger.audit('CREDIT_GRANT', {
      adminId: currentUserId,
      targetUserId: userId,
      sourceType,
      amount,
      description,
      expiresInDays,
    })

    return NextResponse.json({
      transaction: {
        id: transaction.id,
        userId: transaction.userId,
        type: transaction.type,
        sourceType: transaction.sourceType,
        amount: transaction.amount,
        description: transaction.description,
        expiresAt: transaction.expiresAt?.toISOString() || null,
        createdAt: transaction.createdAt.toISOString(),
      },
      message: `${amount} 크레딧을 지급했어요`,
    })
  } catch (error) {
    logger.error('크레딧 지급 실패', error)
    return NextResponse.json(
      { error: '크레딧을 지급하지 못했어요' },
      { status: 500 }
    )
  }
}
