/**
 * Cron Job: 구독 관리 배치 처리
 *
 * GET /api/cron/subscriptions
 *
 * @description
 * 매일 자정(UTC)에 실행되는 배치 작업
 * 1. 만료된 구독 상태 업데이트 (ACTIVE → EXPIRED)
 * 2. 만료 임박 알림 생성 (3일, 1일 전)
 * 3. 자동 갱신 결제 실행
 * 4. 결제 실패 재시도
 *
 * Vercel Cron: "0 0 * * *" (매일 00:00 UTC)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

// Vercel Cron 인증
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  try {
    // 1. 보안 체크 (Vercel Cron 또는 수동 실행)
    const authHeader = request.headers.get('authorization');
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';

    // Vercel Cron이 아니고, CRON_SECRET이 설정된 경우 인증 필요
    if (!isVercelCron && CRON_SECRET) {
      if (authHeader !== `Bearer ${CRON_SECRET}`) {
        logger.warn('Cron 미인증 요청');
        return NextResponse.json({ error: '인증되지 않은 요청이에요' }, { status: 401 });
      }
    }

    logger.info('구독 배치 작업 시작');
    const now = new Date();
    const results = {
      expired: 0,
      notificationsCreated: 0,
      renewalsAttempted: 0,
      renewalsSucceeded: 0,
      retriesAttempted: 0,
    };

    // 2. 만료된 구독 처리 (ACTIVE/CANCELED → EXPIRED → FREE 다운그레이드)
    // ACTIVE이면서 자동갱신이 아닌 구독, 또는 CANCELED 상태의 구독
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        OR: [
          {
            status: 'ACTIVE',
            autoRenewal: false, // 자동 갱신이 아닌 ACTIVE 구독
          },
          {
            status: 'CANCELED', // 취소된 구독 (기간 종료 시 만료 처리)
          },
        ],
        endDate: {
          lt: now,
        },
      },
      include: {
        user: {
          select: { email: true, name: true },
        },
      },
    });

    for (const sub of expiredSubscriptions) {
      const wasCanceled = sub.status === 'CANCELED';

      await prisma.$transaction([
        // 구독을 FREE 플랜으로 다운그레이드
        prisma.subscription.update({
          where: { id: sub.id },
          data: {
            status: 'ACTIVE', // FREE 플랜은 항상 ACTIVE
            tier: 'FREE',
            autoRenewal: false,
            billingKeyId: null,
            nextBillingDate: null,
            failedPaymentCount: 0,
          },
        }),
        // 만료 알림 생성
        prisma.subscriptionNotification.create({
          data: {
            subscriptionId: sub.id,
            userId: sub.userId,
            type: 'EXPIRED',
            title: wasCanceled ? '구독 기간이 종료되었어요' : '구독이 만료되었어요',
            message: wasCanceled
              ? `${sub.tier} 플랜 구독 기간이 종료되어 무료 플랜으로 변경되었어요.`
              : `${sub.tier} 플랜 구독이 만료되어 무료 플랜으로 변경되었어요. 계속 이용하시려면 다시 구독해주세요.`,
          },
        }),
      ]);
      results.expired++;
      logger.info('구독 만료 처리', { subscriptionId: sub.id, email: sub.user.email, wasCanceled });
    }

    // 3. 만료 임박 알림 (3일, 1일 전)
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    threeDaysFromNow.setHours(23, 59, 59, 999);

    const oneDayFromNow = new Date(now);
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);
    oneDayFromNow.setHours(23, 59, 59, 999);

    // 3일 전 알림 대상 (ACTIVE + 자동갱신 OFF, 또는 CANCELED)
    const expiringSoon3Days = await prisma.subscription.findMany({
      where: {
        OR: [
          { status: 'ACTIVE', autoRenewal: false },
          { status: 'CANCELED' },
        ],
        tier: { not: 'FREE' }, // FREE 플랜 제외
        endDate: {
          gte: new Date(threeDaysFromNow.getTime() - 24 * 60 * 60 * 1000), // 3일 전 시작
          lt: threeDaysFromNow, // 3일 전 끝
        },
        // 이미 3일 전 알림을 받지 않은 구독만
        NOT: {
          notifications: {
            some: {
              type: 'EXPIRING_SOON',
              daysBeforeExpiry: 3,
            },
          },
        },
      },
    });

    for (const sub of expiringSoon3Days) {
      const isCanceled = sub.status === 'CANCELED';
      await prisma.subscriptionNotification.create({
        data: {
          subscriptionId: sub.id,
          userId: sub.userId,
          type: 'EXPIRING_SOON',
          title: isCanceled ? '구독 기간 종료 3일 전이에요' : '구독 만료 3일 전이에요',
          message: isCanceled
            ? `${sub.tier} 플랜 이용 기간이 3일 후 종료돼요. 종료 후 무료 플랜으로 변경됩니다.`
            : `${sub.tier} 플랜 구독이 3일 후 만료돼요. 자동 갱신을 설정하시면 편리하게 이용하실 수 있어요.`,
          daysBeforeExpiry: 3,
        },
      });
      results.notificationsCreated++;
    }

    // 1일 전 알림 대상 (ACTIVE + 자동갱신 OFF, 또는 CANCELED)
    const expiringSoon1Day = await prisma.subscription.findMany({
      where: {
        OR: [
          { status: 'ACTIVE', autoRenewal: false },
          { status: 'CANCELED' },
        ],
        tier: { not: 'FREE' }, // FREE 플랜 제외
        endDate: {
          gte: new Date(oneDayFromNow.getTime() - 24 * 60 * 60 * 1000),
          lt: oneDayFromNow,
        },
        NOT: {
          notifications: {
            some: {
              type: 'EXPIRING_SOON',
              daysBeforeExpiry: 1,
            },
          },
        },
      },
    });

    for (const sub of expiringSoon1Day) {
      const isCanceled = sub.status === 'CANCELED';
      await prisma.subscriptionNotification.create({
        data: {
          subscriptionId: sub.id,
          userId: sub.userId,
          type: 'EXPIRING_SOON',
          title: isCanceled ? '구독 기간이 내일 종료돼요' : '구독이 내일 만료돼요',
          message: isCanceled
            ? `${sub.tier} 플랜 이용 기간이 내일 종료돼요. 종료 후 무료 플랜으로 변경됩니다.`
            : `${sub.tier} 플랜 구독이 내일 만료돼요. 계속 이용하시려면 자동 갱신을 설정하거나 직접 갱신해주세요.`,
          daysBeforeExpiry: 1,
        },
      });
      results.notificationsCreated++;
    }

    // 4. 자동 갱신 결제 실행
    const renewalDue = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        autoRenewal: true,
        billingKeyId: { not: null },
        endDate: {
          lte: now, // 만료일이 지난 자동 갱신 대상
        },
        failedPaymentCount: { lt: 3 }, // 3회 미만 실패
      },
      include: {
        billingKey: true,
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    for (const sub of renewalDue) {
      if (!sub.billingKey) continue;

      results.renewalsAttempted++;
      logger.info('구독 갱신 시도', { subscriptionId: sub.id });

      try {
        // 정기결제 실행 (빌링키 결제)
        const paymentResult = await executeRecurringPayment(sub);

        if (paymentResult.success) {
          // 성공: 구독 갱신
          const newEndDate = new Date();
          newEndDate.setDate(newEndDate.getDate() + 30);

          await prisma.$transaction([
            prisma.subscription.update({
              where: { id: sub.id },
              data: {
                endDate: newEndDate,
                nextBillingDate: newEndDate,
                failedPaymentCount: 0,
                lastPaymentAttempt: now,
              },
            }),
            prisma.subscriptionNotification.create({
              data: {
                subscriptionId: sub.id,
                userId: sub.userId,
                type: 'RENEWED',
                title: '구독이 갱신되었어요',
                message: `${sub.tier} 플랜 구독이 자동으로 갱신되었어요. 다음 결제일은 ${newEndDate.toLocaleDateString('ko-KR')}이에요.`,
              },
            }),
          ]);
          results.renewalsSucceeded++;
          logger.info('구독 갱신 성공', { subscriptionId: sub.id });
        } else {
          // 실패: 실패 카운트 증가
          const newFailCount = sub.failedPaymentCount + 1;
          const newStatus = newFailCount >= 3 ? 'PAST_DUE' : 'ACTIVE';

          await prisma.$transaction([
            prisma.subscription.update({
              where: { id: sub.id },
              data: {
                failedPaymentCount: newFailCount,
                lastPaymentAttempt: now,
                status: newStatus,
              },
            }),
            prisma.subscriptionNotification.create({
              data: {
                subscriptionId: sub.id,
                userId: sub.userId,
                type: 'PAYMENT_FAILED',
                title: '결제에 실패했어요',
                message: newFailCount >= 3
                  ? `${sub.tier} 플랜 자동 결제에 3회 연속 실패했어요. 결제 수단을 확인해주세요.`
                  : `${sub.tier} 플랜 자동 결제에 실패했어요. ${3 - newFailCount}회 더 시도 후 구독이 일시정지돼요.`,
              },
            }),
          ]);
          logger.warn('구독 갱신 실패', { subscriptionId: sub.id, failCount: newFailCount });
        }
      } catch (error) {
        logger.error('구독 갱신 오류', { subscriptionId: sub.id, error });
      }
    }

    // 5. 결제 실패 재시도 (1일, 3일, 7일 간격)
    const retrySchedule = [1, 3, 7]; // 재시도 간격 (일)
    const pastDueSubscriptions = await prisma.subscription.findMany({
      where: {
        status: { in: ['ACTIVE', 'PAST_DUE'] },
        autoRenewal: true,
        billingKeyId: { not: null },
        failedPaymentCount: { gte: 1, lt: 3 },
        lastPaymentAttempt: { not: null },
      },
      include: {
        billingKey: true,
        user: true,
      },
    });

    for (const sub of pastDueSubscriptions) {
      if (!sub.lastPaymentAttempt || !sub.billingKey) continue;

      const daysSinceLastAttempt = Math.floor(
        (now.getTime() - sub.lastPaymentAttempt.getTime()) / (24 * 60 * 60 * 1000)
      );

      const retryIndex = sub.failedPaymentCount - 1;
      const shouldRetry = retrySchedule[retryIndex] && daysSinceLastAttempt >= retrySchedule[retryIndex];

      if (shouldRetry) {
        results.retriesAttempted++;
        logger.info('결제 재시도', { subscriptionId: sub.id, attempt: sub.failedPaymentCount + 1 });

        try {
          const paymentResult = await executeRecurringPayment(sub);

          if (paymentResult.success) {
            const newEndDate = new Date();
            newEndDate.setDate(newEndDate.getDate() + 30);

            await prisma.$transaction([
              prisma.subscription.update({
                where: { id: sub.id },
                data: {
                  status: 'ACTIVE',
                  endDate: newEndDate,
                  nextBillingDate: newEndDate,
                  failedPaymentCount: 0,
                  lastPaymentAttempt: now,
                },
              }),
              prisma.subscriptionNotification.create({
                data: {
                  subscriptionId: sub.id,
                  userId: sub.userId,
                  type: 'PAYMENT_SUCCESS',
                  title: '밀린 결제가 완료되었어요',
                  message: `${sub.tier} 플랜 결제가 완료되어 구독이 정상화되었어요.`,
                },
              }),
            ]);
            results.renewalsSucceeded++;
          } else {
            const newFailCount = sub.failedPaymentCount + 1;
            await prisma.subscription.update({
              where: { id: sub.id },
              data: {
                failedPaymentCount: newFailCount,
                lastPaymentAttempt: now,
                status: newFailCount >= 3 ? 'PAST_DUE' : sub.status,
              },
            });
          }
        } catch (error) {
          logger.error('재시도 오류', { subscriptionId: sub.id, error });
        }
      }
    }

    logger.info('배치 작업 완료', results);

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      results,
    });
  } catch (error) {
    logger.error('배치 작업 오류', error);
    return NextResponse.json(
      { error: '배치 작업에 실패했어요', details: error instanceof Error ? error.message : '알 수 없는 오류' },
      { status: 500 }
    );
  }
}

/**
 * 정기결제 실행 (빌링키 결제)
 */
