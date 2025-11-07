/**
 * Credit Consume API - 크레딧 사용
 *
 * POST /api/credits/consume - 크레딧 사용 (AI 생성 시)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'

// ============================================
// POST /api/credits/consume
// ============================================

/**
 * 크레딧 사용 (AI 생성 시)
 *
 * @auth Required
 * @permission 본인만 사용 가능
 * @body {
 *   amount: number  // 사용할 크레딧 수량
 *   description?: string  // 사용 내역 설명
 *   metadata?: object  // 추가 정보 (AI 모델, 슬라이드 수 등)
 * }
 * @returns {
 *   transaction: CreditTransaction
 *   remainingBalance: number
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
    const { amount, description, metadata } = body

    // 입력 검증
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: '올바른 크레딧 수량을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 현재 잔액 조회
    const latestTransaction = await prisma.creditTransaction.findFirst({
      where: { userId },
      select: { balance: true },
      orderBy: { createdAt: 'desc' },
    })
    const currentBalance = latestTransaction?.balance ?? 0

    // 잔액 부족 확인
    if (currentBalance < amount) {
      return NextResponse.json(
        {
          error: '크레딧이 부족해요.',
          currentBalance,
          required: amount,
          shortfall: amount - currentBalance,
        },
        { status: 400 }
      )
    }

    // 크레딧 사용 거래 생성 (음수)
    const transaction = await prisma.creditTransaction.create({
      data: {
        userId,
        type: 'USAGE',
        amount: -amount, // 음수로 저장
        balance: currentBalance - amount,
        description:
          description || `${amount} 크레딧 사용`,
      },
      select: {
        id: true,
        type: true,
        amount: true,
        balance: true,
        description: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      transaction,
      remainingBalance: transaction.balance,
      message: `${amount} 크레딧을 사용했어요.`,
    })
  } catch (error) {
    console.error('크레딧 사용 실패:', error)
    return NextResponse.json(
      { error: '크레딧을 사용하지 못했어요.' },
      { status: 500 }
    )
  }
}
