/**
 * AddSlideDialog 컴포넌트
 * 새 슬라이드 타입 선택 다이얼로그
 */

'use client';

import type { SlideType } from '@/types/slide';
import {
  FileText,
  Pin,
  PenLine,
  ClipboardList,
  Columns2,
  Table,
  TrendingUp,
  TrendingDown,
  Scale,
  Calendar,
  MessageSquare,
  Heart,
  Lightbulb,
  ImageIcon,
  Smartphone,
  Users,
  RotateCw,
  Map,
  DollarSign,
  Images,
} from 'lucide-react';

interface AddSlideDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (slideType: SlideType) => void;
}

interface SlideTypeOption {
  type: SlideType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const slideTypeOptions: SlideTypeOption[] = [
  // 기본 슬라이드
  { type: 'title', label: '제목 슬라이드', description: '프리젠테이션 시작', icon: <FileText className="w-8 h-8" /> },
  { type: 'section', label: '섹션 구분', description: '새로운 섹션 시작', icon: <Pin className="w-8 h-8" /> },
  { type: 'content', label: '본문 슬라이드', description: '텍스트 중심 내용', icon: <PenLine className="w-8 h-8" /> },
  { type: 'bullet', label: '리스트 슬라이드', description: '불릿 포인트', icon: <ClipboardList className="w-8 h-8" /> },

  // 레이아웃
  { type: 'twoColumn', label: '2단 레이아웃', description: '좌우 비교', icon: <Columns2 className="w-8 h-8" /> },
  { type: 'image', label: '이미지 슬라이드', description: '단독 이미지', icon: <ImageIcon className="w-8 h-8" /> },
  { type: 'imageText', label: '이미지+텍스트', description: '이미지+텍스트 조합', icon: <ImageIcon className="w-8 h-8" /> },

  // 데이터 시각화
  { type: 'table', label: '표 슬라이드', description: '테이블 데이터', icon: <Table className="w-8 h-8" /> },
  { type: 'chart', label: '차트 슬라이드', description: '데이터 시각화', icon: <TrendingUp className="w-8 h-8" /> },
  { type: 'stats', label: '통계 슬라이드', description: '4개 통계 카드', icon: <TrendingDown className="w-8 h-8" /> },
  { type: 'comparison', label: '비교 슬라이드', description: '장단점 비교', icon: <Scale className="w-8 h-8" /> },

  // 타임라인 & 프로세스
  { type: 'timeline', label: '타임라인', description: '시간 흐름', icon: <Calendar className="w-8 h-8" /> },
  { type: 'roadmap', label: '로드맵', description: '타임라인 로드맵', icon: <Map className="w-8 h-8" /> },
  { type: 'process', label: '프로세스', description: '세로 플로우', icon: <RotateCw className="w-8 h-8" /> },

  // 소셜 & 인용
  { type: 'quote', label: '인용 슬라이드', description: '명언/인용문', icon: <MessageSquare className="w-8 h-8" /> },
  { type: 'testimonial', label: '추천사', description: '고객 추천사', icon: <MessageSquare className="w-8 h-8" /> },
  { type: 'teamProfile', label: '팀 프로필', description: '팀원 소개', icon: <Users className="w-8 h-8" /> },

  // 기능 & 상품
  { type: 'featureGrid', label: '기능 그리드', description: '3열 기능 카드', icon: <Smartphone className="w-8 h-8" /> },
  { type: 'pricing', label: '가격표', description: '가격 플랜', icon: <DollarSign className="w-8 h-8" /> },
  { type: 'agenda', label: '아젠다', description: '발표 아젠다', icon: <ClipboardList className="w-8 h-8" /> },
  { type: 'gallery', label: '갤러리', description: '이미지 갤러리', icon: <Images className="w-8 h-8" /> },

  // 마무리
  { type: 'thankYou', label: '감사 슬라이드', description: '마무리', icon: <Heart className="w-8 h-8" /> },
];

export default function AddSlideDialog({ isOpen, onClose, onAdd }: AddSlideDialogProps) {
  if (!isOpen) return null;

  const handleAdd = (type: SlideType) => {
    onAdd(type);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[85vh] overflow-y-auto shadow-xl border-4 border-primary"
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
          <p className="flex items-center gap-2 text-sm text-gray-600">
            <Lightbulb className="w-4 h-4 flex-shrink-0" />
            <span><strong>팁</strong>: 슬라이드 타입을 선택하면 현재 위치 다음에 추가돼요</span>
          </p>
        </div>
      </div>
    </div>
  );
}
