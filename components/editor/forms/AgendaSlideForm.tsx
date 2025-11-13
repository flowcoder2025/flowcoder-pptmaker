/**
 * AgendaSlideForm 컴포넌트
 * 아젠다 슬라이드 편집 폼
 */

'use client';

import { Lightbulb, ClipboardList } from 'lucide-react';
import type { AgendaSlide } from '@/types/slide';

interface AgendaSlideFormProps {
  slide: AgendaSlide;
  onChange: (updatedSlide: AgendaSlide) => void;
}

export default function AgendaSlideForm({
  slide,
  onChange,
}: AgendaSlideFormProps) {
  // ✅ items가 없을 때 기본값 설정
  const items = slide.props.items || [];

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
    field: 'title' | 'description',
    value: string
  ) => {
    const newItems = [...items];
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
    const newItems = [...items, { title: '', description: '' }];
    onChange({
      ...slide,
      props: {
        ...slide.props,
        items: newItems,
      },
    });
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      alert('최소 1개의 항목이 필요해요');
      return;
    }
    const newItems = items.filter((_, i) => i !== index);
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
          아젠다 슬라이드 편집
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          번호가 매겨진 아젠다 목록을 작성하세요
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
              아젠다 항목 <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleAddItem}
              disabled={items.length >= 8}
              className={`text-sm font-medium ${
                items.length >= 8
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-blue-600 hover:text-blue-700'
              }`}
              title={items.length >= 8 ? '최대 8개까지만 추가할 수 있어요' : ''}
            >
              + 항목 추가
            </button>
          </div>

          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500 mb-3">아직 항목이 없어요</p>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  첫 항목 추가하기
                </button>
              </div>
            ) : (
              items.map((item, index) => (
              <div
                key={index}
                className="border border-gray-300 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500">
                    항목 {index + 1}
                  </span>
                  {items.length > 1 && (
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

                <div>
                  <label
                    htmlFor={`agenda-title-${index}`}
                    className="block text-xs font-medium text-gray-600 mb-1"
                  >
                    제목
                  </label>
                  <input
                    id={`agenda-title-${index}`}
                    type="text"
                    value={item.title}
                    onChange={(e) =>
                      handleItemChange(index, 'title', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="예: 프로젝트 개요"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor={`agenda-desc-${index}`}
                    className="block text-xs font-medium text-gray-600 mb-1"
                  >
                    설명
                  </label>
                  <textarea
                    id={`agenda-desc-${index}`}
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
              ))
            )}
          </div>

          <p className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
            <Lightbulb className="w-3.5 h-3.5 flex-shrink-0" />
            <span>각 항목은 큰 번호와 함께 세로로 표시돼요 (최대 8개)</span>
          </p>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="flex items-center gap-1.5 text-xs text-purple-700">
          <ClipboardList className="w-3.5 h-3.5 flex-shrink-0" />
          <span>아젠다는 1, 2, 3 형태로 자동 번호가 매겨져요</span>
        </p>
      </div>
    </div>
  );
}
