'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { PLAN_BENEFITS } from '@/constants/subscription';
import { BUTTON_TEXT } from '@/lib/text-config';
import { Check, X, Star, Sparkles } from 'lucide-react';
import type { SubscriptionPlan } from '@/types/monetization';
import KakaoAdBanner from '@/components/ads/KakaoAdBanner';
import KakaoAdMobileThick from '@/components/ads/KakaoAdMobileThick';

/**
 * 구독 관리 페이지
 *
 * @description
 * TDS 스타일로 디자인된 구독 플랜 선택 및 관리 페이지입니다.
 * Free/Pro/Premium 3단 요금제를 제공합니다.
 */
export default function SubscriptionPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const {
    plan: currentPlan,
    expiresAt,
    getDaysRemaining,
    isActive,
    fetchSubscription,
  } = useSubscriptionStore();

  const daysRemaining = getDaysRemaining();
  const isSubscriptionActive = isActive();

  // 광고 표시 여부 결정 (유료 플랜은 광고 제거)
  const showAds = !PLAN_BENEFITS[currentPlan].benefits.adFree;

  // 로그인 체크
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/subscription');
    }
  }, [status, router]);

  // 사용자 데이터 로드
  useEffect(() => {
    if (status === 'authenticated' && session) {
      fetchSubscription();
    }
  }, [status, session, fetchSubscription]);

  // 로딩 상태
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">불러오고 있어요...</p>
      </div>
    );
  }

  // 미로그인 상태면 빈 화면 (리다이렉트 중)
  if (!session) {
    return null;
  }

  // 구독 처리
  const handleSubscribe = async (planId: SubscriptionPlan) => {
    if (planId === 'free') {
      alert('무료 플랜이에요!');
      return;
    }

    // TODO: API 연동
    alert(`${planId} 플랜 구독 준비 중이에요!`);
  };

  return (
    <MaxWidthContainer className="py-8 lg:py-12">
      {/* 광고 - 상단 (무료 플랜만 표시) */}
      {showAds && (
        <div className="mb-8">
          <KakaoAdMobileThick />
        </div>
      )}

      {/* 페이지 헤더 */}
      <div className="text-center mb-10">
        <h1 className="text-3xl lg:text-4xl font-bold mb-3 text-foreground">
          플랜을 선택해주세요
        </h1>
        <p className="text-base lg:text-lg text-muted-foreground">
          필요한 기능에 맞는 플랜을 골라보세요
        </p>
      </div>

      {/* 현재 플랜 섹션 */}
      <div className="rounded-xl p-6 mb-10 bg-secondary">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-bold mb-1 text-foreground">
              현재 플랜
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">
                {PLAN_BENEFITS[currentPlan].name}
              </span>
              {currentPlan !== 'free' && isSubscriptionActive && (
                <span className="text-sm px-2 py-1 rounded bg-green-500/20 text-green-600">
                  활성
                </span>
              )}
            </div>
            {currentPlan !== 'free' && expiresAt && (
              <p className="text-sm mt-1 text-muted-foreground">
                {daysRemaining > 0
                  ? `${daysRemaining}일 남았어요`
                  : '만료됐어요'}
              </p>
            )}
          </div>

          {currentPlan !== 'free' && (
            <Button
              variant="outline"
              onClick={() => {
                if (confirm('구독을 취소할까요?')) {
                  // TODO: API 연동
                  alert('구독 취소 준비 중이에요!');
                }
              }}
            >
              구독 취소
            </Button>
          )}
        </div>
      </div>

      {/* 플랜 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {/* Free 플랜 */}
        <PlanCard
          plan="free"
          current={currentPlan === 'free'}
          onSubscribe={handleSubscribe}
        />

        {/* Pro 플랜 (추천) */}
        <PlanCard
          plan="pro"
          current={currentPlan === 'pro'}
          recommended
          onSubscribe={handleSubscribe}
        />

        {/* Premium 플랜 */}
        <PlanCard
          plan="premium"
          current={currentPlan === 'premium'}
          comingSoon
          onSubscribe={handleSubscribe}
        />
      </div>

      {/* 플랜 비교표 */}
      <PlanComparisonTable />

      {/* 광고 - 하단 (무료 플랜만 표시) */}
      {showAds && (
        <div className="my-10">
          <KakaoAdBanner />
        </div>
      )}

      {/* FAQ 또는 추가 정보 */}
      <div className="text-center mt-10">
        <p className="text-sm text-muted-foreground">
          결제 및 구독 관련 문의는{' '}
          <button
            className="underline text-primary"
            onClick={() => alert('문의 기능 준비 중이에요!')}
          >
            고객센터
          </button>
          로 연락해주세요
        </p>
      </div>
    </MaxWidthContainer>
  );
}

