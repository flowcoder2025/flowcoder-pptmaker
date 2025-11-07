/**
 * TwoColumnSlideForm 컴포넌트
 * 2단 슬라이드 편집 폼
 */

'use client';

import type { TwoColumnSlide } from '@/types/slide';

interface TwoColumnSlideFormProps {
  slide: TwoColumnSlide;
  onChange: (updatedSlide: TwoColumnSlide) => void;
}

export default function TwoColumnSlideForm({ slide, onChange }: TwoColumnSlideFormProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        title: e.target.value,
      },
    });
  };

  const handleLeftContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        leftContent: e.target.value,
      },
    });
  };

  const handleRightContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        rightContent: e.target.value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">2단 슬라이드 편집</h3>
        <p className="text-sm text-gray-600 mb-6">
          제목과 좌우 컬럼의 내용을 입력하세요
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
          <div>
            <label htmlFor="leftContent" className="block text-sm font-medium text-gray-700 mb-2">
              좌측 컬럼 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="leftContent"
              value={slide.props.leftContent}
              onChange={handleLeftContentChange}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="좌측 컬럼 내용을 입력하세요"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              ← 좌측 영역
            </p>
          </div>

          <div>
            <label htmlFor="rightContent" className="block text-sm font-medium text-gray-700 mb-2">
              우측 컬럼 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="rightContent"
              value={slide.props.rightContent}
              onChange={handleRightContentChange}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="우측 컬럼 내용을 입력하세요"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              우측 영역 →
            </p>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <p className="text-xs text-indigo-700">
          📑 두 컬럼은 슬라이드에서 50:50 비율로 나란히 표시돼요
        </p>
      </div>
    </div>
  );
}
