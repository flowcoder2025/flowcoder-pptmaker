/**
 * FeatureGridSlideForm 컴포넌트
 * 기능 그리드 슬라이드 편집 폼
 */

'use client';

import { Lightbulb, Palette } from 'lucide-react';
import ImageUploader from '@/components/editor/ImageUploader';
import type { FeatureGridSlide } from '@/types/slide';

interface FeatureGridSlideFormProps {
  slide: FeatureGridSlide;
  onChange: (updatedSlide: FeatureGridSlide) => void;
}

export default function FeatureGridSlideForm({
  slide,
  onChange,
}: FeatureGridSlideFormProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        title: e.target.value,
      },
    });
  };

  const handleFeatureChange = (
    index: number,
    field: 'icon' | 'title' | 'description' | 'iconType',
    value: string
  ) => {
    const newFeatures = [...slide.props.features];
    newFeatures[index] = {
      ...newFeatures[index],
      [field]: value,
    };
    onChange({
      ...slide,
      props: {
        ...slide.props,
        features: newFeatures,
      },
    });
  };

  const handleIconTypeChange = (index: number, iconType: 'emoji' | 'image') => {
    const newFeatures = [...slide.props.features];
    newFeatures[index] = {
      ...newFeatures[index],
      iconType,
      // iconType 변경 시 icon 초기화
      icon: iconType === 'emoji' ? '⭐' : '',
    };
    onChange({
      ...slide,
      props: {
        ...slide.props,
        features: newFeatures,
      },
    });
  };

  const handleAddFeature = () => {
    const newFeatures = [
      ...slide.props.features,
      { iconType: 'emoji' as const, icon: '⭐', title: '', description: '' },
    ];
    onChange({
      ...slide,
      props: {
        ...slide.props,
        features: newFeatures,
      },
    });
  };

  const handleRemoveFeature = (index: number) => {
    if (slide.props.features.length <= 1) {
      alert('최소 1개의 기능이 필요해요');
      return;
    }
    const newFeatures = slide.props.features.filter((_, i) => i !== index);
    onChange({
      ...slide,
      props: {
        ...slide.props,
        features: newFeatures,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          기능 그리드 슬라이드 편집
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          3열 그리드로 핵심 기능을 강조하세요
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
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              기능 항목 <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleAddFeature}
              disabled={slide.props.features.length >= 6}
              className={`text-sm font-medium ${
                slide.props.features.length >= 6
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-blue-600 hover:text-blue-700'
              }`}
              title={
                slide.props.features.length >= 6
                  ? '최대 6개까지만 추가할 수 있어요'
                  : ''
              }
            >
              + 기능 추가
            </button>
          </div>

          <div className="space-y-3">
            {slide.props.features.map((feature, index) => (
              <div
                key={index}
                className="border border-gray-300 rounded-lg p-3 space-y-2"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500">
                    기능 {index + 1}
                  </span>
                  {slide.props.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(index)}
                      className="text-red-500 hover:text-red-600 text-sm"
                      aria-label="기능 삭제"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* 아이콘 타입 선택 */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    아이콘 타입
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`iconType-${index}`}
                        value="emoji"
                        checked={(feature.iconType || 'emoji') === 'emoji'}
                        onChange={() => handleIconTypeChange(index, 'emoji')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">이모지</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`iconType-${index}`}
                        value="image"
                        checked={(feature.iconType || 'emoji') === 'image'}
                        onChange={() => handleIconTypeChange(index, 'image')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">이미지</span>
                    </label>
                  </div>
                </div>

                {/* 이모지 입력 */}
                {(feature.iconType || 'emoji') === 'emoji' && (
                  <div>
                    <label
                      htmlFor={`icon-${index}`}
                      className="block text-xs font-medium text-gray-600 mb-1"
                    >
                      이모지
                    </label>
                    <input
                      id={`icon-${index}`}
                      type="text"
                      value={feature.icon}
                      onChange={(e) =>
                        handleFeatureChange(index, 'icon', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-2xl text-center"
                      placeholder="⚡"
                      required
                    />
                  </div>
                )}

                {/* 이미지 업로드 */}
                {(feature.iconType || 'emoji') === 'image' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      아이콘 이미지
                    </label>
                    <ImageUploader
                      currentImage={feature.icon}
                      onImageChange={(imageBase64) =>
                        handleFeatureChange(index, 'icon', imageBase64)
                      }
                      maxSizeMB={1}
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor={`feature-title-${index}`}
                    className="block text-xs font-medium text-gray-600 mb-1"
                  >
                    기능 제목
                  </label>
                  <input
                    id={`feature-title-${index}`}
                    type="text"
                    value={feature.title}
                    onChange={(e) =>
                      handleFeatureChange(index, 'title', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="예: 실시간 처리"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor={`feature-desc-${index}`}
                    className="block text-xs font-medium text-gray-600 mb-1"
                  >
                    설명
                  </label>
                  <textarea
                    id={`feature-desc-${index}`}
                    value={feature.description}
                    onChange={(e) =>
                      handleFeatureChange(index, 'description', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={2}
                    placeholder="기능에 대한 간단한 설명을 입력하세요"
                    required
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
            <Lightbulb className="w-3.5 h-3.5 flex-shrink-0" />
            <span>일반적으로 3개 항목이 3열 그리드로 표시돼요</span>
          </p>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="flex items-center gap-1.5 text-xs text-purple-700">
          <Palette className="w-3.5 h-3.5 flex-shrink-0" />
          <span>각 기능은 아이콘, 제목, 설명이 포함된 카드로 표시돼요</span>
        </p>
      </div>
    </div>
  );
}
