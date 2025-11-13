/**
 * PricingSlideForm 컴포넌트
 * 가격표 슬라이드 편집 폼
 */

'use client';

import { Lightbulb, DollarSign } from 'lucide-react';
import type { PricingSlide } from '@/types/slide';

interface PricingSlideFormProps {
  slide: PricingSlide;
  onChange: (updatedSlide: PricingSlide) => void;
}

export default function PricingSlideForm({
  slide,
  onChange,
}: PricingSlideFormProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        title: e.target.value,
      },
    });
  };

  const handleTierChange = (
    index: number,
    field: 'name' | 'price' | 'period' | 'description',
    value: string | boolean
  ) => {
    const newTiers = [...slide.props.tiers];
    newTiers[index] = {
      ...newTiers[index],
      [field]: value,
    };
    onChange({
      ...slide,
      props: {
        ...slide.props,
        tiers: newTiers,
      },
    });
  };

  const handleRecommendedChange = (index: number, checked: boolean) => {
    const newTiers = slide.props.tiers.map((tier, i) => ({
      ...tier,
      recommended: i === index ? checked : false,
    }));
    onChange({
      ...slide,
      props: {
        ...slide.props,
        tiers: newTiers,
      },
    });
  };

  const handleFeatureChange = (tierIndex: number, featureIndex: number, value: string) => {
    const newTiers = [...slide.props.tiers];
    const newFeatures = [...newTiers[tierIndex].features];
    newFeatures[featureIndex] = value;
    newTiers[tierIndex] = {
      ...newTiers[tierIndex],
      features: newFeatures,
    };
    onChange({
      ...slide,
      props: {
        ...slide.props,
        tiers: newTiers,
      },
    });
  };

  const handleAddFeature = (tierIndex: number) => {
    const newTiers = [...slide.props.tiers];
    newTiers[tierIndex] = {
      ...newTiers[tierIndex],
      features: [...newTiers[tierIndex].features, ''],
    };
    onChange({
      ...slide,
      props: {
        ...slide.props,
        tiers: newTiers,
      },
    });
  };

  const handleRemoveFeature = (tierIndex: number, featureIndex: number) => {
    const newTiers = [...slide.props.tiers];
    if (newTiers[tierIndex].features.length <= 1) {
      alert('최소 1개의 기능이 필요해요');
      return;
    }
    newTiers[tierIndex] = {
      ...newTiers[tierIndex],
      features: newTiers[tierIndex].features.filter((_, i) => i !== featureIndex),
    };
    onChange({
      ...slide,
      props: {
        ...slide.props,
        tiers: newTiers,
      },
    });
  };

  const handleAddTier = () => {
    const newTiers = [
      ...slide.props.tiers,
      {
        name: '',
        price: '',
        period: '/월',
        description: '',
        features: [''],
      },
    ];
    onChange({
      ...slide,
      props: {
        ...slide.props,
        tiers: newTiers,
      },
    });
  };

  const handleRemoveTier = (index: number) => {
    if (slide.props.tiers.length <= 1) {
      alert('최소 1개의 플랜이 필요해요');
      return;
    }
    const newTiers = slide.props.tiers.filter((_, i) => i !== index);
    onChange({
      ...slide,
      props: {
        ...slide.props,
        tiers: newTiers,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">가격표 슬라이드 편집</h3>
        <p className="text-sm text-gray-600 mb-6">
          3단계 가격표를 작성하세요 (1개 추천 플랜)
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
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              가격 플랜 <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleAddTier}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + 플랜 추가
            </button>
          </div>

          <div className="space-y-6">
            {slide.props.tiers.map((tier, tierIndex) => (
              <div key={tierIndex} className="border-2 border-gray-300 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-500">
                      플랜 {tierIndex + 1}
                    </span>
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={tier.recommended || false}
                        onChange={(e) => handleRecommendedChange(tierIndex, e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-blue-600 font-medium">추천 플랜</span>
                    </label>
                  </div>
                  {slide.props.tiers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTier(tierIndex)}
                      className="text-red-500 hover:text-red-600 text-sm"
                      aria-label="플랜 삭제"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor={`name-${tierIndex}`} className="block text-xs font-medium text-gray-600 mb-1">
                      플랜명
                    </label>
                    <input
                      id={`name-${tierIndex}`}
                      type="text"
                      value={tier.name}
                      onChange={(e) => handleTierChange(tierIndex, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="예: Pro"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor={`price-${tierIndex}`} className="block text-xs font-medium text-gray-600 mb-1">
                      가격
                    </label>
                    <input
                      id={`price-${tierIndex}`}
                      type="text"
                      value={tier.price}
                      onChange={(e) => handleTierChange(tierIndex, 'price', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="예: ₩150,000"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor={`period-${tierIndex}`} className="block text-xs font-medium text-gray-600 mb-1">
                      기간
                    </label>
                    <input
                      id={`period-${tierIndex}`}
                      type="text"
                      value={tier.period}
                      onChange={(e) => handleTierChange(tierIndex, 'period', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="예: /월"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor={`desc-${tierIndex}`} className="block text-xs font-medium text-gray-600 mb-1">
                      설명
                    </label>
                    <input
                      id={`desc-${tierIndex}`}
                      type="text"
                      value={tier.description}
                      onChange={(e) => handleTierChange(tierIndex, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="예: 대부분의 기업을 위한 플랜"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-medium text-gray-600">기능 목록</label>
                    <button
                      type="button"
                      onClick={() => handleAddFeature(tierIndex)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      + 기능 추가
                    </button>
                  </div>
                  <div className="space-y-2">
                    {tier.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex gap-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => handleFeatureChange(tierIndex, featureIndex, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="기능을 입력하세요"
                          required
                        />
                        {tier.features.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(tierIndex, featureIndex)}
                            className="text-red-500 hover:text-red-600 text-sm px-2"
                            aria-label="기능 삭제"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
            <Lightbulb className="w-3.5 h-3.5 flex-shrink-0" />
            <span>일반적으로 3개 플랜이 가로로 표시돼요</span>
          </p>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="flex items-center gap-1.5 text-xs text-purple-700">
          <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
          <span>추천 플랜은 파란색 헤더와 확대 효과로 강조돼요</span>
        </p>
      </div>
    </div>
  );
}
