import { Prisma } from '@prisma/client'
/**
 * POST /api/payments/webhook
 *
 * 포트원 V2 Webhook 수신
 *
 * @description
 * 포트원에서 결제 상태 변경 시 비동기로 호출하는 Webhook 엔드포인트
 * 1. PORTONE_WEBHOOK_SECRET으로 요청 검증
 * 2. Webhook 페이로드 파싱
 * 3. paymentId로 Payment 레코드 조회
 * 4. 결제 상태 업데이트
 * 5. { received: true } 응답
 *
 * @request PortOneWebhookPayload
 * @response { received: boolean }
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { PortOneWebhookPayload, PortOnePaymentStatus } from '@/types/payment';

export async function POST(request: NextRequest) {
  try {
    // 1. Webhook Secret 검증
    const webhookSecret = process.env.PORTONE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[Payment Webhook] PORTONE_WEBHOOK_SECRET not configured');
      return NextResponse.json({ received: false }, { status: 500 });
    }

    // Authorization 헤더에서 Secret 추출
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('[Payment Webhook] Missing or invalid Authorization header');
      return NextResponse.json({ received: false }, { status: 401 });
    }

    const providedSecret = authHeader.substring(7); // 'Bearer ' 제거
    if (providedSecret !== webhookSecret) {
      console.warn('[Payment Webhook] Invalid webhook secret');
      return NextResponse.json({ received: false }, { status: 403 });
    }

    // 2. Webhook 페이로드 파싱
    const payload = (await request.json()) as PortOneWebhookPayload;
    const { type, data } = payload;

    console.log(`[Payment Webhook] Received event: ${type}`, {
      paymentId: data.paymentId,
      status: data.status,
    });

    // 3. 이벤트 타입에 따라 처리
    if (type === 'Transaction.Paid') {
      // 결제 완료
      const { paymentId, status, method, receiptUrl } = data;

      if (!paymentId) {
        console.error('[Payment Webhook] paymentId is missing');
        return NextResponse.json({ received: false }, { status: 400 });
      }

      // Payment 레코드 조회
      const payment = await prisma.payment.findUnique({
        where: { paymentId },
      });

      if (!payment) {
        console.error(`[Payment Webhook] Payment not found: ${paymentId}`);
        return NextResponse.json({ received: false }, { status: 404 });
      }

      // 이미 처리된 경우 스킵
      if (payment.status === 'PAID') {
        console.log(`[Payment Webhook] Already processed: ${paymentId}`);
        return NextResponse.json({ received: true });
      }

      // Payment 업데이트
      await prisma.payment.update({
        where: { paymentId },
        data: {
          status: (status as PortOnePaymentStatus) || 'PAID',
          method: method || null,
          receiptUrl: receiptUrl || null,
          portoneData: {
            ...(payment.portoneData as object),
            webhookData: data,
          } as unknown as Prisma.InputJsonValue,
        },
      });

      console.log(`[Payment Webhook] Payment updated: ${paymentId}`);
    } else if (type === 'Transaction.Failed') {
      // 결제 실패
      const { paymentId, status, failReason } = data;

      if (!paymentId) {
        console.error('[Payment Webhook] paymentId is missing');
        return NextResponse.json({ received: false }, { status: 400 });
      }

      await prisma.payment.update({
        where: { paymentId },
        data: {
          status: (status as PortOnePaymentStatus) || 'FAILED',
          failReason: failReason || null,
          portoneData: { ...data } as unknown as Prisma.InputJsonValue,
        },
      });

      console.log(`[Payment Webhook] Payment failed: ${paymentId}`);
    } else if (type === 'Transaction.Cancelled') {
      // 결제 취소
      const { paymentId, status } = data;

      if (!paymentId) {
        console.error('[Payment Webhook] paymentId is missing');
        return NextResponse.json({ received: false }, { status: 400 });
      }

      await prisma.payment.update({
        where: { paymentId },
        data: {
          status: (status as PortOnePaymentStatus) || 'CANCELED',
          portoneData: { ...data } as unknown as Prisma.InputJsonValue,
        },
      });

      console.log(`[Payment Webhook] Payment cancelled: ${paymentId}`);
    } else {
      console.log(`[Payment Webhook] Unhandled event type: ${type}`);
    }

    // 4. 응답 반환
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Payment Webhook] Error:', error);
    return NextResponse.json({ received: false }, { status: 500 });
  }
}
