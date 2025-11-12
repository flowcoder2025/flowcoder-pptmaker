/**
 * Viewer 페이지
 * Phase 2: 프리젠테이션 뷰어 기능
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Save, Download, Share2, Edit, X, Loader2, FileCode, FileText, Presentation } from 'lucide-react';
import { usePresentationStore } from '@/store/presentationStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { PLAN_BENEFITS } from '@/constants/subscription';
import { downloadHTML, downloadPDF, downloadPPTX } from '@/utils/download';
import KakaoAdBanner from '@/components/ads/KakaoAdBanner';
import KakaoAdMobileThick from '@/components/ads/KakaoAdMobileThick';
import DownloadProgressModal from '@/components/DownloadProgressModal';

export default function ViewerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentPresentation, savePresentation, fetchPresentation } = usePresentationStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 다운로드 진행 상태 관리
  const [showDownloadProgress, setShowDownloadProgress] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<'downloading' | 'success' | 'error'>('downloading');
  const [downloadFormat, setDownloadFormat] = useState<'html' | 'pdf' | 'pptx'>('html');
  const [downloadError, setDownloadError] = useState<string>('');

  // URL에서 from 파라미터 추출 (어디서 왔는지)
  const from = searchParams.get('from') || 'input'; // 기본값: input

  // 최초 진입점 추출 (history, input 등)
  const origin = searchParams.get('origin') || 'input';

  // 워터마크 표시 여부 및 광고 표시 여부
  const { hasWatermark, plan } = useSubscriptionStore();
  const showAds = !PLAN_BENEFITS[plan].benefits.adFree;

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 뒤로가기/닫기: origin 우선, 없으면 from 파라미터에 따라 이전 페이지로 이동
  const handleClose = useCallback(() => {
    // origin이 있으면 최초 진입점으로 직접 이동
    if (origin === 'history') {
      router.push('/history');
    } else if (origin === 'input') {
      router.push('/input');
    } else if (from === 'history') {
      router.push('/history');
    } else if (from === 'editor') {
      // Editor로 돌아가기: id 파라미터 유지, origin도 함께 전달
      const id = currentPresentation?.id;
      const url = id ? `/editor?id=${id}&from=viewer&origin=${origin}` : `/editor?from=viewer&origin=${origin}`;
      router.push(url);
    } else {
      // from === 'input' 또는 기본값
      router.push('/input');
    }
  }, [origin, from, currentPresentation, router]);

  // URL 파라미터로부터 프리젠테이션 로드
  useEffect(() => {
    const id = searchParams.get('id');

    if (id) {
      // 히스토리 페이지에서 온 경우 - DB에서 로드
      setIsLoading(true);
      fetchPresentation(id)
        .then(() => {
          setIsLoading(false);
          setIsSaved(true); // DB에서 로드한 것이므로 이미 저장됨
        })
        .catch((error) => {
          console.error('프리젠테이션 로드 실패:', error);
          setIsLoading(false);
          router.push('/history');
        });
    } else if (!currentPresentation) {
      // id도 없고 currentPresentation도 없으면 input으로 이동
      router.push('/input');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // 키보드 단축키 지원
  useEffect(() => {
    if (!currentPresentation) return;

    const slides = currentPresentation.slides;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < slides.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else if (e.key === 'Escape') {
        // ESC 키: handleClose와 동일한 로직 사용
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, currentPresentation, router, from, handleClose]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground text-lg">불러오고 있어요...</p>
      </div>
    );
  }

  if (!currentPresentation) {
    return null;
  }

  const { slides } = currentPresentation;
  const currentSlide = slides[currentIndex];

  // HTML + CSS를 iframe에 삽입하기 위한 완전한 문서 생성
  const createSlideDocument = (html: string, css: string) => {
    // 워터마크 HTML (무료 플랜만)
    const watermarkHtml = hasWatermark() ? '<div class="watermark">PPT Maker</div>' : '';

    // 워터마크 CSS (무료 플랜만)
    const watermarkCss = hasWatermark() ? `
      .watermark {
        position: fixed;
        top: 20px;
        right: 20px;
        font-size: 14px;
        font-weight: 500;
        color: #8b95a1;
        opacity: 0.6;
        pointer-events: none;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }
    ` : '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <style>
            * {
              box-sizing: border-box;
            }
            html, body {
              margin: 0;
              padding: 0;
              overflow: hidden;
              width: 100%;
              height: 100%;
            }
            body {
              background: #f5f5f5;
            }
            .slide-container {
              width: 100%;
              height: 100%;
            }
            ${css}
            ${watermarkCss}
          </style>
        </head>
        <body>
          <div class="slide-container">
            ${html}
          </div>
          ${watermarkHtml}
        </body>
      </html>
    `;
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSave = async () => {
    try {
      await savePresentation();
      setIsSaved(true);
      alert('저장했어요!');
    } catch (error) {
      alert('저장하지 못했어요: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
    }
  };

  const handleShare = async () => {
    if (!currentPresentation) {
      alert('공유할 프리젠테이션이 없어요.');
      return;
    }

    // 웹 서비스에서는 Web Share API 사용
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentPresentation.title,
          text: `${currentPresentation.title} - PPT Maker로 제작`,
          url: window.location.href,
        });
        console.log('✅ 공유 완료');
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('공유 실패:', error);
          alert('공유하지 못했어요. 다시 시도해 주세요.');
        }
      }
    } else {
      // Web Share API 미지원 브라우저 - 링크 복사
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('링크를 복사했어요!');
      } catch (error) {
        console.error('링크 복사 실패:', error);
        alert('링크 복사에 실패했어요.');
      }
    }
  };

  const handleEdit = () => {
    if (currentPresentation?.slideData) {
      const id = currentPresentation.id;
      // viewerFrom 파라미터로 Viewer의 원래 진입점 전달, origin도 함께 전달
      const url = id
        ? `/editor?id=${id}&from=viewer&viewerFrom=${from}&origin=${origin}`
        : `/editor?from=viewer&viewerFrom=${from}&origin=${origin}`;
      router.push(url);
    } else {
      alert('편집할 수 없는 프리젠테이션이에요 (구 버전)');
    }
  };

  const handleDownload = async (format: 'html' | 'pdf' | 'pptx') => {
    if (!currentPresentation || isDownloading) return;

    setIsDownloading(true);

    // 모달 표시 - 다운로드 시작
    setDownloadFormat(format);
    setDownloadStatus('downloading');
    setShowDownloadProgress(true);

    try {
      // 웹 서비스에서는 광고 없이 다운로드 (향후 구독 모델로 제한 가능)
      console.log('✅ 다운로드 시작');

      // 다운로드 실행
      switch (format) {
        case 'html':
          await downloadHTML(currentPresentation);
          break;
        case 'pdf':
          await downloadPDF(currentPresentation);
          break;
        case 'pptx':
          await downloadPPTX(currentPresentation);
          break;
      }

      // 성공 상태로 업데이트
      setDownloadStatus('success');
    } catch (error) {
      console.error('다운로드 실패:', error);
      // 에러 상태로 업데이트
      setDownloadStatus('error');
      setDownloadError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했어요');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div style={{
      height: '100vh',
      background: '#F9FAFB',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* 헤더 */}
      <div style={{
        padding: isMobile ? '8px 12px' : '16px 20px',
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        alignItems: 'center',
        gap: '8px',
      }}>
        {/* 뒤로가기 버튼 */}
        <button
          onClick={handleClose}
          className="p-2 flex items-center gap-1 rounded-lg text-gray-700 hover:text-primary hover:scale-[1.02] transition-all duration-200"
          title="이전 페이지로 돌아가기"
          aria-label="뒤로가기"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">뒤로</span>
        </button>

        {!isMobile ? (
          <div className="text-sm text-muted-foreground text-center">
            <div>{currentIndex + 1} / {slides.length}</div>
            <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.7 }}>
              ← → 이동 | ESC 나가기
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center flex-1">
            {currentIndex + 1} / {slides.length}
          </div>
        )}

        <div style={{ display: 'flex', gap: isMobile ? '4px' : '8px', position: 'relative', justifyContent: 'flex-end' }}>
          <Button
            onClick={handleSave}
            size="default"
            variant="default"
            className="flex items-center gap-2"
          >
            <Save size={18} strokeWidth={2} />
            {!isMobile && (isSaved ? '저장됨' : '저장')}
          </Button>

          {/* 다운로드 버튼 (드롭다운) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                disabled={isDownloading}
                size="default"
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download size={18} strokeWidth={2} />
                {!isMobile && (isDownloading ? '변환하고 있어요' : '다운로드')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-white border border-border shadow-lg z-100"
            >
              {/* HTML 다운로드 (개발 모드 전용) */}
              {process.env.NODE_ENV === 'development' && (
                <DropdownMenuItem
                  onClick={() => handleDownload('html')}
                  className="cursor-pointer hover:bg-transparent hover:text-primary focus:bg-transparent focus:text-primary transition-colors"
                >
                  <FileCode size={18} className="mr-2 text-[#E44D26]" strokeWidth={2} />
                  HTML 파일
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => handleDownload('pdf')}
                className="cursor-pointer hover:bg-transparent hover:text-primary focus:bg-transparent focus:text-primary transition-colors"
              >
                <FileText size={18} className="mr-2 text-[#DC143C]" strokeWidth={2} />
                PDF 파일
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDownload('pptx')}
                className="cursor-pointer hover:bg-transparent hover:text-primary focus:bg-transparent focus:text-primary transition-colors"
              >
                <Presentation size={18} className="mr-2 text-[#D24726]" strokeWidth={2} />
                PowerPoint 파일
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={handleShare}
            size="default"
            variant="outline"
            className="flex items-center gap-2"
          >
            <Share2 size={18} strokeWidth={2} />
            {!isMobile && '공유'}
          </Button>

          <Button
            onClick={handleEdit}
            disabled={!currentPresentation?.slideData}
            size="default"
            variant="outline"
            className="flex items-center gap-2"
          >
            <Edit size={18} strokeWidth={2} />
            {!isMobile && '편집'}
          </Button>

          <Button
            onClick={handleClose}
            size="default"
            variant="ghost"
            className="flex items-center gap-1 hover:text-primary hover:bg-transparent hover:scale-[1.02] transition-all duration-200"
            title="닫기"
            aria-label="닫기"
          >
            <X size={18} strokeWidth={2} />
            <span className="text-sm font-medium">닫기</span>
          </Button>
        </div>
      </div>

      {/* 광고 - 상단 (무료 플랜만) */}
      {showAds && (
        <div style={{
          padding: isMobile ? '8px 12px' : '16px 20px',
          background: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          justifyContent: 'center',
          maxWidth: '100%',
          overflow: 'hidden',
        }}>
          <KakaoAdMobileThick />
        </div>
      )}

      {/* 슬라이드 뷰어 */}
      {isMobile ? (
        // 모바일: 세로 스크롤 레이아웃 (1200×675 비율 유지, 화면에 맞게 스케일 조정)
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px',
          background: '#F9FAFB',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}>
            {slides.map((slide, index) => {
              // 모바일 화면 너비 계산 (padding 제외)
              const mobileWidth = typeof window !== 'undefined' ? window.innerWidth - 24 : 400;
              // 1200px 기준으로 스케일 계산
              const scale = mobileWidth / 1200;
              // 스케일된 높이 계산
              const scaledHeight = 675 * scale;

              return (
                <div
                  key={index}
                  style={{
                    width: '100%',
                    height: `${scaledHeight}px`,
                    background: '#FFFFFF',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <iframe
                    srcDoc={createSlideDocument(slide.html, slide.css)}
                    style={{
                      width: '1200px',
                      height: '675px',
                      border: 'none',
                      display: 'block',
                      transform: `scale(${scale})`,
                      transformOrigin: 'top left',
                    }}
                    title={`슬라이드 ${index + 1}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // 데스크톱: 페이지네이션 레이아웃
        <div style={{
          flex: 1,
          minHeight: '715px', // 슬라이드 높이(675px) + padding(40px) 보장
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          <div style={{
            width: '1200px', // 고정 너비
            height: '675px', // 고정 높이 (16:9 비율)
            maxWidth: '90vw', // 화면보다 크면 축소
            maxHeight: '90vh', // 화면보다 크면 축소
            background: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            overflow: 'hidden',
          }}>
            <iframe
              srcDoc={createSlideDocument(currentSlide.html, currentSlide.css)}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                display: 'block',
              }}
              title={`슬라이드 ${currentIndex + 1}`}
            />
          </div>
        </div>
      )}

      {/* 네비게이션 - 데스크톱 전용 */}
      {!isMobile && (
        <div style={{
          padding: '12px 20px',
          background: '#FFFFFF',
          borderTop: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            maxWidth: '1200px',
          }}>
            <Button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              size="lg"
              variant="outline"
              style={{
                minWidth: '100px',
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
            >
              ← 이전 페이지
            </Button>

            <div className="flex-1 min-w-0 text-sm text-muted-foreground text-center overflow-hidden overflow-ellipsis whitespace-nowrap">
              {currentPresentation.title}
            </div>

            <Button
              onClick={handleNext}
              disabled={currentIndex === slides.length - 1}
              size="lg"
              variant="outline"
              style={{
                minWidth: '100px',
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
            >
              다음 페이지 →
            </Button>
          </div>
        </div>
      )}

      {/* 광고 - 하단 (무료 플랜만) */}
      {showAds && (
        <div style={{
          padding: isMobile ? '12px' : '20px',
          background: '#FFFFFF',
          borderTop: '1px solid #E5E7EB',
          display: 'flex',
          justifyContent: 'center',
          maxWidth: '100%',
          overflow: 'hidden',
        }}>
          <KakaoAdBanner />
        </div>
      )}

      {/* 다운로드 진행 상태 모달 */}
      <DownloadProgressModal
        isOpen={showDownloadProgress}
        onClose={() => setShowDownloadProgress(false)}
        status={downloadStatus}
        format={downloadFormat}
        errorMessage={downloadError}
      />
    </div>
  );
}