/**
 * 플랜 카드 컴포넌트
 */
interface PlanCardProps {
  plan: SubscriptionPlan;
  current?: boolean;
  recommended?: boolean;
  comingSoon?: boolean;
  onSubscribe: (plan: SubscriptionPlan) => void;
}

function PlanCard({ plan, current, recommended, comingSoon, onSubscribe }: PlanCardProps) {
  const info = PLAN_BENEFITS[plan];

  // 플랜별 아이콘
  const Icon = plan === 'free' ? Star : plan === 'pro' ? Sparkles : Sparkles;

  // 특징 목록
  const features = [
    `슬라이드 ${info.benefits.maxSlides}페이지`,
    info.benefits.adFree ? '광고 제거' : '광고 시청 필요',
    info.benefits.hasWatermark ? '워터마크 표시' : '워터마크 제거',
    comingSoon
      ? '월간 크레딧 미정'
      : info.benefits.monthlyCredits > 0
      ? `월 ${info.benefits.monthlyCredits} 크레딧`
      : '크레딧 별도 구매',
    comingSoon
      ? '프리미엄 템플릿 미정'
      : info.benefits.premiumTemplates === 'unlimited'
      ? '프리미엄 템플릿 무제한'
      : '기본 템플릿만 사용',
  ];

  return (
    <Card
      className={`relative overflow-hidden transition-all hover:shadow-lg ${
        current ? 'border-primary border-2' : 'border-border'
      }`}
    >
      {/* 추천 배지 */}
      {recommended && !comingSoon && (
        <div className="absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-bl-lg bg-primary text-white">
          추천
        </div>
      )}

      {/* 출시 예정 배지 */}
      {comingSoon && (
        <div className="absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-bl-lg bg-muted-foreground text-white">
          출시 예정
        </div>
      )}

      {/* 현재 플랜 배지 */}
      {current && !comingSoon && (
        <div className="absolute top-0 left-0 px-3 py-1 text-xs font-bold rounded-br-lg bg-green-600 text-white">
          현재 플랜
        </div>
      )}

      <div className="p-6">
        {/* 아이콘 및 플랜명 */}
        <div className="mb-4">
          <Icon
            className={`mb-2 ${plan === 'free' ? 'text-muted-foreground' : 'text-primary'}`}
            size={32}
          />
          <h3 className="text-2xl font-bold mb-1 text-foreground">
            {info.name}
          </h3>
          <div className="flex items-baseline gap-1">
            {comingSoon ? (
              <span className="text-xl font-semibold text-muted-foreground">
                출시 예정
              </span>
            ) : (
              <>
                <span className="text-3xl font-bold text-primary">
                  {info.price === 0 ? '무료' : `₩${info.price.toLocaleString()}`}
                </span>
                {info.price > 0 && (
                  <span className="text-sm text-muted-foreground">
                    / 월
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* 구분선 */}
        <div className="h-px mb-4 bg-border" />

        {/* 특징 목록 */}
        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check
                size={20}
                className="flex-shrink-0 mt-0.5 text-primary"
              />
              <span className="text-sm text-foreground">
                {feature}
              </span>
            </li>
          ))}
        </ul>

        {/* 구독 버튼 */}
        <Button
          className={`w-full ${recommended && !current && !comingSoon ? 'bg-primary text-white' : ''}`}
          variant={current || comingSoon || !recommended ? 'outline' : 'default'}
          disabled={current || comingSoon}
          onClick={() => onSubscribe(plan)}
        >
          {comingSoon
            ? '출시 알림 받기'
            : current
            ? '사용하고 있어요'
            : plan === 'free'
            ? BUTTON_TEXT.startFree
            : BUTTON_TEXT.subscribe}
        </Button>
      </div>
    </Card>
  );
}

