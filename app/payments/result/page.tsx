'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import { TOSS_COLORS } from '@/constants/design';
import {
  CheckCircle2,
  XCircle,
  Receipt,
  ArrowRight,
  Home,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import type { VerifyPaymentResponse } from '@/types/payment';

/**
 * 결제 결과 페이지
 *
 * @description
 * 포트원 결제 완료 후 결과를 표시하는 페이지입니다.
 * - 성공/실패 상태 표시
 * - 결제 정보 (금액, 결제 수단, 날짜)
 * - 영수증 URL 링크
 * - 구독/크레딧 상태
 * - 다음 액션 버튼
 *
 * @example
 * - 성공: /payments/result?success=true&paymentId=pay_xxx
 * - 실패: /payments/result?success=false&error=결제_취소
 */
export default function PaymentResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [paymentData, setPaymentData] = useState<VerifyPaymentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // URL params
  const success = searchParams.get('success') === 'true';
  const paymentId = searchParams.get('paymentId');
  const errorMessage = searchParams.get('error');

  // 로그인 체크
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/payments/result');
    }
  }, [status, router]);

  // 결제 정보 조회
  useEffect(() => {
    if (status === 'authenticated' && success && paymentId) {
      fetchPaymentInfo(paymentId);
    } else {
      setIsLoading(false);
    }
  }, [status, success, paymentId]);

  const fetchPaymentInfo = async (id: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/payments/${id}`);
      if (!res.ok) {
        throw new Error('결제 정보를 가져올 수 없어요');
      }
      const data = await res.json();
      setPaymentData(data);
    } catch (err) {
      console.error('결제 정보 조회 오류:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했어요');
    } finally {
      setIsLoading(false);
    }
  };

  // 로딩 상태
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">불러오고 있어요...</p>
      </div>
    );
  }

  // 미로그인 시 리다이렉트 중
  if (!session) {
    return null;
  }

  // 결제 실패
  if (!success) {
    return (
      <MaxWidthContainer className="py-8 lg:py-12">
        <div className="max-w-2xl mx-auto">
          {/* 실패 아이콘 */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
              style={{ backgroundColor: `${TOSS_COLORS.error}15` }}
            >
              <XCircle size={48} style={{ color: TOSS_COLORS.error }} />
            </div>
            <h1
              className="text-3xl lg:text-4xl font-bold mb-3"
              style={{ color: TOSS_COLORS.text }}
            >
              결제에 실패했어요
            </h1>
            <p
              className="text-base lg:text-lg"
              style={{ color: TOSS_COLORS.textSecondary }}
            >
              {errorMessage || '결제 처리 중 문제가 발생했어요'}
            </p>
          </div>

          {/* 실패 정보 카드 */}
          <Card className="p-6 mb-6">
            <h2
              className="text-lg font-bold mb-4"
              style={{ color: TOSS_COLORS.text }}
            >
              실패 사유
            </h2>
            <p
              className="text-sm"
              style={{ color: TOSS_COLORS.textSecondary }}
            >
              {errorMessage || '사용자가 결제를 취소했거나, 결제 처리 중 오류가 발생했어요'}
            </p>
          </Card>

          {/* 액션 버튼 */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => router.push('/')}
            >
              <Home size={20} className="mr-2" />
              홈으로 가기
            </Button>
            <Button
              className="flex-1"
              style={{
                backgroundColor: TOSS_COLORS.primary,
                color: '#FFFFFF',
              }}
              onClick={() => router.back()}
            >
              다시 시도하기
            </Button>
          </div>
        </div>
      </MaxWidthContainer>
    );
  }

  // 결제 성공 - 데이터 로딩 중 또는 에러
  if (error || !paymentData || !paymentData.payment) {
    return (
      <MaxWidthContainer className="py-8 lg:py-12">
        <div className="max-w-2xl mx-auto text-center">
          <p style={{ color: TOSS_COLORS.textSecondary }}>
            {error || '결제 정보를 불러오고 있어요...'}
          </p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => router.push('/')}
          >
            홈으로 가기
          </Button>
        </div>
      </MaxWidthContainer>
    );
  }

  // 결제 성공 (payment는 항상 정의됨)
  const payment = paymentData.payment;
  const isSubscription = payment && 'purpose' in (payment as any) && (payment as any).purpose === 'SUBSCRIPTION_UPGRADE';
  const isCredit = payment && 'purpose' in (payment as any) && (payment as any).purpose === 'CREDIT_PURCHASE';

  return (
    <MaxWidthContainer className="py-8 lg:py-12">
      <div className="max-w-2xl mx-auto">
        {/* 성공 아이콘 */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
            style={{ backgroundColor: `${TOSS_COLORS.success}15` }}
          >
            <CheckCircle2 size={48} style={{ color: TOSS_COLORS.success }} />
          </div>
          <h1
            className="text-3xl lg:text-4xl font-bold mb-3"
            style={{ color: TOSS_COLORS.text }}
          >
            결제가 완료됐어요!
          </h1>
          <p
            className="text-base lg:text-lg"
            style={{ color: TOSS_COLORS.textSecondary }}
          >
            {isSubscription
              ? '구독이 활성화됐어요'
              : isCredit
              ? '크레딧이 충전됐어요'
              : '결제가 성공적으로 처리됐어요'}
          </p>
        </div>

        {/* 결제 정보 카드 */}
        <Card className="p-6 mb-6">
          <h2
            className="text-lg font-bold mb-4"
            style={{ color: TOSS_COLORS.text }}
          >
            결제 내역
          </h2>

          <div className="space-y-3">
            {/* 결제 금액 */}
            <div className="flex items-center justify-between pb-3 border-b">
              <span style={{ color: TOSS_COLORS.textSecondary }}>
                결제 금액
              </span>
              <span
                className="text-xl font-bold"
                style={{ color: TOSS_COLORS.primary }}
              >
                ₩{payment.amount.toLocaleString()}
              </span>
            </div>

            {/* 결제 수단 */}
            {payment.status === 'PAID' && (
              <div className="flex items-center justify-between">
                <span style={{ color: TOSS_COLORS.textSecondary }}>
                  결제 수단
                </span>
                <span style={{ color: TOSS_COLORS.text }}>
                  {'method' in payment ? (payment as any).method || '카드' : '카드'}
                </span>
              </div>
            )}

            {/* 결제 일시 */}
            {payment.paidAt && (
              <div className="flex items-center justify-between">
                <span style={{ color: TOSS_COLORS.textSecondary }}>
                  결제 일시
                </span>
                <span style={{ color: TOSS_COLORS.text }}>
                  {new Date(payment.paidAt).toLocaleString('ko-KR')}
                </span>
              </div>
            )}

            {/* 주문 번호 */}
            <div className="flex items-center justify-between">
              <span style={{ color: TOSS_COLORS.textSecondary }}>
                주문 번호
              </span>
              <span
                className="text-sm font-mono"
                style={{ color: TOSS_COLORS.text }}
              >
                {payment.id}
              </span>
            </div>

            {/* 영수증 링크 */}
            {payment.receiptUrl && (
              <div className="pt-3 border-t">
                <a
                  href={payment.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors"
                  style={{
                    backgroundColor: TOSS_COLORS.surface,
                    color: TOSS_COLORS.primary,
                  }}
                >
                  <Receipt size={20} />
                  <span className="font-semibold">영수증 보기</span>
                  <ArrowRight size={16} />
                </a>
              </div>
            )}
          </div>
        </Card>

        {/* 구독 정보 (구독 결제인 경우) */}
        {isSubscription && paymentData.subscription && (
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles
                size={20}
                style={{ color: TOSS_COLORS.primary }}
              />
              <h2
                className="text-lg font-bold"
                style={{ color: TOSS_COLORS.text }}
              >
                구독 정보
              </h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span style={{ color: TOSS_COLORS.textSecondary }}>
                  플랜
                </span>
                <span
                  className="font-semibold"
                  style={{ color: TOSS_COLORS.primary }}
                >
                  {paymentData.subscription.tier === 'pro' ? 'Pro' : 'Premium'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span style={{ color: TOSS_COLORS.textSecondary }}>
                  상태
                </span>
                <span
                  className="px-2 py-1 rounded text-xs font-semibold"
                  style={{
                    backgroundColor: `${TOSS_COLORS.success}20`,
                    color: TOSS_COLORS.success,
                  }}
                >
                  활성
                </span>
              </div>

              {paymentData.subscription.endDate && (
                <div className="flex items-center justify-between">
                  <span style={{ color: TOSS_COLORS.textSecondary }}>
                    만료일
                  </span>
                  <span style={{ color: TOSS_COLORS.text }}>
                    {new Date(paymentData.subscription.endDate).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* 크레딧 정보 (크레딧 충전인 경우) */}
        {isCredit && paymentData.credits && (
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard
                size={20}
                style={{ color: TOSS_COLORS.primary }}
              />
              <h2
                className="text-lg font-bold"
                style={{ color: TOSS_COLORS.text }}
              >
                크레딧 정보
              </h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span style={{ color: TOSS_COLORS.textSecondary }}>
                  충전 크레딧
                </span>
                <span
                  className="text-xl font-bold"
                  style={{ color: TOSS_COLORS.primary }}
                >
                  +{paymentData.credits.amount.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span style={{ color: TOSS_COLORS.textSecondary }}>
                  현재 잔액
                </span>
                <span
                  className="font-semibold"
                  style={{ color: TOSS_COLORS.text }}
                >
                  {paymentData.credits.balance.toLocaleString()} 크레딧
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            className="flex-1"
            variant="outline"
            onClick={() => router.push('/')}
          >
            <Home size={20} className="mr-2" />
            홈으로 가기
          </Button>
          <Button
            className="flex-1"
            style={{
              backgroundColor: TOSS_COLORS.primary,
              color: '#FFFFFF',
            }}
            onClick={() => {
              if (isSubscription) {
                router.push('/subscription');
              } else if (isCredit) {
                router.push('/credits');
              } else {
                router.push('/');
              }
            }}
          >
            {isSubscription
              ? '구독 관리하기'
              : isCredit
              ? '크레딧 관리하기'
              : '계속 사용하기'}
            <ArrowRight size={20} className="ml-2" />
          </Button>
        </div>
      </div>
    </MaxWidthContainer>
  );
}
