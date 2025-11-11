/**
 * Credit Grant API - 크레딧 지급
 *
 * POST /api/credits/grant - 크레딧 지급 (관리자 또는 시스템)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth'
import { grantCredits } from '@/lib/credits'
import { CreditSourceType } from '@/types/credits'

// ============================================
// POST /api/credits/grant
// ============================================

/**
 * 크레딧 지급
 *
 * @auth Required
 * @permission 관리자 또는 시스템 (향후 권한 체크 추가 필요)
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

    // TODO: 관리자 권한 체크 (향후 구현)
    // const isAdmin = await checkAdmin(currentUserId)
    // if (!isAdmin) {
    //   return NextResponse.json(
    //     { error: '관리자만 크레딧을 지급할 수 있어요' },
    //     { status: 403 }
    //   )
    // }

    const body = await request.json()
    const { userId, sourceType, amount, description, expiresInDays } = body

    // 입력 검증
    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID를 입력해주세요' },
        { status: 400 }
      )
    }

    if (!sourceType || !Object.values(CreditSourceType).includes(sourceType)) {
      return NextResponse.json(
        {
          error: '올바른 크레딧 타입을 선택해주세요',
          validTypes: Object.values(CreditSourceType),
        },
        { status: 400 }
      )
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: '올바른 크레딧 수량을 입력해주세요' },
        { status: 400 }
      )
    }

    if (!description) {
      return NextResponse.json(
        { error: '지급 사유를 입력해주세요' },
        { status: 400 }
      )
    }

    // 크레딧 지급
    const transaction = await grantCredits(
      userId,
      sourceType as CreditSourceType,
      amount,
      description,
      expiresInDays
    )

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
    console.error('크레딧 지급 실패:', error)
    return NextResponse.json(
      { error: '크레딧을 지급하지 못했어요' },
      { status: 500 }
    )
  }
}
