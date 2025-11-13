import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

/**
 * GET /api/stats/usage
 *
 * @description
 * 사용자의 크레딧 사용 및 결제 통계를 조회합니다.
 *
 * @returns {
 *   summary: {
 *     totalCreditsUsed: number
 *     totalPaymentAmount: number
 *     currentMonthUsage: number
 *     currentMonthPayment: number
 *   },
 *   monthlyCredits: Array<{month: string, used: number, purchased: number}>,
 *   monthlyPayments: Array<{month: string, amount: number}>,
 *   creditTypeDistribution: Array<{type: string, count: number}>
 * }
 */
export async function GET(req: Request) {
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
    const now = new Date();

    // 2. 이번 달 범위 계산
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);

    // 3. 총 사용 크레딧 (amount < 0인 거래들의 절댓값 합계)
    const totalCreditsUsedResult = await prisma.creditTransaction.aggregate({
      where: {
        userId,
        amount: { lt: 0 },
      },
      _sum: {
        amount: true,
      },
    });
    const totalCreditsUsed = Math.abs(totalCreditsUsedResult._sum.amount || 0);

    // 4. 총 결제 금액 (status='PAID'인 결제들의 합계)
    const totalPaymentAmountResult = await prisma.payment.aggregate({
      where: {
        userId,
        status: 'PAID',
      },
      _sum: {
        amount: true,
      },
    });
    const totalPaymentAmount = totalPaymentAmountResult._sum.amount || 0;

    // 5. 이번 달 사용 크레딧
    const currentMonthUsageResult = await prisma.creditTransaction.aggregate({
      where: {
        userId,
        amount: { lt: 0 },
        createdAt: {
          gte: thisMonthStart,
          lte: thisMonthEnd,
        },
      },
      _sum: {
        amount: true,
      },
    });
    const currentMonthUsage = Math.abs(currentMonthUsageResult._sum.amount || 0);

    // 6. 이번 달 결제 금액
    const currentMonthPaymentResult = await prisma.payment.aggregate({
      where: {
        userId,
        status: 'PAID',
        createdAt: {
          gte: thisMonthStart,
          lte: thisMonthEnd,
        },
      },
      _sum: {
        amount: true,
      },
    });
    const currentMonthPayment = currentMonthPaymentResult._sum.amount || 0;

    // 7. 월별 크레딧 추이 (최근 6개월)
    const monthlyCreditsData: Array<{ month: string; used: number; purchased: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      const monthLabel = format(monthDate, 'yyyy-MM');

      // 해당 월의 사용 크레딧 (amount < 0)
      const usedResult = await prisma.creditTransaction.aggregate({
        where: {
          userId,
          amount: { lt: 0 },
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: {
          amount: true,
        },
      });
      const used = Math.abs(usedResult._sum.amount || 0);

      // 해당 월의 구매 크레딧 (amount > 0)
      const purchasedResult = await prisma.creditTransaction.aggregate({
        where: {
          userId,
          amount: { gt: 0 },
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: {
          amount: true,
        },
      });
      const purchased = purchasedResult._sum.amount || 0;

      monthlyCreditsData.push({
        month: monthLabel,
        used,
        purchased,
      });
    }

    // 8. 월별 결제 추이 (최근 6개월)
    const monthlyPaymentsData: Array<{ month: string; amount: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      const monthLabel = format(monthDate, 'yyyy-MM');

      const monthPaymentResult = await prisma.payment.aggregate({
        where: {
          userId,
          status: 'PAID',
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: {
          amount: true,
        },
      });

      monthlyPaymentsData.push({
        month: monthLabel,
        amount: monthPaymentResult._sum.amount || 0,
      });
    }

    // 9. 크레딧 타입별 사용 분포 (sourceType 별 count)
    const creditTypeDistributionRaw = await prisma.creditTransaction.groupBy({
      by: ['sourceType'],
      where: {
        userId,
        amount: { lt: 0 }, // 사용 내역만
      },
      _count: {
        id: true,
      },
    });

    const creditTypeDistribution = creditTypeDistributionRaw.map((item) => ({
      type: item.sourceType,
      count: item._count.id,
    }));

    // 10. 응답 구성
    return NextResponse.json({
      summary: {
        totalCreditsUsed,
        totalPaymentAmount,
        currentMonthUsage,
        currentMonthPayment,
      },
      monthlyCredits: monthlyCreditsData,
      monthlyPayments: monthlyPaymentsData,
      creditTypeDistribution,
    });
  } catch (error) {
    console.error('통계 조회 실패:', error);
    return NextResponse.json(
      { error: '통계를 불러오는 중 문제가 발생했어요' },
      { status: 500 }
    );
  }
}
