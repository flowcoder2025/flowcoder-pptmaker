/**
 * Viewer 페이지
 * Phase 2: 프리젠테이션 뷰어 기능
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { usePresentationStore } from '@/store/presentationStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { TOSS_COLORS } from '@/constants/design';
import { downloadHTML, downloadPDF, downloadPPTX } from '@/utils/download';
import KakaoAdBanner from '@/components/ads/KakaoAdBanner';
import KakaoAdMobileThick from '@/components/ads/KakaoAdMobileThick';

export default function ViewerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentPresentation, savePresentation, fetchPresentation } = usePresentationStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 워터마크 표시 여부
  const { hasWatermark } = useSubscriptionStore();

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // 다운로드 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = () => {
      if (showDownloadMenu) {
        setShowDownloadMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showDownloadMenu]);

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
        router.push('/input');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, currentPresentation, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: TOSS_COLORS.background }}>
        <p style={{ color: TOSS_COLORS.textSecondary }}>불러오고 있어요...</p>
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
      router.push('/editor');
    } else {
      alert('편집할 수 없는 프리젠테이션이에요 (구 버전)');
    }
  };

  const handleDownload = async (format: 'html' | 'pdf' | 'pptx') => {
    if (!currentPresentation || isDownloading) return;

    setIsDownloading(true);
    setShowDownloadMenu(false);

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
      alert(`${format.toUpperCase()} 파일을 다운로드했어요!`);
    } catch (error) {
      console.error('다운로드 실패:', error);
      alert(`다운로드하지 못했어요: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
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
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        gap: '8px',
      }}>
        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => router.push('/input')}
          style={{
            padding: '8px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          title="입력 페이지로 돌아가기"
          aria-label="뒤로가기"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#374151"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {!isMobile ? (
          <div style={{
            fontSize: '14px',
            color: TOSS_COLORS.textSecondary,
            textAlign: 'center',
          }}>
            <div>{currentIndex + 1} / {slides.length}</div>
            <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.7 }}>
              ← → 이동 | ESC 나가기
            </div>
          </div>
        ) : (
          <div style={{
            fontSize: '14px',
            color: TOSS_COLORS.textSecondary,
            textAlign: 'center',
            flex: 1,
          }}>
            {currentIndex + 1} / {slides.length}
          </div>
        )}

        <div style={{ display: 'flex', gap: isMobile ? '4px' : '8px', position: 'relative', justifyContent: 'flex-end' }}>
          <Button
            onClick={handleSave}
            size="default"
            variant="default"
          >
            {isSaved ? (isMobile ? '✓' : '✓ 저장됨') : (isMobile ? '💾' : '💾 저장')}
          </Button>

          {/* 다운로드 버튼 (드롭다운) */}
          <div style={{ position: 'relative' }}>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setShowDownloadMenu(!showDownloadMenu);
              }}
              disabled={isDownloading}
              size="default"
              variant="outline"
            >
              {isDownloading
                ? (isMobile ? '⏳' : '변환하고 있어요')
                : (isMobile ? '⬇️' : '⬇️ 다운로드')}
            </Button>

            {/* 다운로드 메뉴 */}
            {showDownloadMenu && !isDownloading && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '4px',
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 1000,
                minWidth: '160px',
              }}>
                {/* HTML 다운로드 (개발 모드 전용) */}
                {process.env.NODE_ENV === 'development' && (
                  <button
                    onClick={() => handleDownload('html')}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '14px',
                      color: TOSS_COLORS.text,
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid #E5E7EB',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    📄 HTML 파일
                  </button>
                )}
                <button
                  onClick={() => handleDownload('pdf')}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '14px',
                    color: TOSS_COLORS.text,
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #E5E7EB',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  📕 PDF 파일
                </button>
                <button
                  onClick={() => handleDownload('pptx')}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '14px',
                    color: TOSS_COLORS.text,
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  📊 PowerPoint 파일
                </button>
              </div>
            )}
          </div>

          <Button
            onClick={handleShare}
            size="default"
            variant="outline"
          >
            {isMobile ? '📤' : '📤 공유'}
          </Button>

          <Button
            onClick={handleEdit}
            disabled={!currentPresentation?.slideData}
            size="default"
            variant="outline"
          >
            {isMobile ? '✏️' : '✏️ 편집'}
          </Button>
        </div>
      </div>

      {/* 광고 - 상단 */}
      <div style={{
        padding: isMobile ? '8px 12px' : '16px 20px',
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex',
        justifyContent: 'center',
      }}>
        <KakaoAdMobileThick />
      </div>

      {/* 광고와 슬라이드 사이 간격 */}
      <div style={{
        height: isMobile ? '20px' : '32px',
        background: '#F9FAFB',
      }} />

      {/* 슬라이드 뷰어 */}
      <div style={{
        flex: 1,
        minHeight: isMobile ? '300px' : '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '12px' : '40px',
        overflow: 'hidden',
      }}>
        <div style={{
          width: isMobile ? '100%' : '90vw',
          maxWidth: isMobile ? '100%' : '1200px',
          aspectRatio: '16/9',
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

      {/* 네비게이션 */}
      <div style={{
        padding: isMobile ? '12px' : '20px',
        background: '#FFFFFF',
        borderTop: '1px solid #E5E7EB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: isMobile ? '8px' : '16px',
      }}>
        <Button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          size={isMobile ? 'default' : 'lg'}
          variant="outline"
        >
          {isMobile ? '←' : '← 이전'}
        </Button>

        {!isMobile && (
          <div style={{
            fontSize: '14px',
            color: TOSS_COLORS.textSecondary,
            textAlign: 'center',
          }}>
            {currentPresentation.title}
          </div>
        )}

        <Button
          onClick={handleNext}
          disabled={currentIndex === slides.length - 1}
          size={isMobile ? 'default' : 'lg'}
          variant="outline"
        >
          {isMobile ? '→' : '다음 →'}
        </Button>
      </div>

      {/* 광고 - 하단 */}
      <div style={{
        padding: isMobile ? '12px' : '20px',
        background: '#FFFFFF',
        borderTop: '1px solid #E5E7EB',
        display: 'flex',
        justifyContent: 'center',
      }}>
        <KakaoAdBanner />
      </div>
    </div>
  );
}
