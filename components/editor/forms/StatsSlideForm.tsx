/**
 * StatsSlideForm 컴포넌트
 * 통계 슬라이드 편집 폼
 */

'use client';

import type { StatsSlide } from '@/types/slide';

interface StatsSlideFormProps {
  slide: StatsSlide;
  onChange: (updatedSlide: StatsSlide) => void;
}

export default function StatsSlideForm({ slide, onChange }: StatsSlideFormProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        title: e.target.value,
      },
    });
  };

  const handleStatChange = (index: number, field: 'value' | 'label', value: string) => {
    const newStats = [...slide.props.stats];
    newStats[index] = {
      ...newStats[index],
      [field]: value,
    };
    onChange({
      ...slide,
      props: {
        ...slide.props,
        stats: newStats,
      },
    });
  };

  const handleAddStat = () => {
    const newStats = [...slide.props.stats, { value: '', label: '' }];
    onChange({
      ...slide,
      props: {
        ...slide.props,
        stats: newStats,
      },
    });
  };

  const handleRemoveStat = (index: number) => {
    if (slide.props.stats.length <= 1) {
      alert('최소 1개의 통계 항목이 필요해요');
      return;
    }
    const newStats = slide.props.stats.filter((_, i) => i !== index);
    onChange({
      ...slide,
      props: {
        ...slide.props,
        stats: newStats,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">통계 슬라이드 편집</h3>
        <p className="text-sm text-gray-600 mb-6">
          핵심 수치와 통계를 강조하세요
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
              통계 항목 <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleAddStat}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + 항목 추가
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {slide.props.stats.map((stat, index) => (
              <div key={index} className="border border-gray-300 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500">
                    항목 {index + 1}
                  </span>
                  {slide.props.stats.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStat(index)}
                      className="text-red-500 hover:text-red-600 text-sm"
                      aria-label="항목 삭제"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div>
                  <label htmlFor={`value-${index}`} className="block text-xs font-medium text-gray-600 mb-1">
                    수치 (큰 값)
                  </label>
                  <input
                    id={`value-${index}`}
                    type="text"
                    value={stat.value}
                    onChange={(e) => handleStatChange(index, 'value', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-bold text-center"
                    placeholder="예: 125%"
                    required
                  />
                </div>

                <div>
                  <label htmlFor={`label-${index}`} className="block text-xs font-medium text-gray-600 mb-1">
                    설명 (작은 텍스트)
                  </label>
                  <input
                    id={`label-${index}`}
                    type="text"
                    value={stat.label}
                    onChange={(e) => handleStatChange(index, 'label', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-center"
                    placeholder="예: 성장률"
                    required
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-2">
            💡 일반적으로 2x2 그리드(4개)로 표시돼요
          </p>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-xs text-purple-700">
          📊 통계는 큰 수치와 함께 작은 설명으로 표시돼요
        </p>
      </div>
    </div>
  );
}
