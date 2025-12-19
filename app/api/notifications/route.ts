/**
 * 알림 API
 *
 * GET /api/notifications - 알림 목록 조회
 * PATCH /api/notifications - 알림 읽음 처리
 *
 * @description
 * 구독 관련 알림을 조회하고 읽음 처리하는 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/notifications
 *
 * 알림 목록 조회
 * @query unreadOnly - true이면 읽지 않은 알림만 조회
 * @query limit - 최대 조회 개수 (기본 20)
 */
export async function GET(request: NextRequest) {
  try {
    // 1. 인증 체크
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요해요' },
        { status: 401 }
      );
    }

    // 2. 쿼리 파라미터 파싱
    const searchParams = request.nextUrl.searchParams;
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // 3. 알림 조회
    const notifications = await prisma.subscriptionNotification.findMany({
      where: {
        userId: session.user.id,
        ...(unreadOnly && { isRead: false }),
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        daysBeforeExpiry: true,
        isRead: true,
        readAt: true,
        createdAt: true,
      },
    });

    // 4. 읽지 않은 알림 개수
    const unreadCount = await prisma.subscriptionNotification.count({
      where: {
        userId: session.user.id,
        isRead: false,
      },
    });

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('[GET /api/notifications] Error:', error);
    return NextResponse.json(
      { error: '알림을 불러오지 못했어요' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications
 *
 * 알림 읽음 처리
 * @body { notificationIds: string[] } - 읽음 처리할 알림 ID 배열
 * @body { markAllAsRead: true } - 모든 알림 읽음 처리
 */
export async function PATCH(request: NextRequest) {
  try {
    // 1. 인증 체크
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요해요' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notificationIds, markAllAsRead } = body;

    const now = new Date();

    if (markAllAsRead) {
      // 모든 알림 읽음 처리
      await prisma.subscriptionNotification.updateMany({
        where: {
          userId: session.user.id,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: now,
        },
      });
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // 선택한 알림만 읽음 처리
      await prisma.subscriptionNotification.updateMany({
        where: {
          id: { in: notificationIds },
          userId: session.user.id, // 본인 알림만 수정 가능
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: now,
        },
      });
    } else {
      return NextResponse.json(
        { error: '잘못된 요청이에요' },
        { status: 400 }
      );
    }

    // 남은 읽지 않은 알림 개수
    const unreadCount = await prisma.subscriptionNotification.count({
      where: {
        userId: session.user.id,
        isRead: false,
      },
    });

    return NextResponse.json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error('[PATCH /api/notifications] Error:', error);
    return NextResponse.json(
      { error: '알림 처리에 실패했어요' },
      { status: 500 }
    );
  }
}
