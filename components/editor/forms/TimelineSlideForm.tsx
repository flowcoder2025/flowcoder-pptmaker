/**
 * TimelineSlideForm 컴포넌트
 * 타임라인 슬라이드 편집 폼
 */

'use client';

import type { TimelineSlide } from '@/types/slide';

interface TimelineSlideFormProps {
  slide: TimelineSlide;
  onChange: (updatedSlide: TimelineSlide) => void;
}

export default function TimelineSlideForm({ slide, onChange }: TimelineSlideFormProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        title: e.target.value,
      },
    });
  };

  const handleItemChange = (index: number, field: 'title' | 'description', value: string) => {
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
    const newItems = [...slide.props.items, { title: '', description: '' }];
    onChange({
      ...slide,
      props: {
        ...slide.props,
        items: newItems,
      },
    });
  };

  const handleRemoveItem = (index: number) => {
    if (slide.props.items.length <= 1) {
      alert('최소 1개의 타임라인 항목이 필요해요');
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
        <h3 className="text-lg font-bold text-gray-900 mb-4">타임라인 슬라이드 편집</h3>
        <p className="text-sm text-gray-600 mb-6">
          시간 순서대로 흐름을 표현하세요
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
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
              타임라인 항목 <span className="text-red-500">*</span>
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
              <div key={index} className="border border-gray-300 rounded-lg p-4 space-y-3 relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full">
                      {index + 1}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">
                      타임라인 항목
                    </span>
                  </div>
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

                <div>
                  <label htmlFor={`item-title-${index}`} className="block text-xs font-medium text-gray-600 mb-1">
                    단계 제목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`item-title-${index}`}
                    type="text"
                    value={item.title}
                    onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="예: 2024년 Q1"
                    required
                  />
                </div>

                <div>
                  <label htmlFor={`item-description-${index}`} className="block text-xs font-medium text-gray-600 mb-1">
                    설명 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id={`item-description-${index}`}
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="이 단계에서 일어난 일을 설명하세요"
                    required
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-2">
            💡 시간순, 단계순으로 배치돼요
          </p>
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <p className="text-xs text-orange-700">
          🕒 타임라인은 시간 흐름이나 단계별 진행 과정을 표현해요
        </p>
      </div>
    </div>
  );
}
