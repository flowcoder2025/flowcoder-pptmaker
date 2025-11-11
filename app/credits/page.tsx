'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import { useCreditStore } from '@/store/creditStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { PLAN_BENEFITS } from '@/constants/subscription';
import { CREDIT_BUNDLES, CREDIT_COST } from '@/constants/credits';
import { BUTTON_TEXT } from '@/lib/text-config';
import { Coins, Sparkles, TrendingUp } from 'lucide-react';
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
  const handlePurchase = async (bundleId: string, amount: number) => {
    // TODO: API 연동
    alert(`${amount} 크레딧 구매 준비 중이에요!`);
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

          {/* 최초 무료 안내 */}
          {(isFirstTimeFree('deepResearch') || isFirstTimeFree('qualityGeneration')) && (
            <div className="inline-block px-4 py-2 rounded-lg text-sm font-semibold bg-white/20 text-white">
              🎁 최초 1회 무료로 사용해보세요!
            </div>
          )}
        </div>

        {/* 배경 장식 */}
        <div className="absolute top-0 right-0 opacity-10 text-[200px] leading-none text-white">
          💎
        </div>
      </div>

      {/* 크레딧 사용량 안내 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
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
          <p className="text-2xl font-bold text-primary">
            {CREDIT_COST.DEEP_RESEARCH} 크레딧
          </p>
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
          <p className="text-2xl font-bold text-primary">
            {CREDIT_COST.QUALITY_GENERATION} 크레딧
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

      {/* 광고 - 중간 (무료 플랜만) */}
      {showAds && (
        <div className="my-10">
          <KakaoAdBanner />
        </div>
      )}

      {/* 사용 내역 */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-foreground">
          사용 내역
        </h2>

        <Card className="p-6">
          <p className="text-center text-sm text-muted-foreground">
            아직 사용 내역이 없어요
          </p>
        </Card>
      </div>
    </MaxWidthContainer>
  );
}

/**
 * 크레딧 묶음 카드 컴포넌트
 */
interface CreditBundleCardProps {
  bundle: typeof CREDIT_BUNDLES[0];
  onPurchase: (bundleId: string, amount: number) => void;
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
          <span className="text-2xl">💎</span>
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
          onClick={() => onPurchase(bundle.id, bundle.credits)}
          variant={isRecommended ? 'default' : 'outline'}
        >
          {BUTTON_TEXT.purchaseCredits}
        </Button>
      </div>
    </Card>
  );
}
