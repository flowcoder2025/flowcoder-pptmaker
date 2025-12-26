/**
 * POST /api/payments/billing-key/issue
 *
 * 빌링키 발급 요청 생성
 *
 * @description
 * 1. NextAuth 세션 확인
 * 2. 고유 billingKey ID 생성
 * 3. 포트원 SDK용 빌링키 발급 요청 데이터 반환
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function POST() {
  try {
    // 1. 인증 체크
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요해요' },
        { status: 401 }
      );
    }

    // 2. 기존 활성 빌링키가 있는지 확인
    const existingBillingKey = await prisma.billingKey.findFirst({
      where: {
        userId: session.user.id,
        isActive: true,
      },
    });

    if (existingBillingKey) {
      return NextResponse.json(
        { success: false, error: '이미 등록된 결제 수단이 있어요. 기존 결제 수단을 삭제 후 다시 시도해주세요.' },
        { status: 400 }
      );
    }

    // 3. storeId 환경 변수 확인
    const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
    if (!storeId) {
      logger.error('PORTONE_STORE_ID 미설정');
      return NextResponse.json(
        { success: false, error: '결제 시스템 설정이 올바르지 않아요' },
        { status: 500 }
      );
    }

    // 4. 사용자 정보 조회
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

    // 5. 고유 billingKey ID 생성
    const billingKeyId = `bk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // 6. 포트원 빌링키 발급 요청 객체 생성
    // 카카오페이 정기결제 채널 사용 (프로덕션)
    const channelKey = 'channel-key-999ee55e-eafd-4203-b87b-4733326232b0';

    const billingKeyRequest = {
      storeId,
      billingKeyId,
      channelKey,
      customer: {
        customerId: session.user.id,
        fullName: user.name || undefined,
        email: user.email || undefined,
        phoneNumber: user.phoneNumber || undefined,
      },
      redirectUrl: `${process.env.NEXTAUTH_URL}/subscription?billingKeyIssued=true`,
    };

    logger.debug('빌링키 발급 요청 생성', {
      billingKeyId,
      userId: session.user.id,
    });

    return NextResponse.json({
      success: true,
      billingKeyId,
      billingKeyRequest,
    });
  } catch (error) {
    logger.error('빌링키 발급 요청 생성 실패', error);
    return NextResponse.json(
      {
        success: false,
        error: '빌링키 발급 요청 생성 중 오류가 발생했어요',
      },
      { status: 500 }
    );
  }
}
