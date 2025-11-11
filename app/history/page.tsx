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
import { TOSS_COLORS } from '@/constants/design';
import { Search, Plus, Calendar, Trash2, Eye, Edit, Download } from 'lucide-react';
import { toast } from 'sonner';
import KakaoAdBanner from '@/components/ads/KakaoAdBanner';
import KakaoAdMobileThick from '@/components/ads/KakaoAdMobileThick';
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
  slideData?: any;          // 편집용 (구조화된 데이터)
  metadata?: any;
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

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제할까요? 이 작업은 되돌릴 수 없어요')) {
      return;
    }

    try {
      const res = await fetch(`/api/presentations/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete');
      }

      toast.success('삭제했어요');
      setPresentations((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      toast.error('삭제 중 문제가 발생했어요');
    }
  };

  const handleView = (id: string) => {
    router.push(`/viewer?id=${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/editor?id=${id}`);
  };

  const handleDownloadClick = (id: string) => {
    setSelectedPresentationId(id);
    setShowDownloadDialog(true);
  };

  const handleDownload = async (format: 'pdf' | 'pptx') => {
    if (!selectedPresentationId || isDownloading) return;

    setIsDownloading(true);
    setShowDownloadDialog(false);

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
      toast.info('다운로드를 준비하고 있어요');

      if (format === 'pdf') {
        const { downloadPDF } = await import('@/utils/download');
        await downloadPDF(presentation);
      } else {
        const { downloadPPTX } = await import('@/utils/download');
        await downloadPPTX(presentation);
      }

      toast.success(`${format === 'pdf' ? 'PDF' : 'PowerPoint'} 파일을 다운로드했어요!`);
    } catch (error) {
      console.error('다운로드 실패:', error);
      toast.error('다운로드하지 못했어요');
    } finally {
      setIsDownloading(false);
      setSelectedPresentationId(null);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: TOSS_COLORS.background }}>
        <p style={{ color: TOSS_COLORS.textSecondary }}>불러오고 있어요...</p>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: TOSS_COLORS.background }}>
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
            <h1
              className="text-3xl lg:text-4xl font-bold mb-2"
              style={{ color: TOSS_COLORS.text }}
            >
              내 프리젠테이션
            </h1>
            <p
              className="text-base lg:text-lg"
              style={{ color: TOSS_COLORS.textSecondary }}
            >
              {presentations.length}개의 프리젠테이션을 만들었어요
            </p>
          </div>

          <Button
            onClick={() => router.push('/input')}
            size="lg"
            style={{
              backgroundColor: TOSS_COLORS.primary,
              color: '#FFFFFF',
            }}
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
              className="absolute left-3 top-1/2 -translate-y-1/2"
              size={20}
              style={{ color: TOSS_COLORS.textSecondary }}
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
                <p
                  className="text-lg mb-2"
                  style={{ color: TOSS_COLORS.text }}
                >
                  "{searchQuery}"를 찾지 못했어요
                </p>
                <p style={{ color: TOSS_COLORS.textSecondary }}>
                  다른 검색어로 시도해보세요
                </p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">📄</div>
                <p
                  className="text-lg mb-2"
                  style={{ color: TOSS_COLORS.text }}
                >
                  아직 생성한 프리젠테이션이 없어요
                </p>
                <p
                  className="mb-6"
                  style={{ color: TOSS_COLORS.textSecondary }}
                >
                  AI가 자동으로 슬라이드를 만들어줘요
                </p>
                <Button
                  onClick={() => router.push('/input')}
                  size="lg"
                  style={{
                    backgroundColor: TOSS_COLORS.primary,
                    color: '#FFFFFF',
                  }}
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
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowDownloadDialog(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '16px',
                color: TOSS_COLORS.text,
              }}
            >
              다운로드 형식 선택
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => handleDownload('pdf')}
                disabled={isDownloading}
                style={{
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: TOSS_COLORS.text,
                  backgroundColor: '#FFFFFF',
                  border: `2px solid ${TOSS_COLORS.primary}`,
                  borderRadius: '8px',
                  cursor: isDownloading ? 'not-allowed' : 'pointer',
                  opacity: isDownloading ? 0.5 : 1,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isDownloading) e.currentTarget.style.backgroundColor = `${TOSS_COLORS.primary}10`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                }}
              >
                📕 PDF 파일
              </button>
              <button
                onClick={() => handleDownload('pptx')}
                disabled={isDownloading}
                style={{
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: TOSS_COLORS.text,
                  backgroundColor: '#FFFFFF',
                  border: `2px solid ${TOSS_COLORS.primary}`,
                  borderRadius: '8px',
                  cursor: isDownloading ? 'not-allowed' : 'pointer',
                  opacity: isDownloading ? 0.5 : 1,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isDownloading) e.currentTarget.style.backgroundColor = `${TOSS_COLORS.primary}10`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                }}
              >
                📊 PowerPoint 파일
              </button>
            </div>
            <button
              onClick={() => setShowDownloadDialog(false)}
              style={{
                marginTop: '16px',
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                color: TOSS_COLORS.textSecondary,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}
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
  const slideCount = presentation.metadata?.slideCount || 0;
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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
    <Card className="overflow-hidden transition-all hover:shadow-lg" ref={cardRef}>
      {/* 썸네일 영역 */}
      <div
        className="relative overflow-hidden w-full"
        style={{
          aspectRatio: '16/9',
          background: thumbnailDoc ? '#FFFFFF' : `linear-gradient(135deg, ${TOSS_COLORS.primary} 0%, ${TOSS_COLORS.secondary} 100%)`,
        }}
      >
        {isVisible && thumbnailDoc ? (
          <div
            className="absolute inset-0"
            style={{
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
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white text-6xl">📊</div>
        )}
      </div>

      {/* 콘텐츠 영역 */}
      <div className="p-5">
        <h3
          className="text-lg font-bold mb-2 line-clamp-2"
          style={{ color: TOSS_COLORS.text }}
        >
          {presentation.title}
        </h3>

        {presentation.description && (
          <p
            className="text-sm mb-3 line-clamp-2"
            style={{ color: TOSS_COLORS.textSecondary }}
          >
            {presentation.description}
          </p>
        )}

        <div
          className="flex items-center gap-4 text-sm mb-4"
          style={{ color: TOSS_COLORS.textSecondary }}
        >
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
            편집
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDownload(presentation.id)}
          >
            <Download size={16} className="mr-1" />
            다운로드
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(presentation.id)}
            style={{ color: TOSS_COLORS.error }}
            className="hover:border-current"
          >
            <Trash2 size={16} className="mr-1" />
            삭제
          </Button>
        </div>
      </div>
    </Card>
  );
}
