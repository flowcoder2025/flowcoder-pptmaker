/**
 * Credit API - 크레딧 잔액 및 구매
 *
 * GET /api/credits - 내 크레딧 잔액 조회
 * POST /api/credits - 크레딧 구매
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'

// ============================================
// GET /api/credits
// ============================================

/**
 * 내 크레딧 잔액 조회
 *
 * @auth Required
 * @permission 본인만 조회 가능
 * @returns {
 *   balance: number  // 현재 크레딧 잔액
 *   lastTransactionAt?: DateTime
 * }
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

    // 최신 거래의 balance 필드로 잔액 조회
    const latestTransaction = await prisma.creditTransaction.findFirst({
      where: {
        userId,
      },
      select: {
        balance: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // 거래가 없으면 잔액 0
    const balance = latestTransaction?.balance ?? 0
    const lastTransactionAt = latestTransaction?.createdAt

    return NextResponse.json({
      balance,
      lastTransactionAt,
    })
  } catch (error) {
    console.error('크레딧 잔액 조회 실패:', error)
    return NextResponse.json(
      { error: '크레딧 잔액을 불러오지 못했어요.' },
      { status: 500 }
    )
  }
}

// ============================================
// POST /api/credits
// ============================================

/**
 * 크레딧 구매
 *
 * @auth Required
 * @body {
 *   amount: number  // 구매할 크레딧 수량
 *   paymentToken?: string  // 결제 토큰 (향후 결제 API 연동)
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
    const { amount, paymentToken } = body

    // 입력 검증
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: '올바른 크레딧 수량을 입력해주세요.' },
        { status: 400 }
      )
    }

    // TODO: 결제 검증 (향후 토스페이먼츠 API 연동)
    // if (paymentToken) {
    //   const paymentValid = await verifyPayment(paymentToken, amount)
    //   if (!paymentValid) {
    //     return NextResponse.json(
    //       { error: '결제 검증에 실패했어요.' },
    //       { status: 400 }
    //     )
    //   }
    // }

    // 현재 잔액 조회
    const latestTransaction = await prisma.creditTransaction.findFirst({
      where: { userId },
      select: { balance: true },
      orderBy: { createdAt: 'desc' },
    })
    const currentBalance = latestTransaction?.balance ?? 0

    // 크레딧 구매 거래 생성
    const transaction = await prisma.creditTransaction.create({
      data: {
        userId,
        type: 'PURCHASE',
        amount,
        balance: currentBalance + amount,
        description: `${amount} 크레딧 구매`,
      },
      select: {
        id: true,
        type: true,
        amount: true,
        balance: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      {
        transaction,
        message: `${amount} 크레딧을 구매했어요.`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('크레딧 구매 실패:', error)
    return NextResponse.json(
      { error: '크레딧을 구매하지 못했어요.' },
      { status: 500 }
    )
  }
}
