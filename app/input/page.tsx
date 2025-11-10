'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePresentationStore } from '@/store/presentationStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { useCreditStore } from '@/store/creditStore';
import { TEMPLATE_EXAMPLES, COLOR_PRESETS } from '@/constants/design';
import { RESEARCH_MODE_CONFIG, type ResearchMode } from '@/types/research';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import KakaoAd from '@/components/ads/KakaoAd';
import KakaoAdBanner from '@/components/ads/KakaoAdBanner';
import KakaoAdMobileThin from '@/components/ads/KakaoAdMobileThin';
import KakaoAdMobileThick from '@/components/ads/KakaoAdMobileThick';

export default function InputPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const {
    generatePresentation,
    isGenerating,
    generationStep,
    generationError,
    clearError,
    selectedColorPresetId,
    setSelectedColorPreset,
    researchMode,
    setResearchMode,
    useProContentModel,
    setUseProContentModel
  } = usePresentationStore();

  const { plan, isActive } = useSubscriptionStore();
  const { totalCredits, isFirstTimeFree, getCreditCost } = useCreditStore();

  const [text, setText] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentModalType, setPaymentModalType] = useState<'pro' | 'deep' | null>(null);

  const isPremiumUser = (plan === 'pro' || plan === 'premium') && isActive();

  // 로그인 체크
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/input');
    }
  }, [status, router]);

  // 로딩 상태 표시
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

  const handleQualityClick = (usePro: boolean) => {
    if (!usePro) {
      setUseProContentModel(false);
      return;
    }

    const isFirstFree = isFirstTimeFree('qualityGeneration');
    const hasCredit = totalCredits >= getCreditCost('qualityGeneration');

    if (isFirstFree || hasCredit) {
      setUseProContentModel(true);
    } else {
      setPaymentModalType('pro');
      setShowPaymentModal(true);
    }
  };

  const handleResearchClick = (mode: ResearchMode) => {
    if (mode !== 'deep') {
      setResearchMode(mode);
      return;
    }

    const isFirstFree = isFirstTimeFree('deepResearch');
    const hasCredit = totalCredits >= getCreditCost('deepResearch');

    if (isFirstFree || hasCredit) {
      setResearchMode(mode);
    } else {
      setPaymentModalType('deep');
      setShowPaymentModal(true);
    }
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      alert('텍스트를 입력해주세요.');
      return;
    }

    await generatePresentation(text);
    router.push('/viewer');
  };

  const handleTemplateClick = (example: string) => {
    setText(example);
  };

  return (
    <div className="min-h-screen bg-white pb-32 md:pb-36">
      <MaxWidthContainer className="py-8 px-4 relative">
        {/* 페이지 헤더 */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            프리젠테이션 만들기
          </h1>
          <p className="text-base text-gray-600">
            내용을 입력하면 AI가 자동으로 슬라이드를 생성해요
          </p>
        </div>

        {/* 2-Column 레이아웃 */}
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 lg:items-start">
          {/* 왼쪽: 옵션 패널 */}
          <div className="space-y-4">
            {/* 크래딧 잔액 */}
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-blue-700">💳 보유 크래딧</span>
                {isPremiumUser && (
                  <span className="text-xs text-blue-600">Pro 플랜</span>
                )}
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {totalCredits} 크래딧
              </div>
              {isPremiumUser && (
                <p className="text-xs text-blue-600 mt-1">
                  매월 490 크래딧 제공
                </p>
              )}
            </Card>

            {/* 슬라이드 생성 제한 */}
            <Card
              className={`p-4 ${
                plan === 'free'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900 mb-1">
                    📄 슬라이드 생성 제한
                  </div>
                  <p className="text-xs text-gray-600">
                    {plan === 'free' && '무료 플랜은 한번 생성에 최대 10장까지 만들 수 있어요'}
                    {plan === 'pro' && 'Pro 플랜은 한번 생성에 최대 20장까지 만들 수 있어요'}
                    {plan === 'premium' && 'Premium 플랜은 한번 생성에 최대 50장까지 만들 수 있어요'}
                  </p>

                  {/* 크래딧 사용 시 혜택 안내 */}
                  {plan === 'free' && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-yellow-300">
                      <div className="flex items-start gap-2">
                        <span className="text-base">💡</span>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-yellow-800 mb-1">
                            크래딧으로 더 많이 생성해요
                          </p>
                          <p className="text-xs text-gray-600">
                            고품질 생성(50 크래딧)을 선택하면 슬라이드 제한 없이 원하는 만큼 생성할 수 있어요
                          </p>
                          <Button
                            onClick={() => router.push('/credits')}
                            size="sm"
                            variant="outline"
                            className="mt-2 h-7 text-xs"
                          >
                            크레딧 구매 →
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {plan === 'free' && (
                  <Button
                    onClick={() => router.push('/subscription')}
                    size="sm"
                    variant="default"
                  >
                    업그레이드
                  </Button>
                )}
              </div>
            </Card>

            {/* 모바일 굵은 광고 (320x100) - md 미만에서만 표시 */}
            <div className="md:hidden">
              <KakaoAdMobileThick />
            </div>

            {/* 색상 테마 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                🎨 색상 테마
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {COLOR_PRESETS.slice(0, 6).map((preset) => {
                  const isSelected = selectedColorPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedColorPreset(preset.id)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ background: preset.primary }}
                        />
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ background: preset.secondary }}
                        />
                      </div>
                      <div className="text-xs font-semibold text-gray-900">
                        {preset.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 자료 조사 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                🔍 자료 조사
              </h3>
              <div className="space-y-2">
                {(Object.keys(RESEARCH_MODE_CONFIG) as ResearchMode[]).map((mode) => {
                  const config = RESEARCH_MODE_CONFIG[mode];
                  const isSelected = researchMode === mode;
                  const price = config.price;

                  let priceLabel = '';
                  if (price === 0) {
                    priceLabel = '무료';
                  } else if (mode === 'deep') {
                    const isFirstFree = isFirstTimeFree('deepResearch');
                    const creditCost = getCreditCost('deepResearch');
                    const hasCredit = totalCredits >= creditCost;

                    if (isFirstFree) {
                      priceLabel = '🎁 최초 1회 무료';
                    } else if (hasCredit) {
                      priceLabel = `${creditCost} 크래딧`;
                    } else {
                      priceLabel = `${creditCost} 크래딧 필요`;
                    }
                  } else {
                    priceLabel = `+₩${price.toLocaleString()}`;
                  }

                  return (
                    <button
                      key={mode}
                      onClick={() => handleResearchClick(mode)}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900">
                          {config.label}
                        </span>
                        <span className="text-xs font-semibold text-blue-600">
                          {priceLabel}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {config.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 생성 품질 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                🤖 생성 품질
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleQualityClick(false)}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    !useProContentModel
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">
                      ⚡ 빠른 생성
                    </span>
                    <span className="text-xs font-semibold text-green-600">
                      무료
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    빠르고 경제적이에요
                  </p>
                </button>

                <button
                  onClick={() => handleQualityClick(true)}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    useProContentModel
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">
                      ✨ 고품질 생성
                    </span>
                    <span className="text-xs font-semibold text-blue-600">
                      {(() => {
                        const isFirstFree = isFirstTimeFree('qualityGeneration');
                        const creditCost = getCreditCost('qualityGeneration');
                        const hasCredit = totalCredits >= creditCost;

                        if (isFirstFree) {
                          return '🎁 최초 1회 무료';
                        } else if (hasCredit) {
                          return `${creditCost} 크래딧`;
                        } else {
                          return `${creditCost} 크래딧 필요`;
                        }
                      })()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    더 나은 품질이에요
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* 중앙: 텍스트 입력 */}
          <div className="flex flex-col gap-4 h-full">
            {/* 텍스트 입력 */}
            <Card className="p-6 flex flex-col flex-1">
              {/* 템플릿 예시 (카드 내부 상단) */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    📄 템플릿 예시
                  </h3>
                  <span className="text-xs text-gray-500">
                    클릭하면 내용이 자동으로 입력돼요
                  </span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {TEMPLATE_EXAMPLES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateClick(template.example)}
                      className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      {template.title}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={`프리젠테이션 내용을 입력하세요...\n\n예시:\n우리 회사 소개 프리젠테이션을 만들어주세요.\n\n제목: 혁신적인 핀테크 기업\n\n회사 미션:\n- 금융 서비스의 디지털 혁신\n- 모두를 위한 쉬운 금융\n\n주요 서비스:\n1. 간편 송금 서비스\n2. 자산 관리 플랫폼\n\n감사합니다.`}
                className="w-full flex-1 p-4 text-gray-900 bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* 에러 메시지 */}
              {generationError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{generationError}</p>
                  <button
                    onClick={clearError}
                    className="mt-2 text-xs text-red-600 underline"
                  >
                    닫기
                  </button>
                </div>
              )}

              {/* 생성 버튼 */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !text.trim()}
                className="w-full mt-4 h-14 text-lg font-bold"
              >
                {isGenerating ? '생성하고 있어요' : '✨ 슬라이드 생성해요'}
              </Button>
            </Card>
          </div>
        </div>

        {/* 오른쪽 여백에 세로 광고 (절대 위치) */}
        <div className="hidden xl:block fixed right-4 top-24 z-30">
          <KakaoAd />
        </div>
      </MaxWidthContainer>

      {/* 로딩 모달 */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-8 max-w-md w-full mx-4 bg-white shadow-2xl">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 border-8 border-blue-600 border-t-transparent rounded-full animate-spin" />

              <h3 className="text-xl font-bold text-gray-900 mb-3">
                슬라이드를 작성하고 있어요
              </h3>

              <p className="text-gray-600 mb-2">
                페이지를 벗어나면 생성이 중단돼요.<br />
                잠시만 기다려 주세요.
              </p>

              <p className="text-xs text-gray-500 mb-6">
                페이지 이탈 시 사용된 크래딧은 환불되지 않아요.
              </p>

              <div className="text-sm text-gray-600">
                {researchMode !== 'none' && (
                  <div>
                    {generationStep === 'parsing' && '1️⃣ 자료 조사 → 2️⃣ 콘텐츠 생성 → 3️⃣ 구조 파싱 → 4️⃣ 슬라이드 생성'}
                    {generationStep === 'generating' && '✅ 자료 조사 → ✅ 콘텐츠 생성 → ✅ 구조 파싱 → 🔄 슬라이드 생성 중'}
                  </div>
                )}
                {researchMode === 'none' && (
                  <div>
                    {generationStep === 'parsing' && '1️⃣ 콘텐츠 생성 → 2️⃣ 구조 파싱 → 3️⃣ 슬라이드 생성'}
                    {generationStep === 'generating' && '✅ 콘텐츠 생성 → ✅ 구조 파싱 → 🔄 슬라이드 생성 중'}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 결제 안내 모달 */}
      {showPaymentModal && (
        <div
          onClick={() => setShowPaymentModal(false)}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <Card
            onClick={(e) => e.stopPropagation()}
            className="p-6 max-w-md w-full mx-4 bg-white shadow-2xl"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {paymentModalType === 'pro' ? '고품질 생성' : '깊은 조사'} 사용 안내
            </h3>

            <p className="text-gray-600 mb-4">
              {paymentModalType === 'pro'
                ? '고품질 생성을 사용하려면 크래딧이 필요해요. (50 크래딧)'
                : '깊은 조사를 사용하려면 크래딧이 필요해요. (40 크래딧)'}
              <br /><br />
              Pro 구독 시 매월 490 크래딧을 받을 수 있어요.
            </p>

            <div className="p-4 bg-gray-50 rounded-lg mb-4 space-y-3">
              <div>
                <div className="font-semibold text-gray-900">옵션 1: Pro 구독 (₩4,900/월)</div>
                <p className="text-sm text-gray-600">• 광고 제거 + 매월 490 크래딧 제공</p>
              </div>
              <div>
                <div className="font-semibold text-gray-900">옵션 2: 크레딧 구매</div>
                <p className="text-sm text-gray-600">• 100 크래딧: ₩1,000 / 500 크래딧: ₩5,000</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => router.push('/subscription')}
                className="flex-1"
              >
                구독하기
              </Button>
              <Button
                onClick={() => router.push('/credits')}
                variant="outline"
                className="flex-1"
              >
                크레딧 구매
              </Button>
            </div>

            <button
              onClick={() => setShowPaymentModal(false)}
              className="w-full mt-2 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              취소
            </button>
          </Card>
        </div>
      )}

      {/* 하단 고정 가로 배너 광고 - 데스크톱 */}
      <div className="fixed bottom-0 left-0 right-0 z-40 hidden md:block">
        <KakaoAdBanner />
      </div>

      {/* 하단 고정 얇은 광고 - 모바일 */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
        <KakaoAdMobileThin />
      </div>
    </div>
  );
}
