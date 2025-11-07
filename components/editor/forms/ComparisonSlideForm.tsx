/**
 * ComparisonSlideForm 컴포넌트
 * 비교 슬라이드 편집 폼
 */

'use client';

import type { ComparisonSlide } from '@/types/slide';

interface ComparisonSlideFormProps {
  slide: ComparisonSlide;
  onChange: (updatedSlide: ComparisonSlide) => void;
}

export default function ComparisonSlideForm({ slide, onChange }: ComparisonSlideFormProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        title: e.target.value,
      },
    });
  };

  const handleFieldChange = (
    field: 'leftLabel' | 'rightLabel' | 'leftContent' | 'rightContent' | 'leftImage' | 'rightImage',
    value: string
  ) => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">비교 슬라이드 편집</h3>
        <p className="text-sm text-gray-600 mb-6">
          두 가지 항목을 나란히 비교하세요
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 좌측 영역 */}
          <div className="border border-gray-300 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-blue-600">← 좌측</span>
            </div>

            <div>
              <label htmlFor="leftLabel" className="block text-xs font-medium text-gray-600 mb-1">
                라벨 (선택)
              </label>
              <input
                id="leftLabel"
                type="text"
                value={slide.props.leftLabel || ''}
                onChange={(e) => handleFieldChange('leftLabel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="예: Before"
              />
            </div>

            <div>
              <label htmlFor="leftContent" className="block text-xs font-medium text-gray-600 mb-1">
                내용 (선택)
              </label>
              <textarea
                id="leftContent"
                value={slide.props.leftContent || ''}
                onChange={(e) => handleFieldChange('leftContent', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="좌측 내용을 입력하세요"
              />
            </div>

            <div>
              <label htmlFor="leftImage" className="block text-xs font-medium text-gray-600 mb-1">
                이미지 URL (선택)
              </label>
              <input
                id="leftImage"
                type="text"
                value={slide.props.leftImage || ''}
                onChange={(e) => handleFieldChange('leftImage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* 우측 영역 */}
          <div className="border border-gray-300 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-green-600">우측 →</span>
            </div>

            <div>
              <label htmlFor="rightLabel" className="block text-xs font-medium text-gray-600 mb-1">
                라벨 (선택)
              </label>
              <input
                id="rightLabel"
                type="text"
                value={slide.props.rightLabel || ''}
                onChange={(e) => handleFieldChange('rightLabel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="예: After"
              />
            </div>

            <div>
              <label htmlFor="rightContent" className="block text-xs font-medium text-gray-600 mb-1">
                내용 (선택)
              </label>
              <textarea
                id="rightContent"
                value={slide.props.rightContent || ''}
                onChange={(e) => handleFieldChange('rightContent', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="우측 내용을 입력하세요"
              />
            </div>

            <div>
              <label htmlFor="rightImage" className="block text-xs font-medium text-gray-600 mb-1">
                이미지 URL (선택)
              </label>
              <input
                id="rightImage"
                type="text"
                value={slide.props.rightImage || ''}
                onChange={(e) => handleFieldChange('rightImage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
        <p className="text-xs text-teal-700">
          ⚖️ 좌우를 나란히 비교해요. Before/After, A안 vs B안 등에 유용해요
        </p>
      </div>
    </div>
  );
}
