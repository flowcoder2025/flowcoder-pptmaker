/**
 * TestimonialSlideForm 컴포넌트
 * 추천사 슬라이드 편집 폼
 */

'use client';

import type { TestimonialSlide } from '@/types/slide';

interface TestimonialSlideFormProps {
  slide: TestimonialSlide;
  onChange: (updatedSlide: TestimonialSlide) => void;
}

export default function TestimonialSlideForm({
  slide,
  onChange,
}: TestimonialSlideFormProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        title: e.target.value,
      },
    });
  };

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

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        role: e.target.value,
      },
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        image: e.target.value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          추천사 슬라이드 편집
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          고객이나 파트너의 추천사를 표시하세요
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
          <label
            htmlFor="quote"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            추천 문구 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="quote"
            value={slide.props.quote}
            onChange={handleQuoteChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={5}
            placeholder="추천사 내용을 입력하세요"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 2-3줄 정도가 가장 읽기 좋아요
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="author"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              작성자 이름 <span className="text-red-500">*</span>
            </label>
            <input
              id="author"
              type="text"
              value={slide.props.author}
              onChange={handleAuthorChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="예: 김철수"
              required
            />
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              직책/소속 <span className="text-red-500">*</span>
            </label>
            <input
              id="role"
              type="text"
              value={slide.props.role}
              onChange={handleRoleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="예: CEO, ABC회사"
              required
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            프로필 이미지 URL (선택)
          </label>
          <input
            id="image"
            type="url"
            value={slide.props.image || ''}
            onChange={handleImageChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com/image.jpg"
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 미입력 시 기본 이미지가 표시돼요
          </p>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-xs text-purple-700">
          💬 추천사는 큰 따옴표와 함께 중앙 정렬로 표시돼요
        </p>
      </div>
    </div>
  );
}
