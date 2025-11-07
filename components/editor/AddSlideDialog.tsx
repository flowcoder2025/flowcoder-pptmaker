/**
 * AddSlideDialog 컴포넌트
 * 새 슬라이드 타입 선택 다이얼로그
 */

'use client';

import type { SlideType } from '@/types/slide';

interface AddSlideDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (slideType: SlideType) => void;
}

interface SlideTypeOption {
  type: SlideType;
  label: string;
  description: string;
  icon: string;
}

const slideTypeOptions: SlideTypeOption[] = [
  { type: 'title', label: '제목 슬라이드', description: '프리젠테이션 시작', icon: '📄' },
  { type: 'section', label: '섹션 구분', description: '새로운 섹션 시작', icon: '📌' },
  { type: 'content', label: '본문 슬라이드', description: '텍스트 중심 내용', icon: '📝' },
  { type: 'bullet', label: '리스트 슬라이드', description: '불릿 포인트', icon: '📋' },
  { type: 'twoColumn', label: '2단 레이아웃', description: '좌우 비교', icon: '📑' },
  { type: 'table', label: '표 슬라이드', description: '테이블 데이터', icon: '📊' },
  { type: 'chart', label: '차트 슬라이드', description: '데이터 시각화', icon: '📈' },
  { type: 'stats', label: '통계 슬라이드', description: '4개 통계 카드', icon: '📉' },
  { type: 'comparison', label: '비교 슬라이드', description: '장단점 비교', icon: '⚖️' },
  { type: 'timeline', label: '타임라인', description: '시간 흐름', icon: '📅' },
  { type: 'quote', label: '인용 슬라이드', description: '명언/인용문', icon: '💬' },
  { type: 'thankYou', label: '감사 슬라이드', description: '마무리', icon: '🙏' },
];

export default function AddSlideDialog({ isOpen, onClose, onAdd }: AddSlideDialogProps) {
  if (!isOpen) return null;

  const handleAdd = (type: SlideType) => {
    onAdd(type);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[85vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">슬라이드 추가</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
            title="닫기"
          >
            ✕
          </button>
        </div>

        {/* 슬라이드 타입 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {slideTypeOptions.map(({ type, label, description, icon }) => (
            <button
              key={type}
              onClick={() => handleAdd(type)}
              className="
                border-2 border-gray-200 rounded-lg p-4 text-left
                hover:border-blue-500 hover:bg-blue-50
                transition-all duration-200
                group
              "
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl flex-shrink-0">{icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600">
                    {label}
                  </div>
                  <div className="text-sm text-gray-600">{description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* 도움말 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            💡 <strong>팁</strong>: 슬라이드 타입을 선택하면 현재 위치 다음에 추가돼요
          </p>
        </div>
      </div>
    </div>
  );
}
