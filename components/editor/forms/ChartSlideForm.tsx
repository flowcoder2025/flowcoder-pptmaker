/**
 * ChartSlideForm 컴포넌트
 * 차트 슬라이드 편집 폼
 */

'use client';

import { Lightbulb, AlertTriangle, BarChart3 } from 'lucide-react';
import type { ChartSlide } from '@/types/slide';

interface ChartSlideFormProps {
  slide: ChartSlide;
  onChange: (updatedSlide: ChartSlide) => void;
}

export default function ChartSlideForm({ slide, onChange }: ChartSlideFormProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        title: e.target.value,
      },
    });
  };

  const handleChartTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        chartType: e.target.value as 'bar' | 'line' | 'pie' | 'area',
      },
    });
  };

  const handleSeriesNameChange = (index: number, value: string) => {
    const newData = [...slide.props.data];
    newData[index] = {
      ...newData[index],
      name: value,
    };
    onChange({
      ...slide,
      props: {
        ...slide.props,
        data: newData,
      },
    });
  };

  const handleSeriesLabelsChange = (index: number, value: string) => {
    const labels = value.split(',').map((s) => s.trim()).filter(Boolean);
    const newData = [...slide.props.data];
    newData[index] = {
      ...newData[index],
      labels,
    };
    onChange({
      ...slide,
      props: {
        ...slide.props,
        data: newData,
      },
    });
  };

  const handleSeriesValuesChange = (index: number, value: string) => {
    const values = value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => parseFloat(s))
      .filter((n) => !isNaN(n));
    const newData = [...slide.props.data];
    newData[index] = {
      ...newData[index],
      values,
    };
    onChange({
      ...slide,
      props: {
        ...slide.props,
        data: newData,
      },
    });
  };

  const handleAddSeries = () => {
    const newData = [...slide.props.data, { name: '', labels: [], values: [] }];
    onChange({
      ...slide,
      props: {
        ...slide.props,
        data: newData,
      },
    });
  };

  const handleRemoveSeries = (index: number) => {
    if (slide.props.data.length <= 1) {
      alert('최소 1개의 데이터 시리즈가 필요해요');
      return;
    }
    const newData = slide.props.data.filter((_, i) => i !== index);
    onChange({
      ...slide,
      props: {
        ...slide.props,
        data: newData,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">차트 슬라이드 편집</h3>
        <p className="text-sm text-gray-600 mb-6">
          데이터를 시각화하세요
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
          <label htmlFor="chartType" className="block text-sm font-medium text-gray-700 mb-2">
            차트 타입 <span className="text-red-500">*</span>
          </label>
          <select
            id="chartType"
            value={slide.props.chartType}
            onChange={handleChartTypeChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="bar">📊 막대 그래프 (Bar)</option>
            <option value="line">📈 꺾은선 그래프 (Line)</option>
            <option value="pie">🥧 원형 그래프 (Pie)</option>
            <option value="area">📉 영역 그래프 (Area)</option>
          </select>
          <p className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
            <Lightbulb className="w-3.5 h-3.5 flex-shrink-0" />
            <span>차트 타입에 따라 데이터 표현 방식이 달라져요</span>
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              데이터 시리즈 <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleAddSeries}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + 시리즈 추가
            </button>
          </div>

          <div className="space-y-4">
            {slide.props.data.map((series, index) => (
              <div key={index} className="border border-gray-300 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500">
                    시리즈 {index + 1}
                  </span>
                  {slide.props.data.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSeries(index)}
                      className="text-red-500 hover:text-red-600 text-sm"
                      aria-label="시리즈 삭제"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div>
                  <label htmlFor={`series-name-${index}`} className="block text-xs font-medium text-gray-600 mb-1">
                    시리즈 이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`series-name-${index}`}
                    type="text"
                    value={series.name}
                    onChange={(e) => handleSeriesNameChange(index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="예: 매출"
                    required
                  />
                </div>

                <div>
                  <label htmlFor={`series-labels-${index}`} className="block text-xs font-medium text-gray-600 mb-1">
                    라벨 (쉼표로 구분) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`series-labels-${index}`}
                    type="text"
                    value={series.labels.join(', ')}
                    onChange={(e) => handleSeriesLabelsChange(index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="예: 1월, 2월, 3월, 4월"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    x축 라벨을 쉼표(,)로 구분해 입력하세요
                  </p>
                </div>

                <div>
                  <label htmlFor={`series-values-${index}`} className="block text-xs font-medium text-gray-600 mb-1">
                    값 (쉼표로 구분) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`series-values-${index}`}
                    type="text"
                    value={series.values.join(', ')}
                    onChange={(e) => handleSeriesValuesChange(index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="예: 100, 150, 120, 180"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    y축 값을 쉼표(,)로 구분해 입력하세요 (숫자만)
                  </p>
                </div>

                {series.labels.length !== series.values.length && (
                  <div className="bg-red-50 border border-red-200 rounded p-2">
                    <p className="flex items-center gap-1.5 text-xs text-red-600">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>라벨 개수({series.labels.length})와 값 개수({series.values.length})가 일치하지 않아요</span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
        <p className="flex items-center gap-1.5 text-xs text-pink-700">
          <BarChart3 className="w-3.5 h-3.5 flex-shrink-0" />
          <span>차트는 선택한 타입에 따라 데이터를 시각화해요</span>
        </p>
      </div>
    </div>
  );
}
