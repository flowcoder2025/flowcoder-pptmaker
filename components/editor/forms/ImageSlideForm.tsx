/**
 * ImageSlideForm 컴포넌트
 * 이미지 슬라이드 편집 폼
 */

'use client';

import { Lightbulb, PenLine, CheckCircle2 } from 'lucide-react';
import type { ImageSlide } from '@/types/slide';
import ImageUploader from '../ImageUploader';

interface ImageSlideFormProps {
  slide: ImageSlide;
  onChange: (updatedSlide: ImageSlide) => void;
}

export default function ImageSlideForm({ slide, onChange }: ImageSlideFormProps) {
  const handleArrangementChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newArrangement = e.target.value as 'full' | 'sideBySide' | 'grid' | 'imageLeft';

    // arrangement 변경 시 기존 이미지 데이터 초기화
    const newProps: ImageSlide['props'] = {
      ...slide.props,
      arrangement: newArrangement,
      image: newArrangement === 'full' || newArrangement === 'imageLeft' ? (slide.props.image || '') : undefined,
      images: newArrangement === 'sideBySide' || newArrangement === 'grid' ? (slide.props.images || ['', '']) : undefined,
    };

    onChange({
      ...slide,
      props: newProps,
    });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        title: e.target.value,
      },
    });
  };

  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        caption: e.target.value,
      },
    });
  };

  const handleSingleImageChange = (imageBase64: string) => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        image: imageBase64,
      },
    });
  };

  const handleMultipleImageChange = (index: number, imageBase64: string) => {
    const currentImages = slide.props.images || [];
    const newImages = [...currentImages];
    newImages[index] = imageBase64;

    onChange({
      ...slide,
      props: {
        ...slide.props,
        images: newImages,
      },
    });
  };

  const { arrangement } = slide.props;
  const imageCount = arrangement === 'full' || arrangement === 'imageLeft' ? 1 : arrangement === 'sideBySide' ? 2 : 3;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">이미지 슬라이드 편집</h3>
        <p className="text-sm text-gray-600 mb-6">
          이미지를 업로드하고 제목과 설명을 입력하세요
        </p>
      </div>

      <div className="space-y-4">
        {/* 배치 선택 */}
        <div>
          <label htmlFor="arrangement" className="block text-sm font-medium text-gray-700 mb-2">
            이미지 배치 <span className="text-red-500">*</span>
          </label>
          <select
            id="arrangement"
            value={arrangement}
            onChange={handleArrangementChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="full">전체 화면 이미지</option>
            <option value="imageLeft">이미지 + 텍스트</option>
            <option value="sideBySide">2개 나란히</option>
            <option value="grid">여러 이미지 그리드</option>
          </select>
          <p className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
            <Lightbulb className="w-3.5 h-3.5 flex-shrink-0" />
            <span>슬라이드에 표시할 이미지 개수를 선택하세요</span>
          </p>
        </div>

        {/* 제목 */}
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
            placeholder="이미지 제목을 입력하세요"
            required
          />
        </div>

        {/* 설명 (선택) */}
        <div>
          <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-2">
            설명 (선택)
          </label>
          <textarea
            id="caption"
            value={slide.props.caption || ''}
            onChange={handleCaptionChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
            placeholder="이미지에 대한 추가 설명을 입력하세요"
          />
          <p className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
            <PenLine className="w-3.5 h-3.5 flex-shrink-0" />
            <span>이미지를 보충하는 간단한 설명을 추가하세요</span>
          </p>
        </div>

        {/* 이미지 업로드 */}
        {arrangement === 'full' || arrangement === 'imageLeft' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이미지 <span className="text-red-500">*</span>
            </label>
            <ImageUploader
              currentImage={slide.props.image}
              onImageChange={handleSingleImageChange}
              maxSizeMB={2}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {Array.from({ length: imageCount }).map((_, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이미지 {index + 1} <span className="text-red-500">*</span>
                </label>
                <ImageUploader
                  currentImage={slide.props.images?.[index] || ''}
                  onImageChange={(base64) => handleMultipleImageChange(index, base64)}
                  maxSizeMB={2}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="flex items-center gap-1.5 text-xs text-blue-700">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span>이미지는 Base64로 인코딩되어 저장돼요 (최대 2MB)</span>
        </p>
      </div>
    </div>
  );
}
