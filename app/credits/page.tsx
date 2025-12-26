'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import { useCreditStore } from '@/store/creditStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { usePortOnePayment, PAYMENT_CHANNELS } from '@/hooks/usePortOnePayment';
import { PLAN_BENEFITS, hasUnlimitedGeneration } from '@/constants/subscription';
import { CREDIT_BUNDLES, CREDIT_COST } from '@/constants/credits';
import { BUTTON_TEXT } from '@/lib/text-config';
import { Coins, Sparkles, TrendingUp, Loader2, Gift, Gem, Infinity, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import KakaoAdBanner from '@/components/ads/KakaoAdBanner';
import KakaoAdMobileThick from '@/components/ads/KakaoAdMobileThick';
import PaymentTestBanner from '@/components/PaymentTestBanner';

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
  const { totalCredits, isFirstTimeFree, fetchBalance } = useCreditStore();
  const { plan } = useSubscriptionStore();
  const { requestPayment, isLoading, clearError } = usePortOnePayment();

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
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground text-lg">불러오고 있어요...</p>
      </div>
    );
  }

  // 미로그인 시 리다이렉트 중
  if (!session) {
    return null;
  }

  // 크레딧 구매 처리 - 카카오페이로 바로 결제
  const handlePurchase = async (bundleId: string) => {
    const bundle = CREDIT_BUNDLES.find((b) => b.id === bundleId);
    if (!bundle || !session) return;

    setSelectedBundle(bundle);

    try {
      clearError();

      const result = await requestPayment({
        purpose: 'CREDIT_PURCHASE',
        amount: bundle.price,
        orderName: `크레딧 ${bundle.credits}개 구매`,
        channelKey: PAYMENT_CHANNELS.KAKAOPAY_ONETIME.key,
        creditAmount: bundle.credits,
      });

      if (result.success && result.payment) {
        await fetchBalance();
        router.push(`/payments/result?success=true&paymentId=${result.payment.id}`);
      } else {
        const errorMsg = result.error || '결제에 실패했어요';

        if (errorMsg.includes('결제 시스템 준비 중')) {
          toast.error(errorMsg);
        } else {
          router.push(`/payments/result?success=false&error=${encodeURIComponent(errorMsg)}`);
        }
      }
    } catch (err) {
      logger.error('결제 중 오류', err);
      const errorMsg = err instanceof Error ? err.message : '결제 처리 중 문제가 발생했어요';

      if (errorMsg.includes('결제 시스템 준비 중')) {
        toast.error(errorMsg);
      } else {
        router.push(`/payments/result?success=false&error=${encodeURIComponent(errorMsg)}`);
      }
    } finally {
      setSelectedBundle(null);
    }
  };

  return (
    <MaxWidthContainer className="py-8 lg:py-12">
      {/* 결제 테스트 안내 배너 */}
      <PaymentTestBanner />

      {/* 광고 - 상단 (무료 플랜만) */}
      {showAds && (
        <div className="mb-8">
          <KakaoAdMobileThick />
        </div>
      )}

      {/* 페이지 헤더 */}
      <div className="text-center mb-10">
        <h1 className="text-3xl lg:text-4xl font-bold mb-3 text-foreground">
          크레딧 관리
        </h1>
        <p className="text-base lg:text-lg text-muted-foreground">
          크레딧으로 고품질 생성과 심층 검색을 이용해보세요
        </p>
      </div>

      {/* 잔액 카드 (대형) */}
      <div className="rounded-2xl p-8 mb-10 relative overflow-hidden bg-gradient-to-br from-primary to-blue-600">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Coins size={24} className="text-white" />
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

          {/* Pro/Premium 무제한 안내 */}
          {hasUnlimitedGeneration(plan) && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white/20 text-white">
              <Infinity className="w-4 h-4" />
              심층검색 · 고품질 생성 무제한
            </div>
          )}

          {/* 최초 무료 안내 */}
          {!hasUnlimitedGeneration(plan) && (isFirstTimeFree('deepResearch') || isFirstTimeFree('qualityGeneration')) && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white/20 text-white">
              <Gift className="w-4 h-4" />
              최초 1회 무료로 사용해보세요!
            </div>
          )}
        </div>

        {/* 배경 장식 */}
        <div className="absolute top-0 right-0 opacity-10">
          <Gem className="w-48 h-48 text-white" />
        </div>
      </div>

      {/* 크레딧 사용량 안내 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <div className="rounded-xl p-5 bg-secondary">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={20} className="text-primary" />
            <h3 className="font-bold text-foreground">
              심층 검색
            </h3>
          </div>
          <p className="text-sm mb-1 text-muted-foreground">
            검색 전용 AI로 웹 자료를 조사해요
          </p>
          {hasUnlimitedGeneration(plan) ? (
            <div className="flex items-center gap-2 text-2xl font-bold text-primary">
              <Infinity size={24} />
              무제한
            </div>
          ) : (
            <p className="text-2xl font-bold text-primary">
              {CREDIT_COST.DEEP_RESEARCH} 크레딧
            </p>
          )}
        </div>

        <div className="rounded-xl p-5 bg-secondary">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={20} className="text-primary" />
            <h3 className="font-bold text-foreground">
              고품질 생성
            </h3>
          </div>
          <p className="text-sm mb-1 text-muted-foreground">
            추론 모델로 더 나은 품질을 제공해요
          </p>
          {hasUnlimitedGeneration(plan) ? (
            <div className="flex items-center gap-2 text-2xl font-bold text-primary">
              <Infinity size={24} />
              무제한
            </div>
          ) : (
            <p className="text-2xl font-bold text-primary">
              {CREDIT_COST.QUALITY_GENERATION} 크레딧
            </p>
          )}
        </div>

        {/* 초과 슬라이드 - Pro 플랜 전용 */}
        <div className="rounded-xl p-5 bg-secondary">
          <div className="flex items-center gap-2 mb-2">
            <Layers size={20} className="text-primary" />
            <h3 className="font-bold text-foreground">
              초과 슬라이드
            </h3>
          </div>
          <p className="text-sm mb-1 text-muted-foreground">
            Pro 플랜 20장 초과 시 추가 비용
          </p>
          <p className="text-2xl font-bold text-primary">
            {CREDIT_COST.EXTRA_SLIDE} 크레딧/장
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Pro 플랜: 최대 50장까지 생성 가능
          </p>
        </div>
      </div>

      {/* 크레딧 묶음 구매 */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-6 text-foreground">
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

      {/* 사용 내역 보기 버튼 */}
      <div className="my-10">
        <Card className="p-6 bg-secondary/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-2 text-foreground">
                사용 내역 확인하기
              </h3>
              <p className="text-sm text-muted-foreground">
                크레딧 사용 내역과 결제 내역을 확인하세요
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/usage')}
              className="whitespace-nowrap"
            >
              사용 내역 보기 →
            </Button>
          </div>
        </Card>
      </div>

      {/* 광고 - 하단 (무료 플랜만) */}
      {showAds && (
        <div className="mt-10">
          <KakaoAdBanner />
        </div>
      )}

      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 flex items-center gap-3">
            <Loader2
              className="animate-spin text-primary"
              size={24}
            />
            <span className="text-foreground">
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
      className={`relative overflow-hidden transition-all hover:shadow-lg ${
        isRecommended ? 'border-primary border-2' : 'border-border'
      }`}
    >
      {/* 추천 배지 */}
      {isRecommended && (
        <div className="absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-bl-lg bg-primary text-white">
          {bundle.badge}
        </div>
      )}

      <div className="p-5">
        {/* 크레딧 아이콘 */}
        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-primary/[0.15]">
          <Gem className="w-6 h-6 text-primary" />
        </div>

        {/* 크레딧 수 */}
        <h3 className="text-2xl font-bold mb-1 text-foreground">
          {bundle.credits.toLocaleString()}
        </h3>
        <p className="text-sm mb-4 text-muted-foreground">
          크레딧
        </p>

        {/* 가격 */}
        <div className="mb-4">
          <span className="text-2xl font-bold text-primary">
            ₩{bundle.price.toLocaleString()}
          </span>
        </div>

        {/* 구매 버튼 */}
        <Button
          className={`w-full ${isRecommended ? 'bg-primary text-white' : ''}`}
          onClick={() => onPurchase(bundle.id)}
          variant={isRecommended ? 'default' : 'outline'}
        >
          {BUTTON_TEXT.purchaseCredits}
        </Button>
      </div>
    </Card>
  );
}