async function executeRecurringPayment(subscription: {
  id: string;
  userId: string;
  tier: string;
  billingKey: { billingKeyId: string } | null;
}): Promise<{ success: boolean; paymentId?: string; error?: string }> {
  if (!subscription.billingKey) {
    return { success: false, error: '빌링키가 없어요' };
  }

  // 결제 금액 결정
  const amount = subscription.tier === 'PRO' ? 4900 : 9900;

  // PortOne API로 빌링키 결제 실행
  const apiSecret = process.env.PORTONE_API_SECRET;
  const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;

  if (!apiSecret || !storeId) {
    logger.error('PortOne 인증 정보 미설정');
    return { success: false, error: '결제 시스템이 설정되지 않았어요' };
  }

  try {
    const paymentId = `recurring_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const response = await fetch('https://api.portone.io/payments/billing-key', {
      method: 'POST',
      headers: {
        Authorization: `PortOne ${apiSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        storeId,
        billingKey: subscription.billingKey.billingKeyId,
        orderName: `${subscription.tier} 플랜 정기결제`,
        customer: {
          customerId: subscription.userId,
        },
        amount: {
          total: amount,
        },
        currency: 'KRW',
        paymentId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('PortOne 빌링 결제 실패', { error: errorText });
      return { success: false, error: errorText };
    }

    const result = await response.json();

    // Payment 레코드 생성
    await prisma.payment.create({
      data: {
        paymentId,
        userId: subscription.userId,
        amount,
        currency: 'KRW',
        status: 'PAID',
        method: 'BILLING_KEY',
        purpose: 'SUBSCRIPTION_UPGRADE',
        subscriptionId: subscription.id,
        portoneData: result,
        receiptUrl: result.receiptUrl || null,
      },
    });

    return { success: true, paymentId };
  } catch (error) {
    logger.error('정기 결제 오류', error);
    return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' };
  }
}
