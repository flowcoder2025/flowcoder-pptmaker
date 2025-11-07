/**
 * SectionSlideForm 컴포넌트
 * 섹션 슬라이드 편집 폼
 */

'use client';

import type { SectionSlide } from '@/types/slide';

interface SectionSlideFormProps {
  slide: SectionSlide;
  onChange: (updatedSlide: SectionSlide) => void;
}

export default function SectionSlideForm({ slide, onChange }: SectionSlideFormProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        title: e.target.value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">섹션 슬라이드 편집</h3>
        <p className="text-sm text-gray-600 mb-6">
          프리젠테이션 섹션을 구분하는 제목을 입력하세요
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            섹션 제목 <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={slide.props.title}
            onChange={handleTitleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            placeholder="섹션 제목을 입력하세요"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 다음 내용의 주제를 명확하게 표현하세요
          </p>
        </div>
      </div>

      <div className="bg-gray-100 border border-gray-300 rounded-lg p-6">
        <div className="text-center">
          <div className="text-3xl mb-2">📌</div>
          <p className="text-sm font-medium text-gray-700 mb-1">섹션 구분 슬라이드</p>
          <p className="text-xs text-gray-600">
            어두운 배경에 큰 제목으로 표시되어 내용을 구분해요
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-700">
            <strong>사용 예시:</strong> &ldquo;1부: 문제 정의&rdquo; → &ldquo;2부: 해결 방안&rdquo; → &ldquo;3부: 실행 계획&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
