/**
 * POST /api/payments/request
 *
 * 포트원 V2 결제 요청 생성
 *
 * @description
 * 1. NextAuth 세션 확인
 * 2. 요청 본문 검증
 * 3. 고유 paymentId 생성 (UUID)
 * 4. Payment 레코드 DB에 저장 (status: PENDING)
 * 5. PortOnePaymentRequest 생성하여 반환
 *
 * @request CreatePaymentRequestBody
 * @response CreatePaymentRequestResponse
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type {
  CreatePaymentRequestBody,
  CreatePaymentRequestResponse,
  PortOnePaymentRequest,
} from '@/types/payment';

export async function POST(request: NextRequest) {
  try {
    // 1. 인증 체크
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요해요' },
        { status: 401 }
      );
    }

    // 2. 요청 본문 파싱 및 검증
    const body = (await request.json()) as CreatePaymentRequestBody;
    const { purpose, amount, orderName, channelKey, subscriptionId, creditAmount, payMethod } = body;

    if (!purpose || !amount || !orderName) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었어요' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: '결제 금액은 0보다 커야 해요' },
        { status: 400 }
      );
    }

    // 3. 고유 paymentId 생성
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // 4. storeId 환경 변수 확인
    const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
    if (!storeId) {
      console.error('[Payment Request] PORTONE_STORE_ID not configured');
      return NextResponse.json(
        { success: false, error: '결제 시스템 설정이 올바르지 않아요' },
        { status: 500 }
      );
    }

    // 5. PortOne 결제 요청 객체 생성
    // channelKey가 없으면 기본값으로 토스페이 사용
    const defaultChannelKey = 'channel-key-ac45bcb3-910c-4a2b-bc46-24ec05d20742';
    const finalChannelKey = channelKey || defaultChannelKey;

    // payMethod가 없으면 channelKey에 따라 자동 설정
    let finalPayMethod = payMethod;
    if (!finalPayMethod) {
      // 토스페이, 카카오페이는 EASY_PAY
      if (finalChannelKey.includes('ac45bcb3') || finalChannelKey.includes('b67c5e30') || finalChannelKey.includes('5bf9403e')) {
        finalPayMethod = 'EASY_PAY';
      }
      // 이니시스는 CARD (기본값)
      else if (finalChannelKey.includes('7b85a467') || finalChannelKey.includes('2d471aaa')) {
        finalPayMethod = 'CARD';
      }
      // 기타는 CARD
      else {
        finalPayMethod = 'CARD';
      }
    }

    const paymentRequest: PortOnePaymentRequest = {
      storeId,
      paymentId,
      orderName,
      totalAmount: amount,
      currency: 'KRW',
      channelKey: finalChannelKey,
      payMethod: finalPayMethod,  // 필수 파라미터
      customer: {
        customerId: session.user.id,
        fullName: session.user.name || undefined,
        email: session.user.email || undefined,
      },
      customData: {
        purpose,
        userId: session.user.id,
        subscriptionId,
        creditAmount,
      },
      redirectUrl: `${process.env.NEXTAUTH_URL}/payments/result`,
      noticeUrls: [`${process.env.NEXTAUTH_URL}/api/payments/webhook`],
    };

    // 6. Payment 레코드 DB에 저장 (PENDING 상태)
    await prisma.payment.create({
      data: {
        paymentId,
        userId: session.user.id,
        amount,
        currency: 'KRW',
        status: 'PENDING',
        method: finalPayMethod,  // 결정된 payMethod 저장
        purpose,
        subscriptionId: subscriptionId || null,
        creditTransactionId: null,
        portoneData: paymentRequest as any, // JSON 타입으로 저장
        receiptUrl: null,
        failReason: null,
      },
    });

    // 7. 응답 반환
    const response: CreatePaymentRequestResponse = {
      success: true,
      paymentId,
      paymentRequest,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Payment Request] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '결제 요청 생성 중 오류가 발생했어요',
      },
      { status: 500 }
    );
  }
}
