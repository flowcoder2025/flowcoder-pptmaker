/**
 * POST /api/payments/billing-key/save
 *
 * 빌링키 검증 및 저장
 *
 * @description
 * 1. NextAuth 세션 확인
 * 2. 포트원 API로 빌링키 검증
 * 3. DB에 빌링키 저장
 * 4. 구독에 연결 (선택사항)
 */

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface SaveBillingKeyBody {
  billingKeyId: string;
  connectToSubscription?: boolean;
}

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

    // 2. 요청 본문 파싱
    const body = (await request.json()) as SaveBillingKeyBody;
    const { billingKeyId, connectToSubscription = true } = body;

    if (!billingKeyId) {
      return NextResponse.json(
        { success: false, error: '빌링키 ID가 필요해요' },
        { status: 400 }
      );
    }

    // 3. 이미 저장된 빌링키인지 확인
    const existingKey = await prisma.billingKey.findUnique({
      where: { billingKeyId },
    });

    if (existingKey) {
      return NextResponse.json(
        { success: false, error: '이미 등록된 빌링키에요' },
        { status: 400 }
      );
    }

    // 4. 포트원 API로 빌링키 검증
    const apiSecret = process.env.PORTONE_API_SECRET;
    const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;

    if (!apiSecret || !storeId) {
      console.error('[BillingKey Save] Missing API credentials');
      return NextResponse.json(
        { success: false, error: '결제 시스템 설정이 올바르지 않아요' },
        { status: 500 }
      );
    }

    // 포트원 V2 빌링키 조회 API
    const portoneResponse = await fetch(
      `https://api.portone.io/billing-keys/${billingKeyId}?storeId=${storeId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `PortOne ${apiSecret}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('[BillingKey Save] PortOne API response status:', portoneResponse.status);

    if (!portoneResponse.ok) {
      const errorText = await portoneResponse.text();
      console.error('[BillingKey Save] PortOne API error:', portoneResponse.status, errorText);
      return NextResponse.json(
        { success: false, error: '빌링키 검증에 실패했어요' },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const portoneData = (await portoneResponse.json()) as any;
    console.log('[BillingKey Save] PortOne response:', JSON.stringify(portoneData, null, 2));

    // 빌링키 상태 확인
    if (portoneData.status !== 'ISSUED') {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 빌링키에요' },
        { status: 400 }
      );
    }

    // 5. 카드 정보 추출
    const method = portoneData.methods?.[0];
    const cardInfo = method?.card ? {
      issuer: method.card.issuer?.name || method.card.issuer || '카드사',
      maskedNumber: method.card.number || '****-****-****-****',
      cardType: method.card.type || 'CREDIT',
    } : {
      issuer: '카카오페이',
      maskedNumber: '****',
      cardType: 'EASY_PAY',
    };

    // 6. DB에 빌링키 저장
    const result = await prisma.$transaction(async (tx) => {
      // 기존 활성 빌링키 비활성화
      await tx.billingKey.updateMany({
        where: {
          userId: session.user!.id,
          isActive: true,
        },
        data: { isActive: false },
      });

      // 새 빌링키 저장
      const billingKey = await tx.billingKey.create({
        data: {
          billingKeyId,
          userId: session.user!.id,
          cardInfo: cardInfo as Prisma.InputJsonValue,
          isActive: true,
          expiresAt: null, // 카카오페이는 만료일 없음
          portoneData: portoneData as Prisma.InputJsonValue,
        },
      });

      // 구독에 연결
      let subscription = null;
      if (connectToSubscription) {
        subscription = await tx.subscription.findUnique({
          where: { userId: session.user!.id },
        });

        if (subscription && subscription.status === 'ACTIVE') {
          // 30일 후로 다음 결제일 설정
          const nextBillingDate = new Date();
          nextBillingDate.setDate(nextBillingDate.getDate() + 30);

          subscription = await tx.subscription.update({
            where: { id: subscription.id },
            data: {
              autoRenewal: true,
              billingKeyId: billingKey.id,
              nextBillingDate,
              failedPaymentCount: 0,
            },
          });

          console.log('[BillingKey Save] Connected to subscription:', subscription.id);
        }
      }

      return { billingKey, subscription };
    });

    // 7. 알림 생성
    if (result.subscription) {
      await prisma.subscriptionNotification.create({
        data: {
          subscriptionId: result.subscription.id,
          userId: session.user.id,
          type: 'PAYMENT_SUCCESS',
          title: '자동 결제 등록 완료',
          message: '자동 결제가 등록되었어요. 구독 기간이 끝나면 자동으로 결제됩니다.',
        },
      });
    }

    return NextResponse.json({
      success: true,
      billingKey: {
        id: result.billingKey.id,
        billingKeyId: result.billingKey.billingKeyId,
        cardInfo,
        isActive: result.billingKey.isActive,
        createdAt: result.billingKey.createdAt.toISOString(),
      },
      subscription: result.subscription ? {
        id: result.subscription.id,
        autoRenewal: result.subscription.autoRenewal,
        nextBillingDate: result.subscription.nextBillingDate?.toISOString(),
      } : null,
    });
  } catch (error) {
    console.error('[BillingKey Save] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '빌링키 저장 중 오류가 발생했어요',
      },
      { status: 500 }
    );
  }
}
