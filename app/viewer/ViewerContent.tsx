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
import { Card } from '@/components/ui/card';
import { Save, Download, Share2, Edit, X, Loader2, FileCode, FileText, Presentation, CheckCircle, AlertCircle } from 'lucide-react';
import { usePresentationStore } from '@/store/presentationStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { PLAN_BENEFITS } from '@/constants/subscription';
import { downloadHTML, downloadPDF, downloadPPTX } from '@/utils/download';
import KakaoAdBanner from '@/components/ads/KakaoAdBanner';
import KakaoAdMobileThick from '@/components/ads/KakaoAdMobileThick';
import DownloadProgressModal from '@/components/DownloadProgressModal';
import { calculateSlideSize } from '@/services/template/engine/types';

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

  // 공유 알림 상태 관리
  const [showShareAlert, setShowShareAlert] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [shareType, setShareType] = useState<'success' | 'error'>('success');
  const [isSharing, setIsSharing] = useState(false);

  // URL에서 from 파라미터 추출 (어디서 왔는지)
  const from = searchParams.get('from') || 'input'; // 기본값: input

  // 최초 진입점 추출 (history, input 등)
  const origin = searchParams.get('origin') || 'input';

  // 워터마크 표시 여부 및 광고 표시 여부
  const { hasWatermark, plan } = useSubscriptionStore();
  const showAds = !PLAN_BENEFITS[plan].benefits.adFree;

  // 슬라이드 크기 계산 (aspectRatio에 따라 동적)
  const aspectRatio = currentPresentation?.slideData?.aspectRatio || '16:9';
  const slideSize = calculateSlideSize(aspectRatio);
  const minHeightDesktop = slideSize.height + 40; // padding(20px * 2)

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
      setShareMessage('저장했어요!');
      setShareType('success');
      setShowShareAlert(true);
    } catch (error) {
      setShareMessage('저장하지 못했어요: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
      setShareType('error');
      setShowShareAlert(true);
    }
  };

  const handleShare = async () => {
    // 중복 호출 방지
    if (isSharing) {
      return;
    }

    if (!currentPresentation) {
      setShareMessage('공유할 프리젠테이션이 없어요.');
      setShareType('error');
      setShowShareAlert(true);
      return;
    }

    // 웹 서비스에서는 Web Share API 사용
    if (navigator.share) {
      try {
        setIsSharing(true);
        await navigator.share({
          title: currentPresentation.title,
          text: `${currentPresentation.title} - PPT Maker로 제작`,
          url: window.location.href,
        });
        console.log('✅ 공유 완료');
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('공유 실패:', error);
          setShareMessage('공유하지 못했어요. 다시 시도해 주세요.');
          setShareType('error');
          setShowShareAlert(true);
        }
      } finally {
        setIsSharing(false);
      }
    } else {
      // Web Share API 미지원 브라우저 - 링크 복사
      try {
        setIsSharing(true);
        await navigator.clipboard.writeText(window.location.href);
        setShareMessage('링크를 복사했어요!');
        setShareType('success');
        setShowShareAlert(true);
      } catch (error) {
        console.error('링크 복사 실패:', error);
        setShareMessage('링크 복사에 실패했어요.');
        setShareType('error');
        setShowShareAlert(true);
      } finally {
        setIsSharing(false);
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
              // aspectRatio에 따른 스케일 계산
              const scale = mobileWidth / slideSize.width;
              // 스케일된 높이 계산
              const scaledHeight = slideSize.height * scale;

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
                      width: `${slideSize.width}px`,
                      height: `${slideSize.height}px`,
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          overflow: 'auto', // 광고로 인해 공간 부족 시 스크롤
        }}>
          {(() => {
            // 화면 크기 기준 스케일 계산
            // 너비: 화면의 90%
            const maxWidth = typeof window !== 'undefined' ? window.innerWidth * 0.9 : slideSize.width;
            // 높이: 화면의 75% (헤더, 광고, 네비게이션 공간 고려)
            const maxHeight = typeof window !== 'undefined' ? window.innerHeight * 0.75 : slideSize.height;

            // 너비/높이 기준으로 스케일 계산하여 더 작은 값 사용
            const scaleByWidth = maxWidth / slideSize.width;
            const scaleByHeight = maxHeight / slideSize.height;
            const scale = Math.min(scaleByWidth, scaleByHeight, 1); // 최대 1배 (확대 방지)

            // 스케일 적용된 크기
            const scaledWidth = slideSize.width * scale;
            const scaledHeight = slideSize.height * scale;

            return (
              <div style={{
                width: `${scaledWidth}px`,
                height: `${scaledHeight}px`,
                position: 'relative',
              }}>
                <div style={{
                  width: `${slideSize.width}px`,
                  height: `${slideSize.height}px`,
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
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
            );
          })()}
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
      {/* 공유 알림 모달 */}
      {showShareAlert && (
        <div
          onClick={() => setShowShareAlert(false)}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <Card
            onClick={(e) => e.stopPropagation()}
            className="relative p-8 max-w-md w-full mx-4 bg-white shadow-2xl border-4 border-primary rounded-2xl"
          >
            {/* 닫기 버튼 */}
            <button
              onClick={() => setShowShareAlert(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="닫기"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* 아이콘 */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 flex items-center justify-center">
                {shareType === 'success' ? (
                  <CheckCircle size={48} className="text-green-500" strokeWidth={1.5} />
                ) : (
                  <AlertCircle size={48} className="text-yellow-500" strokeWidth={1.5} />
                )}
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
              {shareType === 'success' ? '성공' : '알림'}
            </h3>

            <p className="text-gray-600 mb-6 text-center whitespace-pre-line">
              {shareMessage}
            </p>

            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowShareAlert(false)}
                size="lg"
                className="px-8 bg-blue-500 hover:bg-blue-600 text-white"
              >
                확인
              </Button>
            </div>
          </Card>
        </div>
      )}

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
