'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { PLAN_BENEFITS } from '@/constants/subscription';
import { BUTTON_TEXT } from '@/lib/text-config';
import { Search, Plus, Calendar, Trash2, Eye, Edit, Download, Loader2, FileCode, FileText, Presentation } from 'lucide-react';
import { toast } from 'sonner';
import KakaoAdBanner from '@/components/ads/KakaoAdBanner';
import KakaoAdMobileThick from '@/components/ads/KakaoAdMobileThick';
import DownloadProgressModal from '@/components/DownloadProgressModal';
import type { HTMLSlide } from '@/types/slide';

/**
 * PPT 히스토리 페이지
 *
 * @description
 * 사용자가 생성한 모든 프리젠테이션을 목록으로 표시합니다.
 * 검색, 필터, 삭제 기능을 제공합니다.
 */

interface Presentation {
  id: string;
  title: string;
  description?: string;
  slides: HTMLSlide[];      // 썸네일 렌더링용 (렌더링된 HTML)
  slideData?: Record<string, unknown>;          // 편집용 (구조화된 데이터)
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { plan } = useSubscriptionStore();

  // 광고 표시 여부 결정 (유료 플랜은 광고 제거)
  const showAds = !PLAN_BENEFITS[plan].benefits.adFree;

  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [filteredPresentations, setFilteredPresentations] = useState<Presentation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [selectedPresentationId, setSelectedPresentationId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [presentationToDelete, setPresentationToDelete] = useState<string | null>(null);

  // 다운로드 진행 상태 관리
  const [showDownloadProgress, setShowDownloadProgress] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<'downloading' | 'success' | 'error'>('downloading');
  const [downloadFormat, setDownloadFormat] = useState<'html' | 'pdf' | 'pptx'>('html');
  const [downloadError, setDownloadError] = useState<string>('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      fetchPresentations();
    }
  }, [status, session, router]);

  useEffect(() => {
    // 검색 필터링
    if (searchQuery.trim() === '') {
      setFilteredPresentations(presentations);
    } else {
      const filtered = presentations.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPresentations(filtered);
    }
  }, [searchQuery, presentations]);

  const fetchPresentations = async () => {
    try {
      const res = await fetch('/api/presentations');

      if (!res.ok) {
        throw new Error('Failed to fetch presentations');
      }

      const data = await res.json();
      setPresentations(data.presentations || []);
      setFilteredPresentations(data.presentations || []);
    } catch (error) {
      console.error('프리젠테이션 조회 실패:', error);
      toast.error('프리젠테이션을 불러오는 중 문제가 발생했어요');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setPresentationToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!presentationToDelete) return;

    setShowDeleteDialog(false);

    try {
      const res = await fetch(`/api/presentations/${presentationToDelete}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete');
      }

      toast.success('삭제했어요');
      setPresentations((prev) => prev.filter((p) => p.id !== presentationToDelete));
    } catch (error) {
      toast.error('삭제 중 문제가 발생했어요');
    } finally {
      setPresentationToDelete(null);
    }
  };

  const handleView = (id: string) => {
    router.push(`/viewer?id=${id}&from=history&origin=history`);
  };

  const handleEdit = (id: string) => {
    router.push(`/editor?id=${id}&from=history&origin=history`);
  };

  const handleDownloadClick = (id: string) => {
    setSelectedPresentationId(id);
    setShowDownloadDialog(true);
  };

  const handleDownload = async (format: 'html' | 'pdf' | 'pptx') => {
    if (!selectedPresentationId || isDownloading) return;

    setIsDownloading(true);
    setShowDownloadDialog(false);

    // 모달 표시 - 다운로드 시작
    setDownloadFormat(format);
    setDownloadStatus('downloading');
    setShowDownloadProgress(true);

    try {
      // 1. 프리젠테이션 데이터 로드
      const res = await fetch(`/api/presentations/${selectedPresentationId}`);
      if (!res.ok) {
        throw new Error('프리젠테이션을 불러오지 못했어요');
      }

      const data = await res.json();
      const presentation = data.presentation;

      if (!presentation || !presentation.slides || presentation.slides.length === 0) {
        throw new Error('다운로드할 슬라이드가 없어요');
      }

      // 2. 다운로드 실행 (동적 import)
      if (format === 'html') {
        const { downloadHTML } = await import('@/utils/download');
        await downloadHTML(presentation);
      } else if (format === 'pdf') {
        const { downloadPDF } = await import('@/utils/download');
        await downloadPDF(presentation);
      } else {
        const { downloadPPTX } = await import('@/utils/download');
        await downloadPPTX(presentation);
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
      setSelectedPresentationId(null);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground text-lg">불러오고 있어요...</p>
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

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-foreground">
              내 프리젠테이션
            </h1>
            <p className="text-base lg:text-lg text-muted-foreground">
              {presentations.length}개의 프리젠테이션을 만들었어요
            </p>
          </div>

          <Button
            onClick={() => router.push('/input')}
            size="lg"
            className="bg-primary text-white"
          >
            <Plus className="mr-2" size={20} />
            새로 만들기
          </Button>
        </div>

        {/* 광고 - 검색 전 (무료 플랜만) */}
        {showAds && (
          <div className="mb-6">
            <KakaoAdBanner />
          </div>
        )}

        {/* 검색 */}
        <div className="mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={20}
            />
            <Input
              type="text"
              placeholder="프리젠테이션 검색해요..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* 프리젠테이션 목록 */}
        {filteredPresentations.length === 0 ? (
          <Card className="p-12 text-center">
            {searchQuery ? (
              <>
                <p className="text-lg mb-2 text-foreground">
                  &quot;{searchQuery}&quot;를 찾지 못했어요
                </p>
                <p className="text-muted-foreground">
                  다른 검색어로 시도해보세요
                </p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">📄</div>
                <p className="text-lg mb-2 text-foreground">
                  아직 생성한 프리젠테이션이 없어요
                </p>
                <p className="mb-6 text-muted-foreground">
                  AI가 자동으로 슬라이드를 만들어줘요
                </p>
                <Button
                  onClick={() => router.push('/input')}
                  size="lg"
                  className="bg-primary text-white"
                >
                  ✨ 첫 프리젠테이션 만들기
                </Button>
              </>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPresentations.map((presentation) => (
              <PresentationCard
                key={presentation.id}
                presentation={presentation}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDownload={handleDownloadClick}
              />
            ))}
          </div>
        )}
      </MaxWidthContainer>

      {/* 다운로드 형식 선택 다이얼로그 */}
      {showDownloadDialog && (
        <div
          onClick={() => setShowDownloadDialog(false)}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <Card
            onClick={(e) => e.stopPropagation()}
            className="relative p-8 max-w-md w-full mx-4 bg-white shadow-2xl border-4 border-primary rounded-2xl"
          >
            {/* 닫기 버튼 */}
            <button
              onClick={() => setShowDownloadDialog(false)}
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

            {/* 다운로드 아이콘 */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 flex items-center justify-center">
                <Download size={48} className="text-primary" strokeWidth={1.5} />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
              다운로드 형식 선택
            </h3>

            <p className="text-gray-600 mb-6 text-center">
              원하는 형식을 선택해주세요
            </p>

            <div className="flex flex-col gap-3">
              {/* HTML 다운로드 (개발 모드 전용) */}
              {process.env.NODE_ENV === 'development' && (
                <Button
                  onClick={() => handleDownload('html')}
                  disabled={isDownloading}
                  variant="outline"
                  size="lg"
                  className="w-full text-base font-medium flex items-center justify-center gap-3"
                >
                  <FileCode size={24} className="text-[#E44D26]" strokeWidth={2} />
                  <span>HTML 파일</span>
                </Button>
              )}
              <Button
                onClick={() => handleDownload('pdf')}
                disabled={isDownloading}
                variant="outline"
                size="lg"
                className="w-full text-base font-medium flex items-center justify-center gap-3"
              >
                <FileText size={24} className="text-[#DC143C]" strokeWidth={2} />
                <span>PDF 파일</span>
              </Button>
              <Button
                onClick={() => handleDownload('pptx')}
                disabled={isDownloading}
                variant="outline"
                size="lg"
                className="w-full text-base font-medium flex items-center justify-center gap-3"
              >
                <Presentation size={24} className="text-[#D24726]" strokeWidth={2} />
                <span>PowerPoint 파일</span>
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteDialog && (
        <div
          onClick={() => setShowDeleteDialog(false)}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <Card
            onClick={(e) => e.stopPropagation()}
            className="relative p-8 max-w-md w-full mx-4 bg-white shadow-2xl border-4 border-primary rounded-2xl"
          >
            {/* 닫기 버튼 */}
            <button
              onClick={() => setShowDeleteDialog(false)}
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

            {/* 붉은색 쓰레기통 아이콘 */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 flex items-center justify-center">
                <Trash2 size={48} className="text-red-500" strokeWidth={1.5} />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
              정말 삭제할까요?
            </h3>

            <p className="text-gray-600 mb-6 text-center">
              이 작업은 되돌릴 수 없어요
            </p>

            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowDeleteDialog(false)}
                variant="outline"
                size="lg"
                className="px-8"
              >
                {BUTTON_TEXT.cancel}
              </Button>
              <Button
                onClick={handleConfirmDelete}
                size="lg"
                className="px-8 bg-red-500 hover:bg-red-600 text-white"
              >
                삭제하기
              </Button>
            </div>
          </Card>
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

/**
 * 프리젠테이션 카드 컴포넌트
 */
interface PresentationCardProps {
  presentation: Presentation;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
}

function PresentationCard({
  presentation,
  onView,
  onEdit,
  onDelete,
  onDownload,
}: PresentationCardProps) {
  const slideCount: number = (presentation.metadata?.slideCount as number | undefined) || 0;
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // 타이틀 글자수 제한 함수 (2줄을 넘지 않도록)
  const truncateTitle = (title: string, maxLength: number = 45) => {
    if (title.length <= maxLength) return title;
    return title.slice(0, maxLength) + '...';
  };

  // Intersection Observer로 카드가 보이는지 감지
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // 한 번 보이면 계속 유지
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // 첫 슬라이드 HTML 생성
  const createThumbnailDocument = () => {
    // presentation.slides는 HTMLSlide[] 타입 (렌더링된 HTML)
    // presentation.slideData.slides는 Slide[] 타입 (구조화된 데이터)
    const slides = presentation.slides || [];

    if (slides.length === 0) {
      return '';
    }

    const firstSlide = slides[0];

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=1200, initial-scale=1.0">
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            html, body {
              width: 1200px;
              height: 675px;
              overflow: hidden;
            }
            ${firstSlide.css || ''}
          </style>
        </head>
        <body>
          ${firstSlide.html || ''}
        </body>
      </html>
    `;
  };

  const thumbnailDoc = createThumbnailDocument();

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg max-w-[350px] mx-auto" ref={cardRef}>
      {/* 썸네일 영역 */}
      <div
        className="relative overflow-hidden"
        style={{
          width: '350px',
          height: '196.875px',
          background: thumbnailDoc ? '#FFFFFF' : 'linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(210 40% 96.1%) 100%)',
        }}
      >
        {isVisible && thumbnailDoc ? (
          <div className="absolute top-0 left-0 overflow-hidden">
            <div
              style={{
                width: '1200px',
                height: '675px',
                transform: 'scale(0.29167)',
                transformOrigin: 'top left',
              }}
            >
              <iframe
                srcDoc={thumbnailDoc}
                sandbox="allow-same-origin"
                style={{
                  width: '1200px',
                  height: '675px',
                  border: 'none',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white text-6xl">📊</div>
        )}
      </div>

      {/* 콘텐츠 영역 */}
      <div className="p-5">
        {/* 타이틀 (2줄 제한, 최소 높이로 하단 요소 위치 고정) */}
        <h3 className="text-lg font-bold mb-3 line-clamp-2 min-h-16 text-foreground">
          {truncateTitle(presentation.title)}
        </h3>

        {/* 슬라이드 수 + 날짜 정보 */}
        <div className="flex items-center gap-4 text-sm mb-3 text-muted-foreground">
          <span>
            📄 {slideCount}슬라이드
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            {new Date(presentation.createdAt).toLocaleDateString('ko-KR')}
          </span>
        </div>

        {/* 액션 버튼 */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onView(presentation.id)}
          >
            <Eye size={16} className="mr-1" />
            보기
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(presentation.id)}
          >
            <Edit size={16} className="mr-1" />
            {BUTTON_TEXT.edit}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDownload(presentation.id)}
          >
            <Download size={16} className="mr-1" />
            {BUTTON_TEXT.download}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(presentation.id)}
            className="text-destructive hover:bg-transparent hover:text-destructive hover:border-destructive transition-colors"
          >
            <Trash2 size={16} className="mr-1" />
            {BUTTON_TEXT.delete}
          </Button>
        </div>
      </div>
    </Card>
  );
}
