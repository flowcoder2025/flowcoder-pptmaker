/**
 * 프리미엄 업그레이드 버튼 컴포넌트
 *
 * 슬라이드를 Gemini 3.0 Flash로 고품질 업그레이드하는 버튼
 * history, viewer, editor 페이지에서 공통으로 사용
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Sparkles, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { usePresentationStore } from '@/store/presentationStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { HTMLSlide } from '@/types/slide';

interface PremiumUpgradeButtonProps {
  presentationId: string;
  slides: HTMLSlide[];
  onUpgradeComplete?: (upgradedSlides: HTMLSlide[]) => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  showLabel?: boolean;
  disabled?: boolean;
  alreadyUpgraded?: boolean;
  className?: string;
}

interface UpgradeInfo {
  slideCount: number;
  requiredCredits: number;
  currentCredits: number;
  canUpgrade: boolean;
  alreadyUpgraded: boolean;
  estimatedCostKRW: number;
}

export default function PremiumUpgradeButton({
  presentationId,
  slides,
  onUpgradeComplete,
  variant = 'outline',
  size = 'default',
  showLabel = true,
  disabled = false,
  alreadyUpgraded = false,
  className,
}: PremiumUpgradeButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeInfo, setUpgradeInfo] = useState<UpgradeInfo | null>(null);
  const [upgradeResult, setUpgradeResult] = useState<{
    success: boolean;
    message: string;
    stats?: {
      slideCount: number;
      creditsUsed: number;
      remainingCredits: number;
      estimatedCostKRW: number;
    };
  } | null>(null);

  const { setCurrentPresentation, currentPresentation } = usePresentationStore();

  // 업그레이드 정보 조회
  const fetchUpgradeInfo = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/presentations/${presentationId}/premium-upgrade`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '정보를 불러오지 못했어요.');
      }

      setUpgradeInfo(data);
    } catch (error) {
      console.error('프리미엄 업그레이드 정보 조회 실패:', error);
      toast.error('정보를 불러오지 못했어요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 다이얼로그 열기
  const handleOpenDialog = async () => {
    setIsDialogOpen(true);
    setUpgradeResult(null);
    await fetchUpgradeInfo();
  };

  // 프리미엄 업그레이드 실행
  const handleUpgrade = async () => {
    if (!upgradeInfo?.canUpgrade) return;

    setIsUpgrading(true);
    try {
      // HTMLSlide[]를 HTML 문자열 배열로 변환 (html + css 결합)
      const slideHtmlStrings = slides.map(slide => {
        if (typeof slide === 'string') {
          return slide; // 이미 문자열인 경우
        }
        // HTMLSlide인 경우 html과 css를 결합
        const css = slide.css ? `<style>${slide.css}</style>` : '';
        return css + slide.html;
      });

      const response = await fetch(`/api/presentations/${presentationId}/premium-upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slides: slideHtmlStrings }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '업그레이드에 실패했어요.');
      }

      setUpgradeResult({
        success: true,
        message: data.message,
        stats: data.stats,
      });

      // 업그레이드된 슬라이드를 HTMLSlide 형식으로 변환
      const upgradedSlides: HTMLSlide[] = (data.upgradedSlides as string[]).map(html => ({
        html,
        css: '', // 업그레이드된 HTML에는 inline style이 포함됨
      }));

      // 업그레이드된 슬라이드로 상태 업데이트
      if (data.upgradedSlides && onUpgradeComplete) {
        onUpgradeComplete(upgradedSlides);
      }

      // 현재 프레젠테이션 상태 업데이트
      if (currentPresentation) {
        setCurrentPresentation({
          ...currentPresentation,
          slides: upgradedSlides,
        });
      }

      toast.success('프리미엄 업그레이드가 완료되었어요!');
    } catch (error) {
      console.error('프리미엄 업그레이드 실패:', error);
      setUpgradeResult({
        success: false,
        message: error instanceof Error ? error.message : '업그레이드에 실패했어요.',
      });
      toast.error(error instanceof Error ? error.message : '업그레이드에 실패했어요.');
    } finally {
      setIsUpgrading(false);
    }
  };

  // 다이얼로그 닫기
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setUpgradeResult(null);
    setUpgradeInfo(null);
  };

  if (alreadyUpgraded) {
    return (
      <Button
        variant="ghost"
        size={size}
        disabled
        className={cn("flex items-center gap-2 text-green-600", className)}
      >
        <CheckCircle size={18} strokeWidth={2} />
        {showLabel && '업그레이드 완료'}
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={handleOpenDialog}
        variant={variant}
        size={size}
        disabled={disabled}
        className={cn(
          "flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 border-0",
          className
        )}
      >
        <Sparkles size={18} strokeWidth={2} />
        {showLabel && '프리미엄 업그레이드'}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              프리미엄 업그레이드
            </DialogTitle>
            <DialogDescription>
              AI가 슬라이드의 디자인 품질을 향상시켜요.
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          ) : upgradeResult ? (
            // 업그레이드 결과 표시
            <div className="py-4">
              {upgradeResult.success ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-6 w-6" />
                    <span className="font-medium">{upgradeResult.message}</span>
                  </div>
                  {upgradeResult.stats && (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">업그레이드 슬라이드</span>
                        <span className="font-medium">{upgradeResult.stats.slideCount}장</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">사용된 크레딧</span>
                        <span className="font-medium">{upgradeResult.stats.creditsUsed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">남은 크레딧</span>
                        <span className="font-medium">{upgradeResult.stats.remainingCredits}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-muted-foreground">예상 비용</span>
                        <span className="font-medium">~{upgradeResult.stats.estimatedCostKRW}원</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-6 w-6" />
                  <span>{upgradeResult.message}</span>
                </div>
              )}
            </div>
          ) : upgradeInfo ? (
            // 업그레이드 정보 표시
            <div className="py-4 space-y-4">
              {upgradeInfo.alreadyUpgraded ? (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-lg">
                  <CheckCircle className="h-5 w-5" />
                  <span>이미 프리미엄 업그레이드가 완료된 프레젠테이션이에요.</span>
                </div>
              ) : (
                <>
                  <div className="bg-purple-50 rounded-lg p-4 space-y-3">
                    <h4 className="font-medium text-purple-900">업그레이드 내용</h4>
                    <ul className="text-sm text-purple-800 space-y-1">
                      <li>- CSS 스타일 정교화 (그림자, 그라데이션)</li>
                      <li>- 타이포그래피 최적화</li>
                      <li>- 이미지 레이아웃 개선</li>
                      <li>- 전문적인 디자인 요소 추가</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">슬라이드 수</span>
                      <span className="font-medium">{upgradeInfo.slideCount}장</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">필요 크레딧</span>
                      <span className="font-medium">{upgradeInfo.requiredCredits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">보유 크레딧</span>
                      <span className={`font-medium ${upgradeInfo.currentCredits < upgradeInfo.requiredCredits ? 'text-red-600' : ''}`}>
                        {upgradeInfo.currentCredits}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-muted-foreground">예상 비용</span>
                      <span className="font-medium">~{upgradeInfo.estimatedCostKRW}원</span>
                    </div>
                  </div>

                  {!upgradeInfo.canUpgrade && upgradeInfo.currentCredits < upgradeInfo.requiredCredits && (
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg text-sm">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>크레딧이 부족해요. 크레딧을 충전해주세요.</span>
                    </div>
                  )}

                  <div className="flex items-start gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>업그레이드 후에는 기존 슬라이드로 되돌릴 수 없어요. 편집이 필요하면 먼저 완료해주세요.</span>
                  </div>
                </>
              )}
            </div>
          ) : null}

          <DialogFooter className="gap-2 sm:gap-0">
            {upgradeResult?.success ? (
              <Button onClick={handleCloseDialog} variant="default">
                확인
              </Button>
            ) : (
              <>
                <Button onClick={handleCloseDialog} variant="outline">
                  취소
                </Button>
                <Button
                  onClick={handleUpgrade}
                  disabled={!upgradeInfo?.canUpgrade || isUpgrading || upgradeInfo?.alreadyUpgraded}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {isUpgrading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      업그레이드 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      업그레이드 시작
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
