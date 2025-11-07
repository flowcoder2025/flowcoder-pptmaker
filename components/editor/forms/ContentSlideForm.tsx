/**
 * ContentSlideForm 컴포넌트
 * 내용 슬라이드 편집 폼
 */

'use client';

import type { ContentSlide } from '@/types/slide';

interface ContentSlideFormProps {
  slide: ContentSlide;
  onChange: (updatedSlide: ContentSlide) => void;
}

export default function ContentSlideForm({ slide, onChange }: ContentSlideFormProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        title: e.target.value,
      },
    });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        body: e.target.value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">내용 슬라이드 편집</h3>
        <p className="text-sm text-gray-600 mb-6">
          슬라이드의 제목과 본문 내용을 입력하세요
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
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            본문 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            value={typeof slide.props.body === 'string' ? slide.props.body : slide.props.body.join('\n')}
            onChange={handleContentChange}
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="본문 내용을 입력하세요&#10;&#10;여러 줄로 작성할 수 있어요"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 명확하고 간결한 내용을 작성하세요 (3-5줄 권장)
          </p>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-xs text-green-700">
          📝 내용은 슬라이드에 자동으로 줄바꿈되어 표시돼요
        </p>
      </div>
    </div>
  );
}
