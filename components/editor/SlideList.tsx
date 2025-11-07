/**
 * SlideList 컴포넌트
 * 슬라이드 목록 표시, 선택, Drag & Drop 재정렬 기능
 */

'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Slide } from '@/types/slide';

interface SlideListProps {
  slides: Slide[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
}

/**
 * 슬라이드 타입에 따른 아이콘 반환
 */
function getSlideIcon(type: string): string {
  const iconMap: Record<string, string> = {
    title: '📄',
    content: '📝',
    bullet: '📋',
    section: '📌',
    table: '📊',
    chart: '📈',
    stats: '📉',
    comparison: '⚖️',
    timeline: '📅',
    quote: '💬',
    thankYou: '🙏',
    twoColumn: '📑',
    // 9개 새 슬라이드 타입
    featureGrid: '📱',
    teamProfile: '👥',
    process: '🔄',
    roadmap: '🗓️',
    pricing: '💰',
    imageText: '🖼️',
    agenda: '📋',
    testimonial: '💬',
    gallery: '🖼️',
  };
  return iconMap[type] || '📄';
}

/**
 * 슬라이드 타입에 따른 한글 이름 반환
 */
function getSlideTypeName(type: string): string {
  const nameMap: Record<string, string> = {
    title: '제목',
    content: '내용',
    bullet: '목록',
    section: '섹션',
    table: '표',
    chart: '차트',
    stats: '통계',
    comparison: '비교',
    timeline: '타임라인',
    quote: '인용',
    thankYou: '감사',
    twoColumn: '2단',
    // 9개 새 슬라이드 타입
    featureGrid: '기능 그리드',
    teamProfile: '팀 프로필',
    process: '프로세스',
    roadmap: '로드맵',
    pricing: '가격표',
    imageText: '이미지+텍스트',
    agenda: '아젠다',
    testimonial: '추천사',
    gallery: '갤러리',
  };
  return nameMap[type] || type;
}

/**
 * 개별 슬라이드 아이템 (Sortable)
 */
interface SortableSlideItemProps {
  slide: Slide;
  index: number;
  isSelected: boolean;
  onSelect: (index: number) => void;
}

function SortableSlideItem({ slide, index, isSelected, onSelect }: SortableSlideItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `slide-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const icon = getSlideIcon(slide.type);
  const typeName = getSlideTypeName(slide.type);

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onSelect(index)}
      className={`
        flex-shrink-0 w-36 h-24 rounded-lg overflow-hidden
        transition-all duration-200
        ${
          isSelected
            ? 'border-2 border-blue-500 ring-2 ring-blue-200 shadow-md scale-105'
            : 'border-2 border-gray-300 hover:border-gray-400 hover:shadow-sm'
        }
        ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
      `}
      title={`슬라이드 ${index + 1}: ${typeName} (드래그하여 순서 변경)`}
    >
      <div className="h-full bg-white flex flex-col items-center justify-center p-2">
        {/* 슬라이드 번호 */}
        <div
          className={`
            text-xs font-bold mb-1
            ${isSelected ? 'text-blue-600' : 'text-gray-500'}
          `}
        >
          #{index + 1}
        </div>

        {/* 아이콘 */}
        <div className="text-2xl mb-1">{icon}</div>

        {/* 타입 이름 */}
        <div
          className={`
            text-xs font-medium
            ${isSelected ? 'text-blue-600' : 'text-gray-600'}
          `}
        >
          {typeName}
        </div>
      </div>
    </button>
  );
}

export default function SlideList({ slides, selectedIndex, onSelect, onReorder }: SlideListProps) {
  // Drag & Drop 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px 이동 후 드래그 시작 (클릭과 구분)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 드래그 종료 처리
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = slides.findIndex((_, i) => `slide-${i}` === active.id);
      const newIndex = slides.findIndex((_, i) => `slide-${i}` === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(oldIndex, newIndex);
      }
    }
  };

  // 슬라이드 ID 배열 생성
  const slideIds = slides.map((_, index) => `slide-${index}`);

  return (
    <div className="border-b border-gray-200 bg-gray-50">
      <div className="px-4 py-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">
            슬라이드 <span className="text-xs text-gray-500">(드래그하여 순서 변경)</span>
          </h3>
          <span className="text-xs text-gray-500">
            {selectedIndex + 1} / {slides.length}
          </span>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={slideIds} strategy={horizontalListSortingStrategy}>
            <div className="flex gap-3 overflow-x-auto py-3 px-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {slides.map((slide, index) => (
                <SortableSlideItem
                  key={`slide-${index}`}
                  slide={slide}
                  index={index}
                  isSelected={index === selectedIndex}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
