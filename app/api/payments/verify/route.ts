import { Prisma } from '@prisma/client'
/**
 * POST /api/payments/verify
 *
 * 포트원 V2 결제 검증
 *
 * @description
 * 1. NextAuth 세션 확인
 * 2. paymentId와 txId 검증
 * 3. 포트원 API로 결제 검증
 * 4. DB의 Payment 레코드 업데이트
 * 5. 결제 목적에 따라 구독/크레딧 처리
 * 6. 결과 반환
 *
 * @request VerifyPaymentRequestBody
 * @response VerifyPaymentResponse
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type {
  VerifyPaymentRequestBody,
  VerifyPaymentResponse,
  PortOnePaymentVerifyResponse,
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
    const body = (await request.json()) as VerifyPaymentRequestBody;
    const { paymentId, txId } = body;

    if (!paymentId || !txId) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었어요' },
        { status: 400 }
      );
    }

    // 3. DB에서 Payment 레코드 조회
    const payment = await prisma.payment.findUnique({
      where: { paymentId },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: '결제 정보를 찾을 수 없어요' },
        { status: 404 }
      );
    }

    // 본인 결제인지 확인
    if (payment.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: '접근 권한이 없어요' },
        { status: 403 }
      );
    }

    // 이미 처리된 결제인지 확인
    if (payment.status === 'PAID') {
      // 이미 완료된 결제 - 현재 상태 반환
      const response: VerifyPaymentResponse = {
        success: true,
        payment: {
          id: payment.id,
          status: 'PAID',
          amount: payment.amount,
          paidAt: payment.updatedAt.toISOString(),
          receiptUrl: payment.receiptUrl || undefined,
        },
      };
      return NextResponse.json(response);
    }

    // 4. 포트원 API로 결제 검증
    const apiSecret = process.env.PORTONE_API_SECRET;
    if (!apiSecret) {
      console.error('[Payment Verify] PORTONE_API_SECRET not configured');
      return NextResponse.json(
        { success: false, error: '결제 시스템 설정이 올바르지 않아요' },
        { status: 500 }
      );
    }

    // 포트원 V2 API 호출 (storeId 필수)
    const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
    const portoneResponse = await fetch(
      `https://api.portone.io/payments/${paymentId}?storeId=${storeId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `PortOne ${apiSecret}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('[Payment Verify] PortOne API response status:', portoneResponse.status);

    if (!portoneResponse.ok) {
      const errorText = await portoneResponse.text();
      console.error('[Payment Verify] PortOne API error:', portoneResponse.status, errorText);
      return NextResponse.json(
        { success: false, error: '결제 검증 중 오류가 발생했어요' },
        { status: 500 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const portoneData = (await portoneResponse.json()) as any;

    console.log('[Payment Verify] PortOne response data:', JSON.stringify(portoneData, null, 2));

    // 5. 결제 상태 확인 (V2 API 응답 형식)
    const paymentStatus = portoneData.status;
    if (paymentStatus !== 'PAID') {
      // 결제 실패 - DB 업데이트
      await prisma.payment.update({
        where: { paymentId },
        data: {
          status: paymentStatus,
          portoneData: portoneData as unknown as Prisma.InputJsonValue,
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: '결제가 완료되지 않았어요',
          payment: {
            id: payment.id,
            status: paymentStatus,
            amount: portoneData.amount?.total || payment.amount,
          },
        },
        { status: 400 }
      );
    }

    // 6. 결제 성공 - V2 API 응답에서 필요한 값 추출
    const methodType = portoneData.method?.type || 'EASY_PAY';
    // receiptUrl은 V2에서 최상위 레벨에 있음
    const receiptUrl = portoneData.receiptUrl || portoneData.receipt?.url || null;

    // customData는 V2에서 JSON 문자열로 반환됨 - 파싱 필요
    let customData: Record<string, unknown> | undefined;
    if (typeof portoneData.customData === 'string') {
      try {
        customData = JSON.parse(portoneData.customData);
      } catch {
        console.error('[Payment Verify] Failed to parse customData:', portoneData.customData);
        customData = undefined;
      }
    } else if (portoneData.customData) {
      customData = portoneData.customData;
    } else {
      // DB에 저장된 customData fallback
      const dbPortoneData = payment.portoneData as Record<string, unknown> | null;
      customData = dbPortoneData?.customData as Record<string, unknown> | undefined;
    }

    console.log('[Payment Verify] Extracted customData:', customData);

    // 7. 트랜잭션으로 DB 업데이트
    const result = await prisma.$transaction(async (tx) => {
      // Payment 업데이트
      const updatedPayment = await tx.payment.update({
        where: { paymentId },
        data: {
          status: 'PAID',
          method: methodType,
          portoneData: portoneData as unknown as Prisma.InputJsonValue,
          receiptUrl: receiptUrl,
        },
      });

      const purpose = customData?.purpose;

      // 7. 결제 목적에 따라 구독/크레딧 처리
      if (purpose === 'SUBSCRIPTION_UPGRADE') {
        // 구독 업그레이드
        const subscriptionId = customData?.subscriptionId as string | undefined;
        if (!subscriptionId) {
          throw new Error('subscriptionId is missing');
        }

        // 구독 기간 설정: 현재 시간 + 30일
        const now = new Date();
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() + 30);

        const subscription = await tx.subscription.update({
          where: { id: subscriptionId },
          data: {
            status: 'ACTIVE',
            startDate: now,
            endDate: endDate,
          },
        });

        return {
          payment: updatedPayment,
          subscription,
        };
      } else if (purpose === 'CREDIT_PURCHASE') {
        // 크레딧 충전
        const creditAmount = customData?.creditAmount as number | undefined;
        if (!creditAmount || creditAmount <= 0) {
          throw new Error('creditAmount is invalid');
        }

        const creditTransaction = await tx.creditTransaction.create({
          data: {
            userId: session.user!.id,
            type: 'PURCHASE',
            sourceType: 'PURCHASE',
            amount: creditAmount,
            balance: 0, // DEPRECATED
            description: `크레딧 ${creditAmount}개 구매`,
            expiresAt: null, // 영구
          },
        });

        // Payment에 creditTransactionId 연결
        await tx.payment.update({
          where: { paymentId },
          data: { creditTransactionId: creditTransaction.id },
        });

        return {
          payment: updatedPayment,
          creditTransaction,
        };
      } else {
        throw new Error('Unknown payment purpose');
      }
    });

    // 8. 응답 반환
    const response: VerifyPaymentResponse = {
      success: true,
      payment: {
        id: result.payment.id,
        status: result.payment.status as 'PAID' | 'FAILED' | 'CANCELED' | 'REFUNDED',
        amount: result.payment.amount,
        paidAt: result.payment.updatedAt.toISOString(),
        receiptUrl: result.payment.receiptUrl || undefined,
      },
      subscription: 'subscription' in result && result.subscription
        ? {
            id: result.subscription.id,
            tier: result.subscription.tier,
            status: result.subscription.status,
            endDate: result.subscription.endDate?.toISOString(),
          }
        : undefined,
      credits: 'creditTransaction' in result && result.creditTransaction
        ? {
            amount: result.creditTransaction.amount,
            balance: 0, // TODO: 실제 잔액 계산
          }
        : undefined,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Payment Verify] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '결제 검증 중 오류가 발생했어요',
      },
      { status: 500 }
    );
  }
}
