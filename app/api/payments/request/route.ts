import { Prisma } from '@prisma/client'
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
import { logger } from '@/lib/logger';
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

    // 2.5. SUBSCRIPTION_UPGRADE 시 subscription 자동 생성/조회
    let finalSubscriptionId = subscriptionId;
    if (purpose === 'SUBSCRIPTION_UPGRADE' && !subscriptionId) {
      // tier 결정 (금액 기반)
      let tier: 'PRO' | 'PREMIUM' = 'PRO';
      if (amount >= 9900) {
        tier = 'PREMIUM';
      }

      // 기존 subscription 조회
      const existingSubscription = await prisma.subscription.findUnique({
        where: { userId: session.user.id },
      });

      if (existingSubscription) {
        // 기존 subscription이 있으면 tier 업데이트 (PENDING 상태로)
        const updated = await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            tier,
            // status는 결제 완료 후 verify에서 ACTIVE로 변경
          },
        });
        finalSubscriptionId = updated.id;
        logger.debug('기존 구독 업데이트', { subscriptionId: updated.id, tier });
      } else {
        // 새 subscription 생성 (PENDING 상태)
        const newSubscription = await prisma.subscription.create({
          data: {
            userId: session.user.id,
            tier,
            status: 'PENDING',
            startDate: new Date(),
            endDate: null,
          },
        });
        finalSubscriptionId = newSubscription.id;
        logger.debug('신규 구독 생성', { subscriptionId: newSubscription.id, tier });
      }
    }

    // 3. 고유 paymentId 생성
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // 4. storeId 환경 변수 확인
    const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
    if (!storeId) {
      logger.error('PORTONE_STORE_ID 미설정');
      return NextResponse.json(
        { success: false, error: '결제 시스템 설정이 올바르지 않아요' },
        { status: 500 }
      );
    }

    // 5. DB에서 최신 사용자 정보 조회 (전화번호 포함)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        phoneNumber: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: '사용자 정보를 찾을 수 없어요' },
        { status: 404 }
      );
    }

    // 6. PortOne 결제 요청 객체 생성
    // channelKey가 없으면 기본값으로 카카오페이 단건결제 사용
    // 2025-12-19: 프로덕션 채널 키로 전환
    const defaultChannelKey = 'channel-key-f320bf96-4e9a-4ef4-8a94-5e17d730216e'; // 카카오페이 단건결제 (프로덕션)
    const finalChannelKey = channelKey || defaultChannelKey;

    // payMethod가 없으면 channelKey에 따라 자동 설정
    let finalPayMethod = payMethod;
    if (!finalPayMethod) {
      // 카카오페이 프로덕션 채널은 EASY_PAY
      // f320bf96: 단건결제 (CA25614310)
      // 999ee55e: 정기결제 (CA63438855)
      if (finalChannelKey.includes('f320bf96') || finalChannelKey.includes('999ee55e')) {
        finalPayMethod = 'EASY_PAY';
      }
      // 이니시스는 CARD (EASY_PAY 시 easyPayProvider 필수)
      else if (finalChannelKey.includes('7b85a467') || finalChannelKey.includes('2d471aaa')) {
        finalPayMethod = 'CARD';
      }
      // 기타는 EASY_PAY (카카오페이 기본)
      else {
        finalPayMethod = 'EASY_PAY';
      }
    }

    // 이니시스 채널인 경우 전화번호 필수 검증
    const isInicis = finalChannelKey.includes('7b85a467') || finalChannelKey.includes('2d471aaa');
    if (isInicis && !user.phoneNumber) {
      return NextResponse.json(
        { success: false, error: '이니시스 V2 일반 결제의 경우 구매자 휴대폰 번호는 필수 입력입니다. 프로필에서 전화번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 6. PortOne 결제 요청 객체 생성
    // 이니시스 V2: payMethod='CARD' 사용 (EASY_PAY는 easyPayProvider 필수)
    // easyPay 객체는 나이스페이먼츠, NHN KCP, KSNET 전용
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
        fullName: user.name || undefined,
        email: user.email || undefined,
        phoneNumber: user.phoneNumber || undefined,  // DB에서 조회한 최신 전화번호
      },
      customData: {
        purpose,
        userId: session.user.id,
        subscriptionId: finalSubscriptionId,
        creditAmount,
      },
      redirectUrl: `${process.env.NEXTAUTH_URL}/payments/result?paymentId=${paymentId}`,
      noticeUrls: [`${process.env.NEXTAUTH_URL}/api/payments/webhook`],
    } as PortOnePaymentRequest;

    // 디버깅: 이니시스 결제 요청 내용 로그
    if (isInicis) {
      logger.debug('이니시스 결제 요청', {
        channelKey: finalChannelKey,
        payMethod: finalPayMethod,
        hasPhoneNumber: !!user.phoneNumber,
        hasEmail: !!user.email,
        hasFullName: !!user.name,
      });
    }

    // 7. Payment 레코드 DB에 저장 (PENDING 상태)
    await prisma.payment.create({
      data: {
        paymentId,
        userId: session.user.id,
        amount,
        currency: 'KRW',
        status: 'PENDING',
        method: finalPayMethod,  // 결정된 payMethod 저장
        purpose,
        subscriptionId: finalSubscriptionId || null,
        creditTransactionId: null,
        portoneData: paymentRequest as unknown as Prisma.InputJsonValue, // 타입으로 저장
        receiptUrl: null,
        failReason: null,
      },
    });

    // 8. 응답 반환
    const response: CreatePaymentRequestResponse = {
      success: true,
      paymentId,
      paymentRequest,
    };

    // 디버깅: 서버 응답 객체 로그
    logger.debug('결제 요청 응답', { paymentId: response.paymentId });

    return NextResponse.json(response);
  } catch (error) {
    logger.error('결제 요청 생성 오류', error);
    return NextResponse.json(
      {
        success: false,
        error: '결제 요청 생성 중 오류가 발생했어요',
      },
      { status: 500 }
    );
  }
}
