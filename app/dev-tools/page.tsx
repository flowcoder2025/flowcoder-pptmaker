'use client';

import { useRouter } from 'next/navigation';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { useCreditStore } from '@/store/creditStore';
import { useState, useEffect } from 'react';
import KakaoAdBanner from '@/components/ads/KakaoAdBanner';
import KakaoAdMobileThick from '@/components/ads/KakaoAdMobileThick';

/**
 * 개발자 도구 페이지 (크래딧 시스템 v4.0)
 *
 * @description
 * 개발 환경에서 결제 없이 구독/크레딧을 테스트할 수 있는 페이지
 * 프로덕션에서는 접근 불가능하도록 설정 필요
 */
export default function DevToolsPage() {
  const router = useRouter();
  const subscription = useSubscriptionStore();
  const credit = useCreditStore();
  const [message, setMessage] = useState('');
  const [mounted, setMounted] = useState(false);

  // Hydration 에러 방지: 클라이언트에서만 스토어 값 렌더링
  useEffect(() => {
    setMounted(true);
  }, []);

  // 개발 환경 체크
  const isDev = process.env.NODE_ENV === 'development';

  if (!isDev) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5">
        <div className="text-center text-red-600">
          <h1>접근 불가</h1>
          <p>이 페이지는 개발 환경에서만 사용할 수 있어요.</p>
        </div>
      </div>
    );
  }

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  // Pro 구독 활성화 (30일) + 월간 크래딧 제공
  const handleActivatePro = () => {
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30일 후
    subscription.setPlan('pro', expiresAt, 'dev-subscription-id');
    subscription.provideMonthlyCredits();
    showMessage('Pro 구독을 활성화했어요! (30일 + 490 크래딧)');
  };

  // Premium 구독 활성화 (30일) + 월간 크래딧 제공
  const handleActivatePremium = () => {
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30일 후
    subscription.setPlan('premium', expiresAt, 'dev-subscription-id');
    subscription.provideMonthlyCredits();
    showMessage('Premium 구독을 활성화했어요! (30일 + 490 크래딧)');
  };

  // 무료 플랜으로 변경
  const handleSetFree = () => {
    subscription.setPlan('free', null);
    showMessage('무료 플랜으로 변경했어요.');
  };

  // 크래딧 추가
  const handleAddCredits = (amount: number) => {
    credit.addCredits(amount);
    showMessage(`크래딧 ${amount}개를 추가했어요!`);
  };

  // 모든 크레딧 초기화
  const handleResetCredits = () => {
    credit.reset();
    showMessage('크레딧을 초기화했어요.');
  };

  // 최초 무료 사용 초기화 (다시 무료로 설정)
  const handleResetFirstTimeFree = () => {
    credit.reset();
    showMessage('최초 무료 사용 권한을 복구했어요.');
  };

  // 최초 무료 사용 소진
  const handleExhaustFirstTimeFree = () => {
    credit.useFirstTimeFree('deepResearch');
    credit.useFirstTimeFree('qualityGeneration');
    showMessage('최초 무료 사용 권한을 모두 소진했어요.');
  };

  // 월간 크래딧 제공
  const handleProvideMonthlyCredits = () => {
    subscription.provideMonthlyCredits();
    showMessage('월간 크래딧 490개를 제공했어요!');
  };

  // 전체 초기화
  const handleResetAll = () => {
    subscription.reset();
    credit.reset();
    showMessage('모든 데이터를 초기화했어요.');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFFFFF',
      padding: '20px',
    }}>
      {/* 헤더 */}
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground m-0">
          🛠️ 개발자 도구 (크래딧 시스템 v4.0)
        </h1>
        <button
          onClick={() => router.push('/')}
          className="py-2 px-4 text-sm text-foreground bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
        >
          홈으로
        </button>
      </div>

      {/* 광고 - 상단 */}
      <div style={{
        marginBottom: '20px',
        padding: '12px 0',
        display: 'flex',
        justifyContent: 'center',
        borderBottom: '1px solid #E5E7EB',
      }}>
        <KakaoAdMobileThick />
      </div>

      {/* 메시지 표시 */}
      {message && (
        <div style={{
          marginBottom: '20px',
          padding: '12px 16px',
          background: '#D1FAE5',
          borderRadius: '8px',
          color: '#065F46',
          fontSize: '14px',
          fontWeight: '500',
        }}>
          {message}
        </div>
      )}

      {/* 현재 상태 */}
      <div className="mb-8 p-5 bg-gray-50 rounded-xl border border-gray-200">
        <h2 className="text-lg font-bold text-foreground mb-4">
          📊 현재 상태
        </h2>
        {!mounted ? (
          <div className="text-center text-muted-foreground py-8">
            불러오고 있어요...
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                구독 플랜
              </div>
              <div className="text-base font-bold text-foreground">
                {subscription.plan === 'premium' ? 'Premium' : subscription.plan === 'pro' ? 'Pro' : '무료'}
                {(subscription.plan === 'pro' || subscription.plan === 'premium') && subscription.isActive() && (
                  <span className="text-xs font-normal ml-2">
                    ({subscription.getDaysRemaining()}일 남음)
                  </span>
                )}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                슬라이드 수 제한
              </div>
              <div className="text-base font-bold text-foreground">
                {subscription.getMaxSlides()}페이지
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                총 크래딧 잔액
              </div>
              <div className="text-xl font-bold text-primary">
                {credit.totalCredits} 크래딧
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                최초 무료: 심층 검색
              </div>
              <div className="text-base font-bold text-foreground">
                {credit.isFirstTimeFree('deepResearch') ? '✅ 사용 가능' : '❌ 사용함'}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                최초 무료: 고품질 생성
              </div>
              <div className="text-base font-bold text-foreground">
                {credit.isFirstTimeFree('qualityGeneration') ? '✅ 사용 가능' : '❌ 사용함'}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                월간 크래딧 제공 여부
              </div>
              <div className="text-base font-bold text-foreground">
                {subscription.monthlyCreditsProvided ? '✅ 제공됨' : '❌ 미제공'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 구독 관리 */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-foreground mb-3">
          🎯 구독 관리
        </h2>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleActivatePro}
            className="py-3 px-5 text-sm font-bold text-white bg-primary border-none rounded-lg cursor-pointer hover:opacity-90"
          >
            Pro 구독 활성화 (30일 + 490 크래딧)
          </button>
          <button
            onClick={handleActivatePremium}
            className="py-3 px-5 text-sm font-bold text-white bg-secondary border-none rounded-lg cursor-pointer hover:opacity-90"
          >
            Premium 구독 활성화 (30일 + 490 크래딧)
          </button>
          <button
            onClick={handleSetFree}
            className="py-3 px-5 text-sm font-bold text-foreground bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
          >
            무료 플랜으로 변경
          </button>
          <button
            onClick={handleProvideMonthlyCredits}
            className="py-3 px-5 text-sm font-bold text-primary bg-white border border-primary rounded-lg cursor-pointer hover:bg-blue-50"
          >
            월간 크래딧 제공 (490개)
          </button>
        </div>
      </div>

      {/* 크레딧 관리 */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-foreground mb-3">
          💳 크래딧 관리
        </h2>
        <div className="mb-4">
          <h3 className="text-sm text-muted-foreground mb-2">
            크래딧 추가
          </h3>
          <div className="flex gap-2 flex-wrap">
            {[10, 50, 100, 490, 1000].map((amount) => (
              <button
                key={amount}
                onClick={() => handleAddCredits(amount)}
                className="py-2 px-4 text-sm text-primary bg-white border border-primary rounded-md cursor-pointer hover:bg-blue-50"
              >
                +{amount}개
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={handleResetCredits}
          className="py-2 px-4 text-sm text-red-600 bg-white border border-red-600 rounded-md cursor-pointer hover:bg-red-50"
        >
          크레딧 초기화
        </button>
      </div>

      {/* 최초 무료 사용 관리 */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-foreground mb-3">
          🎁 최초 무료 사용 관리
        </h2>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleResetFirstTimeFree}
            className="py-3 px-5 text-sm font-bold text-primary bg-white border border-primary rounded-lg cursor-pointer hover:bg-blue-50"
          >
            최초 무료 권한 복구
          </button>
          <button
            onClick={handleExhaustFirstTimeFree}
            className="py-3 px-5 text-sm font-bold text-red-600 bg-white border border-red-600 rounded-lg cursor-pointer hover:bg-red-50"
          >
            최초 무료 권한 소진
          </button>
        </div>
      </div>

      {/* 전체 초기화 */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-foreground mb-3">
          🔄 전체 초기화
        </h2>
        <button
          onClick={() => {
            if (confirm('모든 데이터를 초기화하시겠어요?')) {
              handleResetAll();
            }
          }}
          className="py-3 px-5 text-sm font-bold text-white bg-red-600 border-none rounded-lg cursor-pointer hover:bg-red-700"
        >
          모든 데이터 초기화
        </button>
      </div>

      {/* 테스트 시나리오 */}
      <div style={{
        padding: '20px',
        background: '#FEF3C7',
        borderRadius: '12px',
        border: '1px solid #FCD34D',
      }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#92400E',
          marginBottom: '12px',
        }}>
          💡 테스트 시나리오 (크래딧 시스템 v4.0)
        </h2>
        <ul style={{
          fontSize: '14px',
          color: '#92400E',
          lineHeight: '1.8',
          margin: 0,
          paddingLeft: '20px',
        }}>
          <li><strong>무료 사용자 테스트</strong>: &ldquo;무료 플랜으로 변경&rdquo; 클릭 → 최초 무료 권한 복구</li>
          <li><strong>Pro 구독자 테스트</strong>: &ldquo;Pro 구독 활성화&rdquo; 클릭 → 490 크래딧 자동 제공됨</li>
          <li><strong>크래딧 보유자 테스트</strong>: 크래딧 추가 (+100) → input 페이지에서 사용</li>
          <li><strong>최초 무료 테스트</strong>: 최초 무료 권한 복구 → input 페이지에서 &ldquo;🎁 최초 1회 무료&rdquo; 확인</li>
          <li><strong>크래딧 부족 테스트</strong>: 크래딧 초기화 + 최초 무료 소진 → 결제 모달 확인</li>
          <li><strong>월간 크래딧 제공 테스트</strong>: Pro 구독 → &ldquo;월간 크래딧 제공&rdquo; 버튼 클릭 → 490 크래딧 추가</li>
        </ul>
      </div>

      {/* 광고 - 하단 */}
      <div style={{
        marginTop: '30px',
        padding: '12px 0',
        display: 'flex',
        justifyContent: 'center',
        borderTop: '1px solid #E5E7EB',
      }}>
        <KakaoAdBanner />
      </div>
    </div>
  );
}
