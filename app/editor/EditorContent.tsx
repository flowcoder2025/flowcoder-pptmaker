/**
 * Editor 페이지
 * Phase 2: 프리젠테이션 편집 기능
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Save, Eye, Undo2, Redo2, Palette, Plus, Copy, Trash2 } from 'lucide-react';
import { usePresentationStore } from '@/store/presentationStore';
import SlideList from '@/components/editor/SlideList';
import EditForm from '@/components/editor/EditForm';
import SlidePreview from '@/components/editor/SlidePreview';
import AddSlideDialog from '@/components/editor/AddSlideDialog';
import ConfirmDialog from '@/components/editor/ConfirmDialog';
import TemplateSelector from '@/components/editor/TemplateSelector';
import MoreMenu from '@/components/editor/MoreMenu';
import KakaoAdBanner from '@/components/ads/KakaoAdBanner';
import KakaoAdMobileThick from '@/components/ads/KakaoAdMobileThick';
import type { SlideType } from '@/types/slide';


export default function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentPresentation, updateSlide, reorderSlides, addSlide, deleteSlide, duplicateSlide, changeTemplate, undo, redo, canUndo, canRedo, savePresentation, fetchPresentation } = usePresentationStore();
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // URL에서 from 파라미터 추출 (어디서 왔는지)
  const from = searchParams.get('from') || 'viewer'; // 기본값: viewer

  // Viewer의 원래 진입점 추출 (History → Viewer → Editor 체인을 위해)
  const viewerFrom = searchParams.get('viewerFrom');

  // URL 파라미터로부터 프리젠테이션 로드
  useEffect(() => {
    const id = searchParams.get('id');

    if (id) {
      // 히스토리 페이지에서 온 경우 - DB에서 로드
      setIsLoading(true);
      fetchPresentation(id)
        .then(() => {
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('프리젠테이션 로드 실패:', error);
          setIsLoading(false);
          router.push('/history');
        });
    }
  }, [searchParams, fetchPresentation, router]);

  // 키보드 단축키: Ctrl+Z (Undo), Ctrl+Shift+Z (Redo)
  React.useEffect(() => {
    if (!currentPresentation?.slideData) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z 또는 Cmd+Z (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) {
          undo();
        }
      }
      // Ctrl+Shift+Z 또는 Cmd+Shift+Z (Mac)
      else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        if (canRedo()) {
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPresentation?.slideData, undo, redo, canUndo, canRedo]);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">불러오고 있어요...</p>
      </div>
    );
  }

  // slideData가 없으면 편집 불가 (구 버전 프리젠테이션)
  if (!currentPresentation?.slideData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-bold mb-4">편집할 수 없어요</h2>
          <p className="text-gray-600 mb-6">
            이 프리젠테이션은 편집 기능이 지원되지 않는 버전이에요.
            새로 생성해주세요.
          </p>
          <button
            onClick={() => router.push('/viewer')}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            뷰어로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      await savePresentation();
      alert('저장했어요');
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했어요. 다시 시도해주세요.');
    }
  };

  const handleSaveAndView = async () => {
    try {
      await savePresentation();
      router.push('/viewer');
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했어요. 다시 시도해주세요.');
    }
  };

  // 뒤로가기/닫기: from 파라미터에 따라 이전 페이지로 이동
  const handleClose = () => {
    if (from === 'history') {
      // History에서 직접 온 경우
      router.push('/history');
    } else if (from === 'viewer') {
      // Viewer에서 온 경우: Viewer의 원래 진입점으로 돌아갈 수 있도록 from 파라미터 전달
      const id = searchParams.get('id');
      const fromParam = viewerFrom ? `&from=${viewerFrom}` : '';
      const url = id ? `/viewer?id=${id}${fromParam}` : `/viewer${fromParam}`;
      router.push(url);
    } else {
      // 기타 경우 (기본값)
      const id = searchParams.get('id');
      const url = id ? `/viewer?id=${id}` : '/viewer';
      router.push(url);
    }
  };

  const currentSlide = currentPresentation.slideData.slides[selectedSlideIndex];

  const handleSlideChange = (updatedSlide: typeof currentSlide) => {
    updateSlide(selectedSlideIndex, updatedSlide);
  };

  const handleAddSlide = (slideType: SlideType) => {
    addSlide(slideType, selectedSlideIndex);
    // 새로 추가된 슬라이드를 선택
    setSelectedSlideIndex(selectedSlideIndex + 1);
  };

  const handleDeleteSlide = () => {
    const success = deleteSlide(selectedSlideIndex);
    if (success) {
      // 삭제 후 인덱스 조정: 마지막 슬라이드를 삭제한 경우 이전 슬라이드 선택
      if (currentPresentation?.slideData && selectedSlideIndex >= currentPresentation.slideData.slides.length) {
        setSelectedSlideIndex(Math.max(0, selectedSlideIndex - 1));
      }
      setIsDeleteDialogOpen(false);
    } else {
      // 마지막 슬라이드 삭제 시도 시
      alert('마지막 슬라이드는 삭제할 수 없어요');
      setIsDeleteDialogOpen(false);
    }
  };

  const handleDuplicateSlide = () => {
    duplicateSlide(selectedSlideIndex);
    // 복제된 슬라이드(바로 다음 슬라이드)를 자동 선택
    setSelectedSlideIndex(selectedSlideIndex + 1);
  };

  // 더보기 메뉴 아이템 정의
  const moreMenuItems = [
    {
      label: '템플릿 변경',
      icon: '🎨',
      onClick: () => setIsTemplateSelectorOpen(true),
    },
    {
      label: '슬라이드 추가',
      icon: '+',
      onClick: () => setIsAddDialogOpen(true),
    },
    {
      label: '슬라이드 복제',
      icon: '📋',
      onClick: handleDuplicateSlide,
    },
    {
      label: '슬라이드 삭제',
      icon: '🗑️',
      onClick: () => setIsDeleteDialogOpen(true),
      disabled: currentPresentation.slideData.slides.length <= 1,
      variant: 'danger' as const,
    },
    {
      label: '저장 후 보기',
      icon: '👁️',
      onClick: handleSaveAndView,
    },
  ];

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* 상단 네비게이션 */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex justify-between items-center px-4 py-3 gap-2">
          {/* 좌측: 뒤로가기 버튼 */}
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
            title="이전 페이지로 돌아가기"
            aria-label="뒤로가기"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* 중앙: 제목 */}
          <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">
            {currentPresentation.title} <span className="hidden sm:inline">편집</span>
          </h1>

          {/* 우측: 액션 버튼들 */}
          <div className="flex gap-1 sm:gap-2 shrink-0">
            {/* Undo/Redo - 항상 표시 */}
            <Button
              onClick={undo}
              disabled={!canUndo()}
              variant="outline"
              size="default"
              className="transition-colors"
              title="실행 취소 (Ctrl+Z)"
              aria-label="실행 취소"
            >
              <Undo2 size={18} strokeWidth={2} />
              <span className="hidden sm:inline ml-2">실행 취소</span>
            </Button>
            <Button
              onClick={redo}
              disabled={!canRedo()}
              variant="outline"
              size="default"
              className="transition-colors"
              title="다시 실행 (Ctrl+Shift+Z)"
              aria-label="다시 실행"
            >
              <Redo2 size={18} strokeWidth={2} />
              <span className="hidden sm:inline ml-2">다시 실행</span>
            </Button>

            {/* 템플릿 - 태블릿 이상 */}
            <Button
              onClick={() => setIsTemplateSelectorOpen(true)}
              variant="outline"
              size="default"
              className="hidden md:flex items-center gap-2 transition-colors"
              title="템플릿 변경"
            >
              <Palette size={18} strokeWidth={2} />
              <span className="hidden lg:inline">템플릿</span>
            </Button>

            {/* 슬라이드 추가 - 태블릿 이상 */}
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              variant="outline"
              size="default"
              className="hidden md:flex items-center gap-2 transition-colors"
              title="현재 슬라이드 다음에 추가"
            >
              <Plus size={18} strokeWidth={2} />
              <span className="hidden lg:inline">추가</span>
            </Button>

            {/* 복제 - 데스크톱만 */}
            <Button
              onClick={handleDuplicateSlide}
              variant="outline"
              size="default"
              className="hidden lg:flex items-center gap-2 transition-colors"
              title="현재 슬라이드 복제"
            >
              <Copy size={18} strokeWidth={2} />
              <span>복제</span>
            </Button>

            {/* 삭제 - 데스크톱만 */}
            <Button
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={currentPresentation.slideData.slides.length <= 1}
              variant="outline"
              size="default"
              className="hidden lg:flex items-center gap-2 text-destructive hover:bg-transparent hover:text-destructive hover:border-destructive transition-colors"
              title="현재 슬라이드 삭제"
            >
              <Trash2 size={18} strokeWidth={2} />
              <span>삭제</span>
            </Button>

            {/* 저장 - 항상 표시 */}
            <Button
              onClick={handleSave}
              variant="outline"
              size="default"
              className="transition-colors"
              title="저장"
            >
              <Save size={18} strokeWidth={2} />
              <span className="hidden sm:inline ml-2">저장</span>
            </Button>

            {/* 저장 후 보기 - 태블릿 이상 */}
            <Button
              onClick={handleSaveAndView}
              variant="default"
              size="default"
              className="hidden md:flex items-center gap-2 transition-all duration-200 hover:scale-105"
              title="저장 후 보기"
            >
              <Eye size={18} strokeWidth={2} />
              <span className="hidden lg:inline">저장 후 보기</span>
            </Button>

            {/* 더보기 메뉴 - 모바일/태블릿 */}
            <div className="md:hidden">
              <MoreMenu items={moreMenuItems} />
            </div>

            {/* 닫기(X) 버튼 - 항상 표시 */}
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
              title="닫기"
              aria-label="닫기"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* 광고 - 상단 */}
      <div className="border-b border-gray-200 bg-white px-4 py-3 flex justify-center">
        <KakaoAdMobileThick />
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 좌측: 슬라이드 리스트 + 편집 폼 */}
        <div className="w-full md:w-2/5 lg:w-[35%] border-r border-gray-200 flex flex-col bg-white">
          {/* 슬라이드 리스트 영역 */}
          <SlideList
            slides={currentPresentation.slideData.slides}
            selectedIndex={selectedSlideIndex}
            onSelect={setSelectedSlideIndex}
            onReorder={reorderSlides}
          />

          {/* 편집 폼 영역 */}
          <div className="flex-1 overflow-y-auto p-6 bg-white">
            <div className="max-w-2xl mx-auto">
              <EditForm slide={currentSlide} onChange={handleSlideChange} />
            </div>
          </div>
        </div>

        {/* 우측: 실시간 미리보기 */}
        <div className="hidden md:block flex-1 bg-white overflow-hidden">
          <SlidePreview
            slide={currentSlide}
            templateId={currentPresentation.templateId}
          />
        </div>
      </div>

      {/* 모바일 안내 메시지 */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-lg">
        <p className="text-sm text-blue-800 text-center">
          💡 더 나은 편집 경험을 위해 데스크톱을 권장해요
        </p>
      </div>

      {/* 광고 - 하단 */}
      <div className="border-t border-gray-200 bg-white px-4 py-3 flex justify-center">
        <KakaoAdBanner />
      </div>

      {/* 슬라이드 추가 다이얼로그 */}
      <AddSlideDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddSlide}
      />

      {/* 슬라이드 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="슬라이드 삭제"
        message={`슬라이드 ${selectedSlideIndex + 1}을(를) 삭제하시겠어요?\n이 작업은 되돌릴 수 없어요.`}
        confirmLabel="삭제"
        cancelLabel="취소"
        confirmButtonColor="red"
        onConfirm={handleDeleteSlide}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />

      {/* 템플릿 선택 다이얼로그 */}
      <TemplateSelector
        isOpen={isTemplateSelectorOpen}
        currentTemplateId={currentPresentation.templateId || 'toss-default'}
        onSelect={changeTemplate}
        onClose={() => setIsTemplateSelectorOpen(false)}
      />
    </div>
  );
}
