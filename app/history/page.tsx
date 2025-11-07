'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import { TOSS_COLORS } from '@/constants/design';
import { Search, Plus, Calendar, Trash2, Eye, Edit, Download } from 'lucide-react';
import { toast } from 'sonner';

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
  slideData: any;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [filteredPresentations, setFilteredPresentations] = useState<Presentation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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
      const res = await fetch('/api/history');

      if (!res.ok) {
        throw new Error('Failed to fetch presentations');
      }

      const data = await res.json();
      setPresentations(data.presentations || []);
      setFilteredPresentations(data.presentations || []);
    } catch (error) {
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
      const res = await fetch(`/api/history/${id}`, {
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

  const handleDownload = (id: string) => {
    toast.info('다운로드 기능 준비 중이에요');
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
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}
      </MaxWidthContainer>
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
  const slideCount = presentation.metadata?.totalSlides || 0;

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      {/* 썸네일 영역 */}
      <div
        className="h-40 flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${TOSS_COLORS.primary} 0%, ${TOSS_COLORS.secondary} 100%)`,
        }}
      >
        <div className="text-white text-6xl">📊</div>
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
          >
            <Trash2 size={16} className="mr-1" />
            삭제
          </Button>
        </div>
      </div>
    </Card>
  );
}
