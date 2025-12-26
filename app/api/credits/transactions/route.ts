import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

/**
 * GET /api/credits/transactions
 *
 * @description
 * 사용자의 크레딧 거래 내역을 조회합니다.
 *
 * @queryParams
 * - limit (optional): 결과 개수 제한 (기본값: 50)
 * - offset (optional): 페이지네이션 오프셋 (기본값: 0)
 * - startDate (optional): 시작 날짜 (YYYY-MM-DD)
 * - endDate (optional): 종료 날짜 (YYYY-MM-DD)
 *
 * @returns {
 *   transactions: CreditTransaction[],
 *   total: number
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

    // 2. 쿼리 파라미터 추출
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // 3. Where 조건 구성
    const where: {
      userId: string;
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
    } = { userId };

    // 날짜 필터 추가
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        // 종료 날짜는 해당 날짜의 23:59:59까지 포함
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDateTime;
      }
    }

    // 4. 크레딧 거래 내역 조회
    const [transactions, total] = await Promise.all([
      prisma.creditTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          type: true,
          sourceType: true,
          amount: true,
          description: true,
          expiresAt: true,
          createdAt: true,
        },
      }),
      prisma.creditTransaction.count({
        where,
      }),
    ]);

    return NextResponse.json({
      transactions,
      total,
    });
  } catch (error) {
    logger.error('크레딧 거래 내역 조회 실패', error);
    return NextResponse.json(
      { error: '거래 내역을 불러오는 중 문제가 발생했어요' },
      { status: 500 }
    );
  }
}
