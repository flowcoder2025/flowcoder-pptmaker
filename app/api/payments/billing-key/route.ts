/**
 * /api/payments/billing-key
 *
 * GET - 사용자의 활성 빌링키 조회
 * DELETE - 빌링키 삭제 (자동 결제 해제)
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/payments/billing-key
 *
 * 사용자의 활성 빌링키 조회
 */
export async function GET() {
  try {
    // 1. 인증 체크
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요해요' },
        { status: 401 }
      );
    }

    // 2. 활성 빌링키 조회
    const billingKey = await prisma.billingKey.findFirst({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      select: {
        id: true,
        billingKeyId: true,
        cardInfo: true,
        isActive: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    if (!billingKey) {
      return NextResponse.json({
        success: true,
        billingKey: null,
      });
    }

    // 3. 연결된 구독 정보 조회
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        autoRenewal: true,
        nextBillingDate: true,
        billingKeyId: true,
      },
    });

    const cardInfo = billingKey.cardInfo as {
      issuer: string;
      maskedNumber: string;
      cardType: string;
    };

    return NextResponse.json({
      success: true,
      billingKey: {
        id: billingKey.id,
        billingKeyId: billingKey.billingKeyId,
        isActive: billingKey.isActive,
        cardInfo: {
          issuer: cardInfo.issuer,
          maskedNumber: cardInfo.maskedNumber,
          cardType: cardInfo.cardType,
        },
        expiresAt: billingKey.expiresAt?.toISOString() || null,
        createdAt: billingKey.createdAt.toISOString(),
        isConnectedToSubscription: subscription?.billingKeyId === billingKey.id,
      },
      subscription: subscription ? {
        id: subscription.id,
        autoRenewal: subscription.autoRenewal,
        nextBillingDate: subscription.nextBillingDate?.toISOString() || null,
      } : null,
    });
  } catch (error) {
    console.error('[BillingKey GET] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '빌링키 조회 중 오류가 발생했어요',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/payments/billing-key
 *
 * 빌링키 삭제 (자동 결제 해제)
 */
export async function DELETE() {
  try {
    // 1. 인증 체크
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요해요' },
        { status: 401 }
      );
    }

    // 2. 활성 빌링키 조회
    const billingKey = await prisma.billingKey.findFirst({
      where: {
        userId: session.user.id,
        isActive: true,
      },
    });

    if (!billingKey) {
      return NextResponse.json(
        { success: false, error: '등록된 결제 수단이 없어요' },
        { status: 404 }
      );
    }

    // 3. 포트원 API로 빌링키 삭제 요청
    const apiSecret = process.env.PORTONE_API_SECRET;
    const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;

    if (apiSecret && storeId) {
      try {
        const portoneResponse = await fetch(
          `https://api.portone.io/billing-keys/${billingKey.billingKeyId}?storeId=${storeId}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `PortOne ${apiSecret}`,
              'Content-Type': 'application/json',
            },
          }
        );

        console.log('[BillingKey DELETE] PortOne API response:', portoneResponse.status);

        // 삭제 실패해도 DB에서는 비활성화 처리
        if (!portoneResponse.ok) {
          console.warn('[BillingKey DELETE] PortOne deletion failed, but continuing with DB update');
        }
      } catch (portoneError) {
        console.error('[BillingKey DELETE] PortOne API error:', portoneError);
        // 포트원 API 실패해도 계속 진행
      }
    }

    // 4. 트랜잭션으로 DB 업데이트
    await prisma.$transaction(async (tx) => {
      // 빌링키 비활성화
      await tx.billingKey.update({
        where: { id: billingKey.id },
        data: { isActive: false },
      });

      // 연결된 구독의 자동 결제 해제
      await tx.subscription.updateMany({
        where: {
          userId: session.user!.id,
          billingKeyId: billingKey.id,
        },
        data: {
          autoRenewal: false,
          billingKeyId: null,
          nextBillingDate: null,
        },
      });
    });

    // 5. 알림 생성
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (subscription) {
      await prisma.subscriptionNotification.create({
        data: {
          subscriptionId: subscription.id,
          userId: session.user.id,
          type: 'PAYMENT_SUCCESS', // 결제 수단 변경도 같은 타입 사용
          title: '자동 결제 해제 완료',
          message: '자동 결제가 해제되었어요. 구독 기간이 끝나면 자동으로 무료 플랜으로 변경됩니다.',
        },
      });
    }

    console.log('[BillingKey DELETE] Successfully deleted billing key:', billingKey.billingKeyId);

    return NextResponse.json({
      success: true,
      message: '결제 수단이 삭제되었어요',
    });
  } catch (error) {
    console.error('[BillingKey DELETE] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '빌링키 삭제 중 오류가 발생했어요',
      },
      { status: 500 }
    );
  }
}
