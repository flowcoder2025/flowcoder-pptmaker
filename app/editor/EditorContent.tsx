/**
 * Editor 페이지
 * Phase 2: 프리젠테이션 편집 기능
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Save, Eye, Undo2, Redo2, Palette, Plus, Copy, Trash2, Loader2, CheckCircle, XCircle, AlertCircle, Lightbulb } from 'lucide-react';
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
  const [showSaveSuccessDialog, setShowSaveSuccessDialog] = useState(false);
  const [showSaveErrorDialog, setShowSaveErrorDialog] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState('');
  const [showDeleteWarningDialog, setShowDeleteWarningDialog] = useState(false);

  // 변경사항 추적 및 종료 확인 모달
  const [isDirty, setIsDirty] = useState(false);
  const [showExitConfirmDialog, setShowExitConfirmDialog] = useState(false);

  // URL에서 from 파라미터 추출 (어디서 왔는지)
  const from = searchParams.get('from') || 'viewer'; // 기본값: viewer

  // Viewer의 원래 진입점 추출 (History → Viewer → Editor 체인을 위해)
  const viewerFrom = searchParams.get('viewerFrom');

  // 최초 진입점 추출 (history, input 등)
  const origin = searchParams.get('origin') || 'input';

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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground text-lg">불러오고 있어요...</p>
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
      setIsDirty(false); // 저장 성공 시 변경사항 초기화
      setShowSaveSuccessDialog(true);
    } catch (error) {
      console.error('저장 실패:', error);
      setSaveErrorMessage(error instanceof Error ? error.message : '알 수 없는 오류가 발생했어요');
      setShowSaveErrorDialog(true);
    }
  };

  const handleSaveAndView = async () => {
    try {
      await savePresentation();
      const id = currentPresentation?.id;
      const url = id
        ? `/viewer?id=${id}&from=editor&origin=${origin}`
        : `/viewer?from=editor&origin=${origin}`;
      router.push(url);
    } catch (error) {
      console.error('저장 실패:', error);
      setSaveErrorMessage(error instanceof Error ? error.message : '알 수 없는 오류가 발생했어요');
      setShowSaveErrorDialog(true);
    }
  };

  // 저장하지 않고 나가기 (실제 종료 로직)
  const handleCloseWithoutSaving = () => {
    // origin이 있으면 최초 진입점으로 직접 이동
    if (origin === 'history') {
      router.push('/history');
    } else if (origin === 'input') {
      router.push('/input');
    } else if (from === 'history') {
      // History에서 직접 온 경우
      router.push('/history');
    } else if (from === 'viewer') {
      // Viewer에서 온 경우: Viewer의 원래 진입점으로 돌아갈 수 있도록 from 파라미터 전달, origin도 함께 전달
      const id = searchParams.get('id');
      const fromParam = viewerFrom ? `&from=${viewerFrom}` : '';
      const url = id ? `/viewer?id=${id}${fromParam}&origin=${origin}` : `/viewer${fromParam}&origin=${origin}`;
      router.push(url);
    } else {
      // 기타 경우 (기본값)
      const id = searchParams.get('id');
      const url = id ? `/viewer?id=${id}` : '/viewer';
      router.push(url);
    }
  };

  // 저장하고 나가기
  const handleSaveAndClose = async () => {
    await handleSave();
    setIsDirty(false);
    setShowExitConfirmDialog(false);
    handleCloseWithoutSaving();
  };

  // 뒤로가기/닫기: 변경사항이 있으면 확인 모달 표시
  const handleClose = () => {
    if (isDirty) {
      setShowExitConfirmDialog(true);
      return;
    }
    handleCloseWithoutSaving();
  };

  const currentSlide = currentPresentation.slideData.slides[selectedSlideIndex];

  const handleSlideChange = (updatedSlide: typeof currentSlide) => {
    updateSlide(selectedSlideIndex, updatedSlide);
    setIsDirty(true); // 변경사항 표시
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
      setIsDeleteDialogOpen(false);
      setShowDeleteWarningDialog(true);
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
      icon: <Palette className="w-5 h-5" />,
      onClick: () => setIsTemplateSelectorOpen(true),
    },
    {
      label: '슬라이드 추가',
      icon: <Plus className="w-5 h-5" />,
      onClick: () => setIsAddDialogOpen(true),
    },
    {
      label: '슬라이드 복제',
      icon: <Copy className="w-5 h-5" />,
      onClick: handleDuplicateSlide,
    },
    {
      label: '슬라이드 삭제',
      icon: <Trash2 className="w-5 h-5" />,
      onClick: () => setIsDeleteDialogOpen(true),
      disabled: currentPresentation.slideData.slides.length <= 1,
      variant: 'danger' as const,
    },
    {
      label: '저장 후 보기',
      icon: <Eye className="w-5 h-5" />,
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
              className="p-2 rounded-lg shrink-0 flex items-center gap-1 text-gray-700 hover:text-primary hover:scale-[1.02] transition-all duration-200"
              title="닫기"
              aria-label="닫기"
            >
              <svg
                className="w-6 h-6"
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
              <span className="text-sm font-medium">닫기</span>
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
        <p className="flex items-center justify-center gap-2 text-sm text-blue-800">
          <Lightbulb className="w-4 h-4" />
          더 나은 편집 경험을 위해 데스크톱을 권장해요
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

      {/* 저장 성공 모달 */}
      {showSaveSuccessDialog && (
        <div
          onClick={() => setShowSaveSuccessDialog(false)}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <Card
            onClick={(e) => e.stopPropagation()}
            className="relative p-8 max-w-md w-full mx-4 bg-white shadow-2xl border-4 border-primary rounded-2xl"
          >
            {/* 닫기 버튼 */}
            <button
              onClick={() => setShowSaveSuccessDialog(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="닫기"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* 성공 아이콘 */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 flex items-center justify-center">
                <CheckCircle size={48} className="text-green-500" strokeWidth={1.5} />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
              저장했어요
            </h3>

            <p className="text-gray-600 mb-6 text-center">
              프리젠테이션이 성공적으로 저장됐어요
            </p>

            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => setShowSaveSuccessDialog(false)}
                size="lg"
                className="px-8 bg-green-500 hover:bg-green-600 text-white"
              >
                확인
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* 저장 실패 모달 */}
      {showSaveErrorDialog && (
        <div
          onClick={() => setShowSaveErrorDialog(false)}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <Card
            onClick={(e) => e.stopPropagation()}
            className="relative p-8 max-w-md w-full mx-4 bg-white shadow-2xl border-4 border-primary rounded-2xl"
          >
            {/* 닫기 버튼 */}
            <button
              onClick={() => setShowSaveErrorDialog(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="닫기"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* 에러 아이콘 */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 flex items-center justify-center">
                <XCircle size={48} className="text-red-500" strokeWidth={1.5} />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
              저장에 실패했어요
            </h3>

            <p className="text-gray-600 mb-2 text-center">
              {saveErrorMessage || '알 수 없는 오류가 발생했어요'}
            </p>
            <p className="text-gray-600 mb-6 text-center text-sm">
              다시 시도해주세요
            </p>

            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => setShowSaveErrorDialog(false)}
                size="lg"
                className="px-8 bg-red-500 hover:bg-red-600 text-white"
              >
                확인
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* 마지막 슬라이드 삭제 경고 모달 */}
      {showDeleteWarningDialog && (
        <div
          onClick={() => setShowDeleteWarningDialog(false)}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <Card
            onClick={(e) => e.stopPropagation()}
            className="relative p-8 max-w-md w-full mx-4 bg-white shadow-2xl border-4 border-primary rounded-2xl"
          >
            {/* 닫기 버튼 */}
            <button
              onClick={() => setShowDeleteWarningDialog(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="닫기"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* 경고 아이콘 */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 flex items-center justify-center">
                <XCircle size={48} className="text-yellow-500" strokeWidth={1.5} />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
              삭제할 수 없어요
            </h3>

            <p className="text-gray-600 mb-6 text-center">
              마지막 슬라이드는 삭제할 수 없어요
            </p>

            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => setShowDeleteWarningDialog(false)}
                size="lg"
                className="px-8 bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                확인
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* 종료 확인 모달 */}
      {showExitConfirmDialog && (
        <div
          onClick={() => setShowExitConfirmDialog(false)}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <Card
            onClick={(e) => e.stopPropagation()}
            className="relative p-8 max-w-md w-full mx-4 bg-white shadow-2xl border-4 border-primary rounded-2xl"
          >
            {/* 닫기 버튼 */}
            <button
              onClick={() => setShowExitConfirmDialog(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="닫기"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* 경고 아이콘 */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 flex items-center justify-center">
                <AlertCircle size={48} className="text-orange-500" strokeWidth={1.5} />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
              편집 내용이 사라져요
            </h3>

            <p className="text-gray-600 mb-6 text-center">
              저장하지 않은 변경사항이 사라져요.<br />
              계속하시겠어요?
            </p>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleSaveAndClose}
                size="lg"
                className="w-full bg-primary text-white hover:scale-[1.02] transition-transform duration-200"
              >
                저장하고 나가기
              </Button>
              <Button
                onClick={() => {
                  setIsDirty(false);
                  setShowExitConfirmDialog(false);
                  handleCloseWithoutSaving();
                }}
                size="lg"
                variant="destructive"
                className="w-full hover:bg-destructive hover:scale-[1.02] transition-transform duration-200"
              >
                저장하지 않고 나가기
              </Button>
              <Button
                onClick={() => setShowExitConfirmDialog(false)}
                size="lg"
                variant="outline"
                className="w-full"
              >
                취소
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
