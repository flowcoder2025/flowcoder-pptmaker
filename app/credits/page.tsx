'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import { useCreditStore } from '@/store/creditStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { usePortOnePayment, PAYMENT_CHANNELS } from '@/hooks/usePortOnePayment';
import { PLAN_BENEFITS } from '@/constants/subscription';
import { CREDIT_BUNDLES, CREDIT_COST } from '@/constants/credits';
import { TOSS_COLORS } from '@/constants/design';
import { Coins, Sparkles, TrendingUp, Loader2 } from 'lucide-react';
import KakaoAdBanner from '@/components/ads/KakaoAdBanner';
import KakaoAdMobileThick from '@/components/ads/KakaoAdMobileThick';

/**
 * 크레딧 관리 페이지
 *
 * @description
 * TDS 스타일로 디자인된 크레딧 잔액 확인 및 구매 페이지입니다.
 * 크레딧 묶음 구매 및 사용 내역을 확인할 수 있습니다.
 */
export default function CreditsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { totalCredits, isFirstTimeFree, useFirstTimeFree, fetchBalance } = useCreditStore();
  const { plan } = useSubscriptionStore();
  const { requestPayment, isLoading, error, clearError } = usePortOnePayment();

  const [isChannelDialogOpen, setIsChannelDialogOpen] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<typeof CREDIT_BUNDLES[0] | null>(null);

  // 광고 표시 여부 결정 (유료 플랜은 광고 제거)
  const showAds = !PLAN_BENEFITS[plan].benefits.adFree;

  // 로그인 체크
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/credits');
    }
  }, [status, router]);

  // 서버에서 크레딧 데이터 가져오기
  useEffect(() => {
    if (status === 'authenticated' && session) {
      fetchBalance();
    }
  }, [status, session, fetchBalance]);

  // 로딩 상태
  if (status === 'loading') {
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

  // 크레딧 구매 처리
  const handlePurchase = (bundleId: string) => {
    const bundle = CREDIT_BUNDLES.find((b) => b.id === bundleId);
    if (!bundle) return;

    // 결제 채널 선택 다이얼로그 열기
    setSelectedBundle(bundle);
    setIsChannelDialogOpen(true);
  };

  // 결제 채널 선택 후 결제 진행
  const handlePaymentChannelSelect = async (channelKey: string) => {
    if (!selectedBundle || !session) return;

    try {
      clearError();
      setIsChannelDialogOpen(false);

      const result = await requestPayment({
        purpose: 'CREDIT_PURCHASE',
        amount: selectedBundle.price,
        orderName: `크레딧 ${selectedBundle.credits}개 구매`,
        channelKey,
        creditAmount: selectedBundle.credits,
      });

      if (result.success && result.payment) {
        // 성공: 결제 결과 페이지로 이동
        await fetchBalance();
        router.push(`/payments/result?success=true&paymentId=${result.payment.id}`);
      } else {
        // 실패: 결제 결과 페이지로 이동 (에러 메시지 포함)
        router.push(`/payments/result?success=false&error=${encodeURIComponent(result.error || '결제에 실패했어요')}`);
      }
    } catch (err) {
      console.error('결제 중 오류:', err);
      const errorMsg = err instanceof Error ? err.message : '결제 처리 중 문제가 발생했어요';
      router.push(`/payments/result?success=false&error=${encodeURIComponent(errorMsg)}`);
    } finally {
      setSelectedBundle(null);
    }
  };

  return (
    <MaxWidthContainer className="py-8 lg:py-12">
      {/* 광고 - 상단 (무료 플랜만) */}
      {showAds && (
        <div className="mb-8">
          <KakaoAdMobileThick />
        </div>
      )}

      {/* 페이지 헤더 */}
      <div className="text-center mb-10">
        <h1
          className="text-3xl lg:text-4xl font-bold mb-3"
          style={{ color: TOSS_COLORS.text }}
        >
          크레딧 관리
        </h1>
        <p
          className="text-base lg:text-lg"
          style={{ color: TOSS_COLORS.textSecondary }}
        >
          크레딧으로 고품질 생성과 심층 검색을 이용해보세요
        </p>
      </div>

      {/* 잔액 카드 (대형) */}
      <div
        className="rounded-2xl p-8 mb-10 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${TOSS_COLORS.primary} 0%, #2563EB 100%)`,
        }}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Coins size={24} color="#FFFFFF" />
            <span className="text-white text-lg font-semibold">
              보유 크레딧
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-5xl lg:text-6xl font-bold text-white">
              {totalCredits.toLocaleString()}
            </span>
            <span className="text-xl text-white opacity-80">
              크레딧
            </span>
          </div>

          {/* 최초 무료 안내 */}
          {(isFirstTimeFree('deepResearch') || isFirstTimeFree('qualityGeneration')) && (
            <div
              className="inline-block px-4 py-2 rounded-lg text-sm font-semibold"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
              }}
            >
              🎁 최초 1회 무료로 사용해보세요!
            </div>
          )}
        </div>

        {/* 배경 장식 */}
        <div
          className="absolute top-0 right-0 opacity-10"
          style={{
            fontSize: '200px',
            lineHeight: 1,
            color: '#FFFFFF',
          }}
        >
          💎
        </div>
      </div>

      {/* 크레딧 사용량 안내 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <div
          className="rounded-xl p-5"
          style={{ backgroundColor: TOSS_COLORS.surface }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles
              size={20}
              style={{ color: TOSS_COLORS.primary }}
            />
            <h3
              className="font-bold"
              style={{ color: TOSS_COLORS.text }}
            >
              심층 검색
            </h3>
          </div>
          <p
            className="text-sm mb-1"
            style={{ color: TOSS_COLORS.textSecondary }}
          >
            검색 전용 AI로 웹 자료를 조사해요
          </p>
          <p
            className="text-2xl font-bold"
            style={{ color: TOSS_COLORS.primary }}
          >
            {CREDIT_COST.DEEP_RESEARCH} 크레딧
          </p>
        </div>

        <div
          className="rounded-xl p-5"
          style={{ backgroundColor: TOSS_COLORS.surface }}
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp
              size={20}
              style={{ color: TOSS_COLORS.primary }}
            />
            <h3
              className="font-bold"
              style={{ color: TOSS_COLORS.text }}
            >
              고품질 생성
            </h3>
          </div>
          <p
            className="text-sm mb-1"
            style={{ color: TOSS_COLORS.textSecondary }}
          >
            추론 모델로 더 나은 품질을 제공해요
          </p>
          <p
            className="text-2xl font-bold"
            style={{ color: TOSS_COLORS.primary }}
          >
            {CREDIT_COST.QUALITY_GENERATION} 크레딧
          </p>
        </div>
      </div>

      {/* 크레딧 묶음 구매 */}
      <div className="mb-10">
        <h2
          className="text-2xl font-bold mb-6"
          style={{ color: TOSS_COLORS.text }}
        >
          크레딧 구매
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CREDIT_BUNDLES.map((bundle) => (
            <CreditBundleCard
              key={bundle.id}
              bundle={bundle}
              onPurchase={handlePurchase}
            />
          ))}
        </div>
      </div>

      {/* 광고 - 중간 (무료 플랜만) */}
      {showAds && (
        <div className="my-10">
          <KakaoAdBanner />
        </div>
      )}

      {/* 사용 내역 */}
      <div>
        <h2
          className="text-2xl font-bold mb-6"
          style={{ color: TOSS_COLORS.text }}
        >
          사용 내역
        </h2>

        <Card className="p-6">
          <p
            className="text-center text-sm"
            style={{ color: TOSS_COLORS.textSecondary }}
          >
            아직 사용 내역이 없어요
          </p>
        </Card>
      </div>

      {/* 결제 채널 선택 다이얼로그 */}
      <Dialog open={isChannelDialogOpen} onOpenChange={setIsChannelDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>결제 방법을 선택해주세요</DialogTitle>
            <DialogDescription>
              {selectedBundle && (
                <span>
                  크레딧 {selectedBundle.credits}개 (₩
                  {selectedBundle.price.toLocaleString()})를 빠르고 안전하게 결제할 수 있어요
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6">
            {/* 토스페이 */}
            <button
              type="button"
              onClick={() => handlePaymentChannelSelect(PAYMENT_CHANNELS.TOSSPAY.key)}
              disabled={isLoading}
              className="relative h-24 rounded-xl border-2 border-transparent bg-gradient-to-br from-blue-50 to-blue-100 hover:border-blue-500 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">💳</span>
                <div className="text-left">
                  <div className="font-bold text-lg text-blue-700">토스페이</div>
                </div>
              </div>
            </button>

            {/* 카카오페이 (일반) */}
            <button
              type="button"
              onClick={() => handlePaymentChannelSelect(PAYMENT_CHANNELS.KAKAOPAY_ONETIME.key)}
              disabled={isLoading}
              className="relative h-24 rounded-xl border-2 border-transparent bg-gradient-to-br from-yellow-50 to-yellow-100 hover:border-yellow-500 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">💛</span>
                <div className="text-left">
                  <div className="font-bold text-lg text-yellow-800">카카오페이</div>
                </div>
              </div>
            </button>

            {/* 카카오페이 (정기) */}
            <button
              type="button"
              onClick={() => handlePaymentChannelSelect(PAYMENT_CHANNELS.KAKAOPAY_SUBSCRIPTION.key)}
              disabled={isLoading}
              className="relative h-24 rounded-xl border-2 border-transparent bg-gradient-to-br from-yellow-100 to-yellow-200 hover:border-yellow-600 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">🔄</span>
                <div className="text-left">
                  <div className="font-bold text-lg text-yellow-900">카카오페이</div>
                  <span className="text-xs px-2 py-0.5 bg-yellow-300 text-yellow-900 rounded-full font-semibold">
                    정기
                  </span>
                </div>
              </div>
            </button>

            {/* 이니시스 (일반) */}
            <button
              type="button"
              onClick={() => handlePaymentChannelSelect(PAYMENT_CHANNELS.INICIS_ONETIME.key)}
              disabled={isLoading}
              className="relative h-24 rounded-xl border-2 border-transparent bg-gradient-to-br from-gray-50 to-gray-100 hover:border-gray-500 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">🏦</span>
                <div className="text-left">
                  <div className="font-bold text-lg text-gray-700">이니시스</div>
                </div>
              </div>
            </button>

            {/* 이니시스 (정기) */}
            <button
              type="button"
              onClick={() => handlePaymentChannelSelect(PAYMENT_CHANNELS.INICIS_SUBSCRIPTION.key)}
              disabled={isLoading}
              className="relative h-24 rounded-xl border-2 border-transparent bg-gradient-to-br from-gray-100 to-gray-200 hover:border-gray-600 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">🔄</span>
                <div className="text-left">
                  <div className="font-bold text-lg text-gray-800">이니시스</div>
                  <span className="text-xs px-2 py-0.5 bg-gray-300 text-gray-800 rounded-full font-semibold">
                    정기
                  </span>
                </div>
              </div>
            </button>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsChannelDialogOpen(false)}
              disabled={isLoading}
            >
              취소
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 flex items-center gap-3">
            <Loader2
              className="animate-spin"
              size={24}
              style={{ color: TOSS_COLORS.primary }}
            />
            <span style={{ color: TOSS_COLORS.text }}>
              결제를 진행하고 있어요...
            </span>
          </Card>
        </div>
      )}
    </MaxWidthContainer>
  );
}

