import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/user/stats
 *
 * @description
 * 사용자 통계 정보를 조회해요:
 * - 생성한 프리젠테이션 개수
 * - 크레딧 잔액
 * - 구독 플랜
 *
 * @returns {
 *   presentationsCount: number,
 *   creditsBalance: number,
 *   subscriptionTier: 'FREE' | 'PRO' | 'PREMIUM'
 * }
 */
export async function GET() {
  try {
    // 1. 인증 체크
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요해요' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 2. 병렬로 데이터 조회
    const [presentationsCount, latestCreditTransaction, subscription] = await Promise.all([
      // 프리젠테이션 개수
      prisma.presentation.count({
        where: { userId },
      }),

      // 크레딧 잔액 (최신 거래의 balance)
      prisma.creditTransaction.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { balance: true },
      }),

      // 활성 구독
      prisma.subscription.findFirst({
        where: {
          userId,
          status: 'ACTIVE',
        },
        orderBy: {
          startDate: 'desc',
        },
      }),
    ]);

    // 3. 구독 플랜 결정
    let subscriptionTier: 'FREE' | 'PRO' | 'PREMIUM' = 'FREE';
    if (subscription) {
      if (subscription.tier === 'PREMIUM') {
        subscriptionTier = 'PREMIUM';
      } else if (subscription.tier === 'PRO') {
        subscriptionTier = 'PRO';
      }
    }

    // 4. 응답 반환
    return NextResponse.json({
      presentationsCount,
      creditsBalance: latestCreditTransaction?.balance || 0,
      subscriptionTier,
    });
  } catch (error) {
    console.error('사용자 통계 조회 실패:', error);
    return NextResponse.json(
      { error: '통계 정보를 불러오는 중 문제가 발생했어요' },
      { status: 500 }
    );
  }
}
