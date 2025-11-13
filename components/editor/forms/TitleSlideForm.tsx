/**
 * TitleSlideForm 컴포넌트
 * 제목 슬라이드 편집 폼
 */

'use client';

import { Lightbulb, Pin, CheckCircle2 } from 'lucide-react';
import type { TitleSlide } from '@/types/slide';

interface TitleSlideFormProps {
  slide: TitleSlide;
  onChange: (updatedSlide: TitleSlide) => void;
}

export default function TitleSlideForm({ slide, onChange }: TitleSlideFormProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        title: e.target.value,
      },
    });
  };

  const handleSubtitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        subtitle: e.target.value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">제목 슬라이드 편집</h3>
        <p className="text-sm text-gray-600 mb-6">
          프리젠테이션의 제목과 부제목을 입력하세요
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
            placeholder="프리젠테이션 제목을 입력하세요"
            required
          />
          <p className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
            <Lightbulb className="w-3.5 h-3.5 flex-shrink-0" />
            <span>명확하고 임팩트 있는 제목을 작성하세요</span>
          </p>
        </div>

        <div>
          <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-2">
            부제목 (선택)
          </label>
          <input
            id="subtitle"
            type="text"
            value={slide.props.subtitle || ''}
            onChange={handleSubtitleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="부제목을 입력하세요"
          />
          <p className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
            <Pin className="w-3.5 h-3.5 flex-shrink-0" />
            <span>제목을 보충하는 간단한 설명을 추가하세요</span>
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="flex items-center gap-1.5 text-xs text-blue-700">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span>변경사항은 실시간으로 미리보기에 반영돼요 (Task 5 구현 후)</span>
        </p>
      </div>
    </div>
  );
}
