/**
 * RoadmapSlideForm 컴포넌트
 * 로드맵 슬라이드 편집 폼
 */

'use client';

import { logger } from '@/lib/logger';
import { Lightbulb, Calendar } from 'lucide-react';
import type { RoadmapSlide } from '@/types/slide';

interface RoadmapSlideFormProps {
  slide: RoadmapSlide;
  onChange: (updatedSlide: RoadmapSlide) => void;
}

export default function RoadmapSlideForm({
  slide,
  onChange,
}: RoadmapSlideFormProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        title: e.target.value,
      },
    });
  };

  const handleItemChange = (
    index: number,
    field: 'period' | 'status' | 'title' | 'description',
    value: string
  ) => {
    const newItems = [...slide.props.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    onChange({
      ...slide,
      props: {
        ...slide.props,
        items: newItems,
      },
    });
  };

  const handleAddItem = () => {
    logger.debug('RoadmapForm 항목 추가 시작', {
      현재항목수: slide.props.items.length,
    });

    const newItems = [
      ...slide.props.items,
      { period: '', status: 'Planned', title: '', description: '' },
    ];

    const updatedSlide = {
      ...slide,
      props: {
        ...slide.props,
        items: newItems,
      },
    };

    logger.debug('RoadmapForm onChange 호출', {
      새항목수: newItems.length,
      슬라이드타입: updatedSlide.type,
    });

    onChange(updatedSlide);
  };

  const handleRemoveItem = (index: number) => {
    if (slide.props.items.length <= 1) {
      alert('최소 1개의 항목이 필요해요');
      return;
    }
    const newItems = slide.props.items.filter((_, i) => i !== index);
    onChange({
      ...slide,
      props: {
        ...slide.props,
        items: newItems,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          로드맵 슬라이드 편집
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          타임라인 형태로 프로젝트 로드맵을 표시하세요
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={slide.props.title}
            onChange={handleTitleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="슬라이드 제목을 입력하세요"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              로드맵 항목 <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleAddItem}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + 항목 추가
            </button>
          </div>

          <div className="space-y-4">
            {slide.props.items.map((item, index) => (
              <div
                key={index}
                className="border border-gray-300 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500">
                    항목 {index + 1}
                  </span>
                  {slide.props.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-500 hover:text-red-600 text-sm"
                      aria-label="항목 삭제"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor={`period-${index}`}
                      className="block text-xs font-medium text-gray-600 mb-1"
                    >
                      기간
                    </label>
                    <input
                      id={`period-${index}`}
                      type="text"
                      value={item.period}
                      onChange={(e) =>
                        handleItemChange(index, 'period', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="예: Q1 2026"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`status-${index}`}
                      className="block text-xs font-medium text-gray-600 mb-1"
                    >
                      상태
                    </label>
                    <select
                      id={`status-${index}`}
                      value={item.status}
                      onChange={(e) =>
                        handleItemChange(index, 'status', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="In Progress">In Progress</option>
                      <option value="Planned">Planned</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor={`roadmap-title-${index}`}
                    className="block text-xs font-medium text-gray-600 mb-1"
                  >
                    제목
                  </label>
                  <input
                    id={`roadmap-title-${index}`}
                    type="text"
                    value={item.title}
                    onChange={(e) =>
                      handleItemChange(index, 'title', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="예: 코어 엔진 개발"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor={`roadmap-desc-${index}`}
                    className="block text-xs font-medium text-gray-600 mb-1"
                  >
                    설명
                  </label>
                  <textarea
                    id={`roadmap-desc-${index}`}
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(index, 'description', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={2}
                    placeholder="항목에 대한 간단한 설명을 입력하세요"
                    required
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
            <Lightbulb className="w-3.5 h-3.5 flex-shrink-0" />
            <span>In Progress는 파란색, Planned는 회색으로 표시돼요</span>
          </p>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="flex items-center gap-1.5 text-xs text-purple-700">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          <span>로드맵은 타임라인 형태로 기간, 상태, 제목, 설명이 표시돼요</span>
        </p>
      </div>
    </div>
  );
}
