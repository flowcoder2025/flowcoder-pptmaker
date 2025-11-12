'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { PLAN_BENEFITS } from '@/constants/subscription';
import { User, Mail, Calendar, CreditCard, FileText, Star } from 'lucide-react';
import { toast } from 'sonner';
import KakaoAdBanner from '@/components/ads/KakaoAdBanner';
import KakaoAdMobileThick from '@/components/ads/KakaoAdMobileThick';
import { BUTTON_TEXT } from '@/lib/text-config';

/**
 * 유저 프로필 페이지
 *
 * @description
 * 사용자 정보, 구독 현황, 크레딧 잔액, 프리젠테이션 통계를 표시합니다.
 * TDS 스타일 디자인을 적용했습니다.
 */
export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { plan } = useSubscriptionStore();

  // 광고 표시 여부 결정 (유료 플랜은 광고 제거)
  const showAds = !PLAN_BENEFITS[plan].benefits.adFree;

  const [stats, setStats] = useState({
    presentationsCount: 0,
    totalSlides: 0,
    creditsBalance: 0,
    creditsUsed: 0,
    subscriptionTier: 'FREE',
    recentPresentations: [] as any[],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      fetchUserStats();
    }
  }, [status, session, router]);

  const fetchUserStats = async () => {
    try {
      const res = await fetch('/api/user/stats');

      if (!res.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await res.json();
      setStats({
        presentationsCount: data.presentationsCount || 0,
        totalSlides: data.totalSlides || 0,
        creditsBalance: data.creditsBalance || 0,
        creditsUsed: data.creditsUsed || 0,
        subscriptionTier: data.subscriptionTier || 'FREE',
        recentPresentations: data.recentPresentations || [],
      });
    } catch (error) {
      console.error('사용자 통계 조회 실패:', error);
      toast.error('정보를 불러오는 중 문제가 발생했어요');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">불러오고 있어요...</p>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <MaxWidthContainer className="py-8 lg:py-12">
        {/* 광고 - 상단 (무료 플랜만) */}
        {showAds && (
          <div className="mb-8">
            <KakaoAdMobileThick />
          </div>
        )}

        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-foreground">
            프로필
          </h1>
          <p className="text-base lg:text-lg text-muted-foreground">
            계정 정보와 사용 현황을 확인해요
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 프로필 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 기본 정보 */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 text-foreground">
                <User className="inline mr-2" size={24} />
                기본 정보
              </h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-foreground">
                    이름
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={session.user.name || ''}
                    disabled
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-foreground">
                    <Mail className="inline mr-1" size={16} />
                    이메일
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={session.user.email || ''}
                    disabled
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="createdAt" className="text-foreground">
                    <Calendar className="inline mr-1" size={16} />
                    가입일
                  </Label>
                  <Input
                    id="createdAt"
                    type="text"
                    value={new Date().toLocaleDateString('ko-KR')}
                    disabled
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => toast.info('프로필 수정 기능 준비 중이에요')}
                >
                  {BUTTON_TEXT.editProfile}
                </Button>
              </div>
            </Card>

            {/* 최근 프리젠테이션 */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">
                  <FileText className="inline mr-2" size={24} />
                  최근 프리젠테이션
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/history')}
                  className="text-primary"
                >
                  전체 보기 →
                </Button>
              </div>

              {stats.recentPresentations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="mb-4">아직 생성한 프리젠테이션이 없어요</p>
                  <Button
                    onClick={() => router.push('/input')}
                    className="bg-primary text-white"
                  >
                    ✨ 첫 프리젠테이션 만들기
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentPresentations.map((presentation: any) => (
                    <div
                      key={presentation.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/viewer?id=${presentation.id}`)}
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1 text-foreground">
                          {presentation.title}
                        </h4>
                        {presentation.description && (
                          <p className="text-sm line-clamp-1 text-muted-foreground">
                            {presentation.description}
                          </p>
                        )}
                        <p className="text-xs mt-1 text-muted-foreground">
                          {new Date(presentation.updatedAt).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-primary">
                        {presentation.metadata?.slideCount || 0}슬라이드
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* 오른쪽: 통계 카드 */}
          <div className="space-y-6">
            {/* 구독 플랜 */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4 text-foreground">
                <Star className="inline mr-2" size={20} />
                구독 플랜
              </h3>

              <div className="text-center p-4 rounded-lg mb-4 bg-primary/[0.15]">
                <p className="text-2xl font-bold text-primary">
                  {stats.subscriptionTier === 'FREE' ? '무료' :
                   stats.subscriptionTier === 'PRO' ? 'Pro' : 'Premium'}
                </p>
                <p className="text-sm mt-1 text-muted-foreground">
                  {stats.subscriptionTier === 'FREE' ? '현재 플랜' : '활성 구독'}
                </p>
              </div>

              <Button
                className="w-full"
                variant="outline"
                onClick={() => router.push('/subscription')}
              >
                {BUTTON_TEXT.changePlan}
              </Button>
            </Card>

            {/* 크레딧 잔액 */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4 text-foreground">
                <CreditCard className="inline mr-2" size={20} />
                크레딧
              </h3>

              <div className="text-center p-4 rounded-lg mb-4 bg-gradient-to-br from-primary to-blue-600">
                <p className="text-3xl font-bold text-white">
                  {stats.creditsBalance.toLocaleString()}
                </p>
                <p className="text-sm mt-1 text-white opacity-80">
                  보유 크레딧
                </p>
              </div>

              <Button
                className="w-full"
                variant="outline"
                onClick={() => router.push('/credits')}
              >
                {BUTTON_TEXT.purchaseCredits}
              </Button>
            </Card>

            {/* 통계 */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4 text-foreground">
                📊 사용 통계
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    생성한 프리젠테이션
                  </span>
                  <span className="font-bold text-foreground">
                    {stats.presentationsCount}개
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    총 슬라이드
                  </span>
                  <span className="font-bold text-foreground">
                    {stats.totalSlides}개
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    사용한 크레딧
                  </span>
                  <span className="font-bold text-foreground">
                    {stats.creditsUsed.toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* 광고 - 하단 (무료 플랜만) */}
        {showAds && (
          <div className="mt-10">
            <KakaoAdBanner />
          </div>
        )}
      </MaxWidthContainer>
    </div>
  );
}
