import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

/**
 * GET /api/payments/history
 *
 * @description
 * 사용자의 결제 내역을 조회합니다.
 *
 * @queryParams
 * - limit (optional): 결과 개수 제한 (기본값: 50)
 * - offset (optional): 페이지네이션 오프셋 (기본값: 0)
 * - status (optional): 결제 상태 필터 ('PAID', 'FAILED', 'CANCELED', 'REFUNDED')
 * - startDate (optional): 시작 날짜 (YYYY-MM-DD)
 * - endDate (optional): 종료 날짜 (YYYY-MM-DD)
 *
 * @returns {
 *   payments: Payment[],
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
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // 3. Where 조건 구성
    const where: {
      userId: string;
      status?: string;
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
    } = { userId };
    if (status) {
      where.status = status;
    }

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

    // 4. 결제 내역 조회
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          paymentId: true,
          amount: true,
          currency: true,
          status: true,
          method: true,
          purpose: true,
          receiptUrl: true,
          failReason: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return NextResponse.json({
      payments,
      total,
    });
  } catch (error) {
    logger.error('결제 내역 조회 실패', error);
    return NextResponse.json(
      { error: '결제 내역을 불러오는 중 문제가 발생했어요' },
      { status: 500 }
    );
  }
}
