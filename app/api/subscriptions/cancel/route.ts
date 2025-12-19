/**
 * 구독 취소 API
 *
 * POST /api/subscriptions/cancel
 * 현재 구독을 취소해요. 현재 구독 기간이 끝날 때까지는 계속 사용할 수 있어요.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // 1. 인증 체크
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요해요' },
        { status: 401 }
      );
    }

    // 2. 현재 구독 조회
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: '활성 구독이 없어요' },
        { status: 404 }
      );
    }

    // 이미 취소된 상태인지 확인
    if (subscription.status === 'CANCELED') {
      return NextResponse.json(
        { error: '이미 구독이 취소되었어요' },
        { status: 400 }
      );
    }

    // FREE 플랜은 취소할 수 없음
    if (subscription.tier === 'FREE') {
      return NextResponse.json(
        { error: '무료 플랜은 취소할 수 없어요' },
        { status: 400 }
      );
    }

    // 3. 구독 상태를 CANCELED로 업데이트
    // endDate는 유지 - 해당 날짜까지는 계속 사용 가능
    const updatedSubscription = await prisma.subscription.update({
      where: { userId: session.user.id },
      data: {
        status: 'CANCELED',
      },
    });

    console.log('[POST /api/subscriptions/cancel] 구독 취소:', {
      userId: session.user.id,
      subscriptionId: updatedSubscription.id,
      tier: updatedSubscription.tier,
      endDate: updatedSubscription.endDate,
    });

    // 4. 응답 반환
    return NextResponse.json({
      success: true,
      message: '구독이 취소되었어요. 현재 구독 기간이 끝날 때까지는 계속 사용할 수 있어요.',
      subscription: {
        id: updatedSubscription.id,
        tier: updatedSubscription.tier,
        status: updatedSubscription.status,
        endDate: updatedSubscription.endDate?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error('[POST /api/subscriptions/cancel] 구독 취소 실패:', error);
    return NextResponse.json(
      { error: '구독 취소에 실패했어요' },
      { status: 500 }
    );
  }
}