/**
 * 플랜 비교표 컴포넌트
 */
function PlanComparisonTable() {
  // 비교 항목 정의
  const comparisonFeatures = [
    {
      name: '월 요금',
      free: '무료',
      pro: '₩4,900',
      premium: '출시 예정',
    },
    {
      name: '슬라이드 수',
      free: '10페이지',
      pro: '20페이지',
      premium: '50페이지',
    },
    {
      name: '워터마크',
      free: 'show',
      pro: 'hide',
      premium: 'hide',
    },
    {
      name: '광고 제거',
      free: false,
      pro: true,
      premium: true,
    },
    {
      name: '월간 크레딧',
      free: '0',
      pro: '490',
      premium: '미정',
    },
    {
      name: '건당 결제 할인',
      free: '-',
      pro: '20%',
      premium: '20%',
    },
    {
      name: '프리미엄 템플릿',
      free: false,
      pro: false,
      premium: true,
    },
  ];

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold text-center mb-6 text-foreground">
        플랜 비교표
      </h2>

      {/* 데스크톱: 테이블 형태 */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-secondary">
              <th className="p-4 text-left font-semibold text-foreground">
                기능
              </th>
              <th className="p-4 text-center font-semibold text-foreground">
                무료
              </th>
              <th className="p-4 text-center font-semibold text-primary">
                Pro
              </th>
              <th className="p-4 text-center font-semibold text-muted-foreground">
                Premium
              </th>
            </tr>
          </thead>
          <tbody>
            {comparisonFeatures.map((feature, index) => (
              <tr
                key={feature.name}
                className={`${index % 2 === 0 ? 'bg-white' : 'bg-secondary'} border-b border-border`}
              >
                <td className="p-4 font-medium text-foreground">
                  {feature.name}
                </td>
                <td className="p-4 text-center">
                  {renderFeatureValue(feature.free)}
                </td>
                <td className="p-4 text-center">
                  {renderFeatureValue(feature.pro)}
                </td>
                <td className="p-4 text-center">
                  {renderFeatureValue(feature.premium)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 모바일: 카드 형태 */}
      <div className="md:hidden space-y-4">
        {(['free', 'pro', 'premium'] as const).map((plan) => (
          <Card key={plan} className="p-4">
            <h3
              className={`text-lg font-bold mb-3 ${
                plan === 'pro' ? 'text-primary' : 'text-foreground'
              }`}
            >
              {plan === 'free' ? '무료' : plan === 'pro' ? 'Pro' : 'Premium'}
              {plan === 'premium' && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  (출시 예정)
                </span>
              )}
            </h3>
            <div className="space-y-2">
              {comparisonFeatures.map((feature) => (
                <div
                  key={feature.name}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-muted-foreground">
                    {feature.name}
                  </span>
                  <span className="text-sm font-medium">
                    {renderFeatureValue(feature[plan])}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  // 기능 값 렌더링 헬퍼 함수
  function renderFeatureValue(value: string | boolean) {
    if (typeof value === 'boolean') {
      return value ? (
        <Check size={20} className="text-primary mx-auto" />
      ) : (
        <X size={20} className="text-muted-foreground mx-auto" />
      );
    }

    if (value === 'show') {
      return <span className="text-muted-foreground">표시</span>;
    }

    if (value === 'hide') {
      return <span className="text-primary">제거</span>;
    }

    return <span className="text-foreground">{value}</span>;
  }
}
