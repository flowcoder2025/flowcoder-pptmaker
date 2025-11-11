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
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { usePortOnePayment, PAYMENT_CHANNELS } from '@/hooks/usePortOnePayment';
import { PLAN_BENEFITS } from '@/constants/subscription';
import { TOSS_COLORS } from '@/constants/design';
import { Check, X, Star, Sparkles, Loader2 } from 'lucide-react';
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
  const { requestPayment, isLoading, error, clearError } = usePortOnePayment();

  const [isChannelDialogOpen, setIsChannelDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

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
  const handleSubscribe = (planId: SubscriptionPlan) => {
    if (planId === 'free') {
      alert('무료 플랜이에요!');
      return;
    }

    // 결제 채널 선택 다이얼로그 열기
    setSelectedPlan(planId);
    setIsChannelDialogOpen(true);
  };

  // 결제 채널 선택 후 결제 진행
  const handlePaymentChannelSelect = async (channelKey: string) => {
    if (!selectedPlan || !session) return;

    const planInfo = PLAN_BENEFITS[selectedPlan];

    try {
      clearError();
      setIsChannelDialogOpen(false);

      const result = await requestPayment({
        purpose: 'SUBSCRIPTION_UPGRADE',
        amount: planInfo.price,
        orderName: `${planInfo.name} 구독 (1개월)`,
        channelKey,
        subscriptionId: undefined, // TODO: API에서 생성된 subscription ID 전달
      });

      if (result.success && result.payment) {
        // 성공: 결제 결과 페이지로 이동
        await fetchSubscription();
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
      setSelectedPlan(null);
    }
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
        <h1
          className="text-3xl lg:text-4xl font-bold mb-3"
          style={{ color: TOSS_COLORS.text }}
        >
          플랜을 선택해주세요
        </h1>
        <p
          className="text-base lg:text-lg"
          style={{ color: TOSS_COLORS.textSecondary }}
        >
          필요한 기능에 맞는 플랜을 골라보세요
        </p>
      </div>

      {/* 현재 플랜 섹션 */}
      <div
        className="rounded-xl p-6 mb-10"
        style={{ backgroundColor: TOSS_COLORS.surface }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2
              className="text-lg font-bold mb-1"
              style={{ color: TOSS_COLORS.text }}
            >
              현재 플랜
            </h2>
            <div className="flex items-center gap-2">
              <span
                className="text-2xl font-bold"
                style={{ color: TOSS_COLORS.primary }}
              >
                {PLAN_BENEFITS[currentPlan].name}
              </span>
              {currentPlan !== 'free' && isSubscriptionActive && (
                <span
                  className="text-sm px-2 py-1 rounded"
                  style={{
                    backgroundColor: `${TOSS_COLORS.success}20`,
                    color: TOSS_COLORS.success,
                  }}
                >
                  활성
                </span>
              )}
            </div>
            {currentPlan !== 'free' && expiresAt && (
              <p
                className="text-sm mt-1"
                style={{ color: TOSS_COLORS.textSecondary }}
              >
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
              구독 취소해요
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
        <p
          className="text-sm"
          style={{ color: TOSS_COLORS.textSecondary }}
        >
          결제 및 구독 관련 문의는{' '}
          <button
            className="underline"
            onClick={() => alert('문의 기능 준비 중이에요!')}
            style={{ color: TOSS_COLORS.primary }}
          >
            고객센터
          </button>
          로 연락해주세요
        </p>
      </div>

      {/* 결제 채널 선택 다이얼로그 */}
      <Dialog open={isChannelDialogOpen} onOpenChange={setIsChannelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>결제 방법을 선택해주세요</DialogTitle>
            <DialogDescription>
              원하시는 결제 수단으로 안전하게 결제할 수 있어요
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {Object.entries(PAYMENT_CHANNELS).map(([key, channel]) => (
              <Button
                key={key}
                variant="outline"
                className="w-full justify-start text-left h-auto py-4"
                onClick={() => handlePaymentChannelSelect(channel.key)}
                disabled={isLoading}
              >
                <div>
                  <div
                    className="font-semibold mb-1"
                    style={{ color: TOSS_COLORS.text }}
                  >
                    {channel.name}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: TOSS_COLORS.textSecondary }}
                  >
                    {channel.pgProvider} • {channel.mid}
                  </div>
                </div>
              </Button>
            ))}
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
      className="relative overflow-hidden transition-all hover:shadow-lg"
      style={{
        borderColor: current
          ? TOSS_COLORS.primary
          : TOSS_COLORS.muted,
        borderWidth: current ? '2px' : '1px',
      }}
    >
      {/* 추천 배지 */}
      {recommended && !comingSoon && (
        <div
          className="absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-bl-lg"
          style={{
            backgroundColor: TOSS_COLORS.primary,
            color: '#FFFFFF',
          }}
        >
          추천
        </div>
      )}

      {/* 출시 예정 배지 */}
      {comingSoon && (
        <div
          className="absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-bl-lg"
          style={{
            backgroundColor: TOSS_COLORS.textSecondary,
            color: '#FFFFFF',
          }}
        >
          출시 예정
        </div>
      )}

      {/* 현재 플랜 배지 */}
      {current && !comingSoon && (
        <div
          className="absolute top-0 left-0 px-3 py-1 text-xs font-bold rounded-br-lg"
          style={{
            backgroundColor: TOSS_COLORS.success,
            color: '#FFFFFF',
          }}
        >
          현재 플랜
        </div>
      )}

      <div className="p-6">
        {/* 아이콘 및 플랜명 */}
        <div className="mb-4">
          <Icon
            className="mb-2"
            size={32}
            style={{ color: plan === 'free' ? TOSS_COLORS.textSecondary : TOSS_COLORS.primary }}
          />
          <h3
            className="text-2xl font-bold mb-1"
            style={{ color: TOSS_COLORS.text }}
          >
            {info.name}
          </h3>
          <div className="flex items-baseline gap-1">
            {comingSoon ? (
              <span
                className="text-xl font-semibold"
                style={{ color: TOSS_COLORS.textSecondary }}
              >
                출시 예정
              </span>
            ) : (
              <>
                <span
                  className="text-3xl font-bold"
                  style={{ color: TOSS_COLORS.primary }}
                >
                  {info.price === 0 ? '무료' : `₩${info.price.toLocaleString()}`}
                </span>
                {info.price > 0 && (
                  <span
                    className="text-sm"
                    style={{ color: TOSS_COLORS.textSecondary }}
                  >
                    / 월
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* 구분선 */}
        <div
          className="h-px mb-4"
          style={{ backgroundColor: TOSS_COLORS.muted }}
        />

        {/* 특징 목록 */}
        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check
                size={20}
                className="flex-shrink-0 mt-0.5"
                style={{ color: TOSS_COLORS.primary }}
              />
              <span
                className="text-sm"
                style={{ color: TOSS_COLORS.text }}
              >
                {feature}
              </span>
            </li>
          ))}
        </ul>

        {/* 구독 버튼 */}
        <Button
          className="w-full"
          variant={current || comingSoon ? 'outline' : 'default'}
          disabled={current || comingSoon}
          onClick={() => onSubscribe(plan)}
          style={
            current || comingSoon
              ? {}
              : {
                  backgroundColor: TOSS_COLORS.primary,
                  color: '#FFFFFF',
                }
          }
        >
          {comingSoon
            ? '출시 알림 받기'
            : current
            ? '사용하고 있어요'
            : plan === 'free'
            ? '무료로 시작해요'
            : '구독해요'}
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
      <h2
        className="text-2xl font-bold text-center mb-6"
        style={{ color: TOSS_COLORS.text }}
      >
        플랜 비교표
      </h2>

      {/* 데스크톱: 테이블 형태 */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ backgroundColor: TOSS_COLORS.surface }}>
              <th
                className="p-4 text-left font-semibold"
                style={{ color: TOSS_COLORS.text }}
              >
                기능
              </th>
              <th
                className="p-4 text-center font-semibold"
                style={{ color: TOSS_COLORS.text }}
              >
                무료
              </th>
              <th
                className="p-4 text-center font-semibold"
                style={{ color: TOSS_COLORS.primary }}
              >
                Pro
              </th>
              <th
                className="p-4 text-center font-semibold"
                style={{ color: TOSS_COLORS.textSecondary }}
              >
                Premium
              </th>
            </tr>
          </thead>
          <tbody>
            {comparisonFeatures.map((feature, index) => (
              <tr
                key={feature.name}
                style={{
                  backgroundColor: index % 2 === 0 ? '#FFFFFF' : TOSS_COLORS.surface,
                  borderBottom: `1px solid ${TOSS_COLORS.muted}`,
                }}
              >
                <td
                  className="p-4 font-medium"
                  style={{ color: TOSS_COLORS.text }}
                >
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
              className="text-lg font-bold mb-3"
              style={{
                color: plan === 'pro' ? TOSS_COLORS.primary : TOSS_COLORS.text,
              }}
            >
              {plan === 'free' ? '무료' : plan === 'pro' ? 'Pro' : 'Premium'}
              {plan === 'premium' && (
                <span
                  className="ml-2 text-xs font-normal"
                  style={{ color: TOSS_COLORS.textSecondary }}
                >
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
                  <span
                    className="text-sm"
                    style={{ color: TOSS_COLORS.textSecondary }}
                  >
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
        <Check size={20} style={{ color: TOSS_COLORS.primary, margin: '0 auto' }} />
      ) : (
        <X size={20} style={{ color: TOSS_COLORS.textSecondary, margin: '0 auto' }} />
      );
    }

    if (value === 'show') {
      return (
        <span style={{ color: TOSS_COLORS.textSecondary }}>표시</span>
      );
    }

    if (value === 'hide') {
      return (
        <span style={{ color: TOSS_COLORS.primary }}>제거</span>
      );
    }

    return (
      <span style={{ color: TOSS_COLORS.text }}>{value}</span>
    );
  }
}
