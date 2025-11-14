/**
 * ReportA4SlideForm 컴포넌트
 * 원페이지 보고서 (A4 레이아웃) 편집 폼
 */

'use client';

import { Plus, Trash2, FileText, Image as ImageIcon } from 'lucide-react';
import type { ReportA4Slide } from '@/types/slide';
import { Button } from '@/components/ui/button';
import ImageUploader from '../ImageUploader';

interface ReportA4SlideFormProps {
  slide: ReportA4Slide;
  onChange: (updatedSlide: ReportA4Slide) => void;
}

export default function ReportA4SlideForm({ slide, onChange }: ReportA4SlideFormProps) {
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

  const handleImageChange = (index: number, imageUrl: string) => {
    const currentImages = slide.props.images || [];
    const newImages = [...currentImages];
    newImages[index] = imageUrl;

    onChange({
      ...slide,
      props: {
        ...slide.props,
        images: newImages.filter(img => img && img.trim() !== ''),
      },
    });
  };

  const handleRemoveImage = (index: number) => {
    const currentImages = slide.props.images || [];
    const newImages = currentImages.filter((_, i) => i !== index);

    onChange({
      ...slide,
      props: {
        ...slide.props,
        images: newImages.length > 0 ? newImages : undefined,
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
    const bulletsArray = bulletsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    handleSectionChange(index, 'bullets', bulletsArray);
  };

  const currentImages = slide.props.images || [];
  const canAddImage = currentImages.length < 2;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          원페이지 보고서 (A4) 편집
        </h3>
        <p className="text-sm text-gray-600">
          A4 용지 비율의 세로형 보고서 형식이에요 (이미지 최대 2개)
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
          placeholder="예: 2024년 4분기 사업 보고서"
          required
        />
      </div>

      {/* 부제목 */}
      <div>
        <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-2">
          부제목 <span className="text-red-500">*</span>
        </label>
        <input
          id="subtitle"
          type="text"
          value={slide.props.subtitle}
          onChange={handleSubtitleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="예: 경영 전략팀 | 2024.12.01"
          required
        />
      </div>

      {/* 이미지 (최대 2개) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4" />
            헤더 이미지 (최대 2개)
          </label>
          {canAddImage && (
            <Button
              onClick={() => {}}
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              이미지 추가
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {[0, 1].map((index) => {
            const hasImage = currentImages[index];
            if (!hasImage && index > 0 && !currentImages[index - 1]) {
              return null;
            }

            return (
              <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">이미지 {index + 1}</span>
                  {hasImage && (
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="text-red-600 hover:text-red-700 p-1"
                      title="이미지 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <ImageUploader
                  currentImage={currentImages[index]}
                  onImageChange={(url) => handleImageChange(index, url)}
                />
              </div>
            );
          })}
        </div>

        <p className="text-xs text-gray-500 mt-2">
          제목과 부제목 하단에 표시될 이미지예요. 2개인 경우 그리드로 배치돼요.
        </p>
      </div>

      {/* 텍스트 섹션들 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">
            콘텐츠 섹션
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
                {/* 섹션 타입 선택 */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    섹션 형식
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleSectionChange(index, 'bullets', []);
                      }}
                      className={`flex-1 px-3 py-2 text-sm rounded-lg border ${
                        !section.bullets || section.bullets.length === 0
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700'
                      }`}
                    >
                      📝 소제목-본문
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleSectionChange(index, 'body', '');
                      }}
                      className={`flex-1 px-3 py-2 text-sm rounded-lg border ${
                        section.bullets && section.bullets.length > 0
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700'
                      }`}
                    >
                      📋 소제목-불릿
                    </button>
                  </div>
                </div>

                {/* 소제목 */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    소제목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={section.subtitle || ''}
                    onChange={(e) => handleSectionChange(index, 'subtitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="예: 핵심 성과 지표"
                    required
                  />
                </div>

                {/* 본문 (소제목-본문 타입인 경우) */}
                {(!section.bullets || section.bullets.length === 0) && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      본문 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={section.body || ''}
                      onChange={(e) => handleSectionChange(index, 'body', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                      placeholder="본문 내용을 입력하세요. 여러 문단을 작성할 수 있어요."
                      required
                    />
                  </div>
                )}

                {/* 불릿 포인트 (소제목-불릿 타입인 경우) */}
                {section.bullets && section.bullets.length >= 0 && (section.bullets.length > 0 || !section.body) && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      불릿 포인트 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={section.bullets?.join('\n') || ''}
                      onChange={(e) => handleBulletsChange(index, e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm font-mono"
                      placeholder={'한 줄에 하나씩 입력하세요:\n매출 목표 달성률 125%\n고객 만족도 4.8/5.0\n신규 고객 유입 35% 증가'}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      각 줄이 하나의 불릿 포인트로 표시돼요
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="flex items-center gap-1.5 text-xs text-blue-700">
          <FileText className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            A4 세로형 보고서는 제목-부제목-이미지-섹션 순서로 표시돼요. 섹션들은 스크롤 가능하게 배치돼요.
          </span>
        </p>
      </div>
    </div>
  );
}