/**
 * 크레딧 묶음 카드 컴포넌트
 */
interface CreditBundleCardProps {
  bundle: typeof CREDIT_BUNDLES[0];
  onPurchase: (bundleId: string) => void;
}

function CreditBundleCard({ bundle, onPurchase }: CreditBundleCardProps) {
  const isRecommended = bundle.badge === '추천';

  return (
    <Card
      className="relative overflow-hidden transition-all hover:shadow-lg"
      style={{
        borderColor: isRecommended ? TOSS_COLORS.primary : TOSS_COLORS.muted,
        borderWidth: isRecommended ? '2px' : '1px',
      }}
    >
      {/* 추천 배지 */}
      {isRecommended && (
        <div
          className="absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-bl-lg"
          style={{
            backgroundColor: TOSS_COLORS.primary,
            color: '#FFFFFF',
          }}
        >
          {bundle.badge}
        </div>
      )}

      <div className="p-5">
        {/* 크레딧 아이콘 */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
          style={{
            backgroundColor: `${TOSS_COLORS.primary}15`,
          }}
        >
          <span className="text-2xl">💎</span>
        </div>

        {/* 크레딧 수 */}
        <h3
          className="text-2xl font-bold mb-1"
          style={{ color: TOSS_COLORS.text }}
        >
          {bundle.credits.toLocaleString()}
        </h3>
        <p
          className="text-sm mb-4"
          style={{ color: TOSS_COLORS.textSecondary }}
        >
          크레딧
        </p>

        {/* 가격 */}
        <div className="mb-4">
          <span
            className="text-2xl font-bold"
            style={{ color: TOSS_COLORS.primary }}
          >
            ₩{bundle.price.toLocaleString()}
          </span>
        </div>

        {/* 구매 버튼 */}
        <Button
          className="w-full"
          onClick={() => onPurchase(bundle.id)}
          style={{
            backgroundColor: isRecommended ? TOSS_COLORS.primary : undefined,
            color: isRecommended ? '#FFFFFF' : undefined,
          }}
          variant={isRecommended ? 'default' : 'outline'}
        >
          구매해요
        </Button>
      </div>
    </Card>
  );
}
