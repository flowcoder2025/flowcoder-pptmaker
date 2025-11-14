/**
 * ReportTwoColumnSlideForm 컴포넌트
 * 원페이지 보고서 (2단 레이아웃) 편집 폼
 */

'use client';

import { Plus, Trash2, FileText, Image as ImageIcon } from 'lucide-react';
import type { ReportTwoColumnSlide } from '@/types/slide';
import { Button } from '@/components/ui/button';
import ImageUploader from '../ImageUploader';

interface ReportTwoColumnSlideFormProps {
  slide: ReportTwoColumnSlide;
  onChange: (updatedSlide: ReportTwoColumnSlide) => void;
}

export default function ReportTwoColumnSlideForm({ slide, onChange }: ReportTwoColumnSlideFormProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        title: e.target.value,
      },
    });
  };

  const handleImageChange = (imageUrl: string) => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        image: imageUrl,
      },
    });
  };

  const handleImageCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        imageCaption: e.target.value,
      },
    });
  };

  const handleSectionChange = (index: number, field: 'subtitle' | 'body' | 'bullets', value: string | string[]) => {
    const newSections = [...slide.props.sections];
    newSections[index] = {
      ...newSections[index],
      [field]: value,
    };
    onChange({
      ...slide,
      props: {
        ...slide.props,
        sections: newSections,
      },
    });
  };

  const handleAddSection = () => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        sections: [
          ...slide.props.sections,
          { subtitle: '', body: '', bullets: [] },
        ],
      },
    });
  };

  const handleRemoveSection = (index: number) => {
    if (slide.props.sections.length <= 1) {
      alert('최소 1개의 섹션이 필요해요');
      return;
    }
    const newSections = slide.props.sections.filter((_, i) => i !== index);
    onChange({
      ...slide,
      props: {
        ...slide.props,
        sections: newSections,
      },
    });
  };

  const handleBulletsChange = (index: number, bulletsText: string) => {
    // 줄바꿈으로 구분된 텍스트를 배열로 변환
    const bulletsArray = bulletsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    handleSectionChange(index, 'bullets', bulletsArray);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          원페이지 보고서 (2단) 편집
        </h3>
        <p className="text-sm text-gray-600">
          왼쪽에는 텍스트 섹션, 오른쪽에는 이미지를 배치하는 보고서 형식이에요
        </p>
      </div>

      {/* 제목 */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          보고서 제목 <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={slide.props.title}
          onChange={handleTitleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="예: 3분기 실적 분석 보고서"
          required
        />
      </div>

      {/* 이미지 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4" />
          이미지 (우측 컬럼)
        </label>
        <ImageUploader
          currentImage={slide.props.image}
          onImageChange={handleImageChange}
        />
        <input
          type="text"
          value={slide.props.imageCaption}
          onChange={handleImageCaptionChange}
          className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="이미지 설명 (예: [그림 1] 3분기 매출 및 유료 전환율)"
        />
      </div>

      {/* 텍스트 섹션들 (좌측 컬럼) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">
            텍스트 섹션 (좌측 컬럼)
          </label>
          <Button
            onClick={handleAddSection}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            섹션 추가
          </Button>
        </div>

        <div className="space-y-4">
          {slide.props.sections.map((section, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">섹션 {index + 1}</span>
                {slide.props.sections.length > 1 && (
                  <button
                    onClick={() => handleRemoveSection(index)}
                    className="text-red-600 hover:text-red-700 p-1"
                    title="섹션 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {/* 소제목 */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    소제목 (선택)
                  </label>
                  <input
                    type="text"
                    value={section.subtitle || ''}
                    onChange={(e) => handleSectionChange(index, 'subtitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="예: 주요 성과 및 개선 영역"
                  />
                </div>

                {/* 본문 */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    본문
                  </label>
                  <textarea
                    value={section.body || ''}
                    onChange={(e) => handleSectionChange(index, 'body', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                    placeholder="본문 내용을 입력하세요. 여러 문단을 작성할 수 있어요."
                  />
                </div>

                {/* 불릿 포인트 */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    불릿 포인트 (선택)
                  </label>
                  <textarea
                    value={section.bullets?.join('\n') || ''}
                    onChange={(e) => handleBulletsChange(index, e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm font-mono"
                    placeholder={'한 줄에 하나씩 입력하세요:\n4분기 리텐션 마케팅 전략 수립\n신규 고객 유입 채널별 CAC 재분석'}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    각 줄이 하나의 불릿 포인트로 표시돼요
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="flex items-center gap-1.5 text-xs text-blue-700">
          <FileText className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            왼쪽 컬럼(flex: 1.5)에는 텍스트 섹션들이 스크롤 가능하게 표시되고, 오른쪽 컬럼(flex: 1)에는 이미지가 표시돼요
          </span>
        </p>
      </div>
    </div>
  );
}
