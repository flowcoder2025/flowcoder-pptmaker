/**
 * QuoteSlideForm 컴포넌트
 * 인용 슬라이드 편집 폼
 */

'use client';

import type { QuoteSlide } from '@/types/slide';

interface QuoteSlideFormProps {
  slide: QuoteSlide;
  onChange: (updatedSlide: QuoteSlide) => void;
}

export default function QuoteSlideForm({ slide, onChange }: QuoteSlideFormProps) {
  const handleQuoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        quote: e.target.value,
      },
    });
  };

  const handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        author: e.target.value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">인용 슬라이드 편집</h3>
        <p className="text-sm text-gray-600 mb-6">
          인용문과 출처를 입력하세요
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="quote" className="block text-sm font-medium text-gray-700 mb-2">
            인용문 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="quote"
            value={slide.props.quote}
            onChange={handleQuoteChange}
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none italic"
            placeholder="인용하고 싶은 문구를 입력하세요"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 임팩트 있는 명언이나 핵심 메시지를 인용하세요
          </p>
        </div>

        <div>
          <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
            출처/저자 <span className="text-red-500">*</span>
          </label>
          <input
            id="author"
            type="text"
            value={slide.props.author}
            onChange={handleAuthorChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="예: 스티브 잡스, CEO"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            📝 이름, 직함, 출처 등을 명확히 표기하세요
          </p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-xs text-yellow-700 italic text-center">
          💬 인용문은 큰 따옴표와 함께 이탤릭체로 표시돼요
        </p>
      </div>
    </div>
  );
}
