/**
 * GET /api/payments/[id]
 *
 * 결제 정보 조회
 *
 * @description
 * 특정 결제의 상세 정보를 조회합니다.
 * 1. NextAuth 세션 확인
 * 2. paymentId로 Payment 레코드 조회
 * 3. 본인 결제인지 확인
 * 4. 구독/크레딧 정보 포함하여 반환
 *
 * @param id - 결제 ID (paymentId가 아닌 내부 ID)
 * @response VerifyPaymentResponse
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { VerifyPaymentResponse } from '@/types/payment';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 0. Next.js 16: params는 Promise
    const { id } = await params;

    // 1. 인증 체크
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요해요' },
        { status: 401 }
      );
    }

    // 2. Payment 레코드 조회 (관계 포함)
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        subscription: true,
        creditTransaction: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: '결제 정보를 찾을 수 없어요' },
        { status: 404 }
      );
    }

    // 3. 본인 결제인지 확인
    if (payment.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: '접근 권한이 없어요' },
        { status: 403 }
      );
    }

    // 4. 응답 구성
    const response: VerifyPaymentResponse = {
      success: true,
      payment: {
        id: payment.id,
        status: payment.status as 'PAID' | 'FAILED' | 'CANCELED' | 'REFUNDED',
        amount: payment.amount,
        paidAt: payment.updatedAt.toISOString(),
        receiptUrl: payment.receiptUrl || undefined,
      },
    };

    // 구독 정보 (있는 경우)
    if (payment.subscription) {
      response.subscription = {
        id: payment.subscription.id,
        tier: payment.subscription.tier,
        status: payment.subscription.status,
        endDate: payment.subscription.endDate?.toISOString(),
      };
    }

    // 크레딧 정보 (있는 경우)
    if (payment.creditTransaction) {
      // 현재 크레딧 잔액 계산 (CreditTransaction 합계)
      const creditBalance = await prisma.creditTransaction.aggregate({
        where: { userId: session.user.id },
        _sum: { amount: true },
      });

      response.credits = {
        amount: payment.creditTransaction.amount,
        balance: creditBalance._sum.amount || 0,
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    logger.error('결제 정보 조회 실패', error);
    return NextResponse.json(
      {
        success: false,
        error: '결제 정보 조회 중 오류가 발생했어요',
      },
      { status: 500 }
    );
  }
}
