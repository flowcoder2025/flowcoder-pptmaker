import { Prisma } from '@prisma/client'
/**
 * POST /api/payments/webhook
 *
 * 포트원 V2 Webhook 수신
 *
 * @description
 * 포트원에서 결제 상태 변경 시 비동기로 호출하는 Webhook 엔드포인트
 * 1. Standard Webhooks 스펙에 따른 서명 검증 (포트원 Server SDK 사용)
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
import * as PortOne from '@portone/server-sdk';
import type { PortOnePaymentStatus } from '@/types/payment';

export async function POST(request: NextRequest) {
  try {
    // 1. Webhook Secret 확인
    const webhookSecret = process.env.PORTONE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[Payment Webhook] PORTONE_WEBHOOK_SECRET not configured');
      return NextResponse.json({ received: false }, { status: 500 });
    }

    // 2. 웹훅 검증을 위한 헤더 및 바디 추출
    const body = await request.text();
    const webhookId = request.headers.get('webhook-id');
    const webhookTimestamp = request.headers.get('webhook-timestamp');
    const webhookSignature = request.headers.get('webhook-signature');

    console.log('[Payment Webhook] Headers:', {
      'webhook-id': webhookId,
      'webhook-timestamp': webhookTimestamp,
      'webhook-signature': webhookSignature ? 'present' : 'missing',
    });

    // 3. Standard Webhooks 서명 검증
    if (!webhookId || !webhookTimestamp || !webhookSignature) {
      console.error('[Payment Webhook] Missing webhook headers');
      return NextResponse.json({ received: false }, { status: 401 });
    }

    try {
      // 포트원 Server SDK를 사용한 웹훅 검증
      await PortOne.Webhook.verify(webhookSecret, body, {
        'webhook-id': webhookId,
        'webhook-timestamp': webhookTimestamp,
        'webhook-signature': webhookSignature,
      });
      console.log('[Payment Webhook] Signature verified successfully');
    } catch (verifyError) {
      console.error('[Payment Webhook] Signature verification failed:', verifyError);
      return NextResponse.json({ received: false }, { status: 403 });
    }

    // 4. Webhook 페이로드 파싱
    const payload = JSON.parse(body);
    const { type, data } = payload;

    console.log(`[Payment Webhook] Received event: ${type}`, {
      paymentId: data?.paymentId,
      status: data?.status,
    });

    // 5. 이벤트 타입에 따라 처리
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

    // 6. 응답 반환
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Payment Webhook] Error:', error);
    return NextResponse.json({ received: false }, { status: 500 });
  }
}
