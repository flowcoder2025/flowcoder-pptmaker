'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import { TOSS_COLORS } from '@/constants/design';
import KakaoAd from '@/components/ads/KakaoAd';
import KakaoAdBanner from '@/components/ads/KakaoAdBanner';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen" style={{ backgroundColor: TOSS_COLORS.background }}>
      {/* Hero Section */}
      <MaxWidthContainer className="pt-16 sm:pt-24 lg:pt-32">
        <div className="text-center space-y-6">
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight"
            style={{ color: TOSS_COLORS.text }}
          >
            AI가 만들어주는{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(135deg, ${TOSS_COLORS.primary} 0%, ${TOSS_COLORS.secondary} 100%)`,
              }}
            >
              간편한 프리젠테이션
            </span>
          </h1>

          <p
            className="text-lg sm:text-xl max-w-2xl mx-auto"
            style={{ color: TOSS_COLORS.textSecondary }}
          >
            텍스트만 입력하면 AI가 자동으로 슬라이드를 생성해요.<br />
            98% 비용 절감, 무제한 편집, 21개 슬라이드 타입 지원
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              onClick={() => router.push('/input')}
              size="lg"
              className="text-lg px-8 py-6 h-auto"
              style={{
                backgroundColor: TOSS_COLORS.primary,
                color: '#FFFFFF',
              }}
            >
              ✨ 무료로 시작해요
            </Button>
            <Button
              onClick={() => router.push('/subscription')}
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 h-auto"
            >
              요금제 보기
            </Button>
          </div>
        </div>
      </MaxWidthContainer>

      {/* Features Section */}
      <MaxWidthContainer className="py-16 sm:py-20 lg:py-24">
        <h2
          className="text-3xl sm:text-4xl font-bold text-center mb-12"
          style={{ color: TOSS_COLORS.text }}
        >
          왜 'FlowCoder가 만든 PPT Maker'인가요?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <Card
            className="p-8 text-center hover:shadow-lg transition-shadow"
            style={{ borderColor: TOSS_COLORS.muted }}
          >
            <div className="text-5xl mb-4">🤖</div>
            <h3
              className="text-xl font-semibold mb-3"
              style={{ color: TOSS_COLORS.text }}
            >
              AI 자동 생성
            </h3>
            <p style={{ color: TOSS_COLORS.textSecondary }}>
              최적의 Gen AI로<br />
              비용 없이 고품질 슬라이드를<br />
              생성해요
            </p>
          </Card>

          {/* Feature 2 */}
          <Card
            className="p-8 text-center hover:shadow-lg transition-shadow"
            style={{ borderColor: TOSS_COLORS.muted }}
          >
            <div className="text-5xl mb-4">✏️</div>
            <h3
              className="text-xl font-semibold mb-3"
              style={{ color: TOSS_COLORS.text }}
            >
              무제한 편집
            </h3>
            <p style={{ color: TOSS_COLORS.textSecondary }}>
              클라이언트 템플릿 엔진으로<br />
              추가 비용 없이<br />
              무한 편집해요
            </p>
          </Card>

          {/* Feature 3 */}
          <Card
            className="p-8 text-center hover:shadow-lg transition-shadow"
            style={{ borderColor: TOSS_COLORS.muted }}
          >
            <div className="text-5xl mb-4">🎨</div>
            <h3
              className="text-xl font-semibold mb-3"
              style={{ color: TOSS_COLORS.text }}
            >
              다양한 템플릿
            </h3>
            <p style={{ color: TOSS_COLORS.textSecondary }}>
              21개 슬라이드 타입과<br />
              7개 색상 프리셋으로<br />
              원하는 스타일을 선택해요
            </p>
          </Card>
        </div>
      </MaxWidthContainer>

      {/* How It Works Section */}
      <div style={{ backgroundColor: TOSS_COLORS.surface }}>
        <MaxWidthContainer className="py-16 sm:py-20 lg:py-24">
          <h2
            className="text-3xl sm:text-4xl font-bold text-center mb-12"
            style={{ color: TOSS_COLORS.text }}
          >
            사용 방법
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', icon: '📝', title: '텍스트 입력', desc: '프리젠테이션 내용을 입력해요' },
              { step: '2', icon: '🔍', title: '자료 조사', desc: 'AI가 자동으로 조사해요 (선택)' },
              { step: '3', icon: '⚡', title: 'AI 생성', desc: '슬라이드를 자동 생성해요' },
              { step: '4', icon: '💾', title: '저장·공유', desc: 'PDF/PPTX로 다운로드해요' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-6xl mb-4">{item.icon}</div>
                <div
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full text-white font-bold mb-3"
                  style={{ backgroundColor: TOSS_COLORS.primary }}
                >
                  {item.step}
                </div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: TOSS_COLORS.text }}
                >
                  {item.title}
                </h3>
                <p className="text-sm" style={{ color: TOSS_COLORS.textSecondary }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </MaxWidthContainer>
      </div>

      {/* CTA Section */}
      <MaxWidthContainer className="py-16 sm:py-20 lg:py-24 text-center relative">
        <h2
          className="text-3xl sm:text-4xl font-bold mb-6"
          style={{ color: TOSS_COLORS.text }}
        >
          지금 바로 시작해보세요
        </h2>
        <p
          className="text-lg mb-8"
          style={{ color: TOSS_COLORS.textSecondary }}
        >
          무료 플랜으로 시작해서 원하는 프리젠테이션을 만들어요
        </p>
        <Button
          onClick={() => router.push('/input')}
          size="lg"
          className="text-lg px-12 py-6 h-auto"
          style={{
            backgroundColor: TOSS_COLORS.primary,
            color: '#FFFFFF',
          }}
        >
          무료로 시작하기 →
        </Button>

        {/* 오른쪽 여백에 세로 광고 (절대 위치) */}
        <div className="hidden xl:block fixed right-4 top-24 z-30">
          <KakaoAd />
        </div>
      </MaxWidthContainer>

      {/* 하단 고정 가로 배너 광고 */}
      <div className="fixed bottom-0 left-0 right-0 z-40 hidden md:block">
        <KakaoAdBanner />
      </div>
    </div>
  );
}
