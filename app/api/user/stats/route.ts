import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/user/stats
 *
 * @description
 * 사용자 통계 정보를 조회해요 (최적화: 4개 쿼리만 실행):
 * - 생성한 프리젠테이션 개수
 * - 최근 프리젠테이션 3개 (슬라이드 수 계산용)
 * - 크레딧 잔액
 * - 구독 플랜
 *
 * @returns {
 *   presentationsCount: number,
 *   totalSlides: number,  // 최근 3개 프리젠테이션의 슬라이드 수
 *   creditsBalance: number,
 *   creditsUsed: number,  // 현재 0 (추후 구현)
 *   subscriptionTier: 'FREE' | 'PRO' | 'PREMIUM',
 *   recentPresentations: Presentation[]
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

    // 2. 필수 데이터만 조회 (연결 풀 부담 최소화)
    const results = await Promise.allSettled([
      // 프리젠테이션 개수
      prisma.presentation.count({
        where: { userId, deletedAt: null },
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

      // 최근 프리젠테이션 3개 (metadata 포함해서 슬라이드 수도 계산)
      prisma.presentation.findMany({
        where: {
          userId,
          deletedAt: null,
        },
        select: {
          id: true,
          title: true,
          description: true,
          metadata: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
        take: 3,
      }),
    ]);

    // 결과 추출 (실패 시 기본값 사용 및 로그 기록)
    const presentationsCount = results[0].status === 'fulfilled' ? results[0].value : 0;
    const latestCreditTransaction = results[1].status === 'fulfilled' ? results[1].value : null;
    const subscription = results[2].status === 'fulfilled' ? results[2].value : null;
    const recentPresentations = results[3].status === 'fulfilled' ? results[3].value : [];

    // 실패한 쿼리 로그 기록
    const queryNames = [
      'presentationsCount',
      'latestCreditTransaction',
      'subscription',
      'recentPresentations',
    ];
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`⚠️ ${queryNames[index]} 쿼리 실패:`, result.reason);
      }
    });

    // 3. 최근 프리젠테이션의 총 슬라이드 수 계산 (전체가 아닌 최근 3개만)
    const totalSlides = recentPresentations.reduce((sum, p) => {
      const slideCount = (p.metadata as Record<string, unknown> | null)?.slideCount as number || 0;
      return sum + slideCount;
    }, 0);

    // 4. 사용한 크레딧은 나중에 추가 (현재는 0으로 반환)
    const creditsUsed = 0;

    // 5. 구독 플랜 결정
    let subscriptionTier: 'FREE' | 'PRO' | 'PREMIUM' = 'FREE';
    if (subscription) {
      if (subscription.tier === 'PREMIUM') {
        subscriptionTier = 'PREMIUM';
      } else if (subscription.tier === 'PRO') {
        subscriptionTier = 'PRO';
      }
    }

    // 6. 응답 반환
    return NextResponse.json({
      presentationsCount,
      totalSlides,
      creditsBalance: latestCreditTransaction?.balance || 0,
      creditsUsed,
      subscriptionTier,
      recentPresentations,
    });
  } catch (error) {
    console.error('사용자 통계 조회 실패:', error);
    return NextResponse.json(
      { error: '통계 정보를 불러오는 중 문제가 발생했어요' },
      { status: 500 }
    );
  }
}
