'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { PLAN_BENEFITS } from '@/constants/subscription';
import { BUTTON_TEXT } from '@/lib/text-config';
import KakaoAd from '@/components/ads/KakaoAd';
import KakaoAdBanner from '@/components/ads/KakaoAdBanner';
import KakaoAdMobileThin from '@/components/ads/KakaoAdMobileThin';
import KakaoAdMobileThick from '@/components/ads/KakaoAdMobileThick';

export default function HomePage() {
  const router = useRouter();
  const { plan } = useSubscriptionStore();

  // 광고 표시 여부 결정 (유료 플랜은 광고 제거)
  const showAds = !PLAN_BENEFITS[plan].benefits.adFree;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <MaxWidthContainer className="pt-12 sm:pt-24 lg:pt-32">
        <div className="text-center space-y-4 px-4">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
            한줄로 만드는{' '}
            <span className="bg-gradient-to-br from-blue-500 to-gray-800 bg-clip-text text-transparent">
              간편한 프리젠테이션
            </span>
          </h1>

          <p className="text-base sm:text-xl max-w-2xl mx-auto text-muted-foreground">
            텍스트만 입력하면 AI가 자동으로 슬라이드를 생성해요.<br />
            98% 비용 절감, 무제한 편집, 21개 슬라이드 타입 지원
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              onClick={() => router.push('/input')}
              size="lg"
              className="min-w-[200px]"
            >
              ✨ {BUTTON_TEXT.startFree}
            </Button>
            <Button
              onClick={() => router.push('/subscription')}
              size="lg"
              variant="outline"
              className="min-w-[200px]"
            >
              {BUTTON_TEXT.viewPricing}
            </Button>
          </div>
        </div>
      </MaxWidthContainer>

      {/* Features Section */}
      <MaxWidthContainer className="py-12 sm:py-20 lg:py-24 px-4">
        <h2 className="text-2xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 text-foreground">
          FlowCoder가 만든 PPT Maker
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <Card className="p-8 text-center hover:shadow-lg transition-shadow border-border">
            <div className="text-5xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">
              AI 자동 생성
            </h3>
            <p className="text-muted-foreground">
              최적의 Gen AI로<br />
              비용 없이 고품질 슬라이드를<br />
              생성해요
            </p>
          </Card>

          {/* Feature 2 */}
          <Card className="p-8 text-center hover:shadow-lg transition-shadow border-border">
            <div className="text-5xl mb-4">✏️</div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">
              무제한 편집
            </h3>
            <p className="text-muted-foreground">
              클라이언트 템플릿 엔진으로<br />
              추가 비용 없이<br />
              무한 편집해요
            </p>
          </Card>

          {/* Feature 3 */}
          <Card className="p-8 text-center hover:shadow-lg transition-shadow border-border">
            <div className="text-5xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">
              다양한 템플릿
            </h3>
            <p className="text-muted-foreground">
              21개 슬라이드 타입과<br />
              7개 색상 프리셋으로<br />
              원하는 스타일을 선택해요
            </p>
          </Card>
        </div>
      </MaxWidthContainer>

      {/* 모바일 굵은 광고 (320x100) - md 미만에서만 표시, 무료 플랜만 */}
      {showAds && (
        <div className="md:hidden">
          <KakaoAdMobileThick />
        </div>
      )}

      {/* How It Works Section */}
      <div className="bg-secondary">
        <MaxWidthContainer className="py-12 sm:py-20 lg:py-24 px-4">
          <h2 className="text-2xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 text-foreground">
            사용 방법
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { step: '1', icon: '📝', title: '텍스트 입력', desc: '프리젠테이션 내용을 입력해요' },
              { step: '2', icon: '🔍', title: '자료 조사', desc: 'AI가 자동으로 조사해요 (선택)' },
              { step: '3', icon: '⚡', title: 'AI 생성', desc: '슬라이드를 자동 생성해요' },
              { step: '4', icon: '💾', title: '저장·공유', desc: 'PDF/PPTX로 다운로드해요' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-6xl mb-4">{item.icon}</div>
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-bold mb-3">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </MaxWidthContainer>
      </div>

      {/* CTA Section */}
      <MaxWidthContainer className="py-12 sm:py-20 lg:py-24 text-center relative px-4">
        <h2 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6 text-foreground">
          지금 바로 시작해보세요
        </h2>
        <p className="text-base sm:text-lg mb-6 sm:mb-8 text-muted-foreground">
          무료 플랜으로 시작해서 원하는 프리젠테이션을 만들어요
        </p>
        <Button
          onClick={() => router.push('/input')}
          size="lg"
          className="min-w-[200px]"
        >
          ✨ {BUTTON_TEXT.startFree}
        </Button>

        {/* 오른쪽 여백에 세로 광고 (절대 위치, 무료 플랜만) */}
        {showAds && (
          <div className="hidden xl:block fixed right-4 top-24 z-30">
            <KakaoAd />
          </div>
        )}
      </MaxWidthContainer>

      {/* 하단 고정 가로 배너 광고 - 데스크톱 (무료 플랜만) */}
      {showAds && (
        <div className="fixed bottom-0 left-0 right-0 z-40 hidden md:block">
          <KakaoAdBanner />
        </div>
      )}

      {/* 하단 고정 얇은 광고 - 모바일 (무료 플랜만) */}
      {showAds && (
        <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
          <KakaoAdMobileThin />
        </div>
      )}
    </div>
  );
}
