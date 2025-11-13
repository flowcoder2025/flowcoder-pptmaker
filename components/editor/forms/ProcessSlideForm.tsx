/**
 * ProcessSlideForm 컴포넌트
 * 프로세스 슬라이드 편집 폼
 */

'use client';

import { Lightbulb, RotateCw } from 'lucide-react';
import type { ProcessSlide } from '@/types/slide';

interface ProcessSlideFormProps {
  slide: ProcessSlide;
  onChange: (updatedSlide: ProcessSlide) => void;
}

export default function ProcessSlideForm({
  slide,
  onChange,
}: ProcessSlideFormProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        title: e.target.value,
      },
    });
  };

  const handleStepChange = (
    index: number,
    field: 'title' | 'description',
    value: string
  ) => {
    const newSteps = [...slide.props.steps];
    newSteps[index] = {
      ...newSteps[index],
      [field]: value,
    };
    onChange({
      ...slide,
      props: {
        ...slide.props,
        steps: newSteps,
      },
    });
  };

  const handleAddStep = () => {
    const newSteps = [...slide.props.steps, { title: '', description: '' }];
    onChange({
      ...slide,
      props: {
        ...slide.props,
        steps: newSteps,
      },
    });
  };

  const handleRemoveStep = (index: number) => {
    if (slide.props.steps.length <= 1) {
      alert('최소 1개의 단계가 필요해요');
      return;
    }
    const newSteps = slide.props.steps.filter((_, i) => i !== index);
    onChange({
      ...slide,
      props: {
        ...slide.props,
        steps: newSteps,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          프로세스 슬라이드 편집
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          세로 플로우로 단계별 프로세스를 표시하세요
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
              프로세스 단계 <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleAddStep}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + 단계 추가
            </button>
          </div>

          <div className="space-y-4">
            {slide.props.steps.map((step, index) => (
              <div
                key={index}
                className="border border-gray-300 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500">
                    단계 {index + 1}
                  </span>
                  {slide.props.steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(index)}
                      className="text-red-500 hover:text-red-600 text-sm"
                      aria-label="단계 삭제"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={`step-title-${index}`}
                    className="block text-xs font-medium text-gray-600 mb-1"
                  >
                    단계 제목
                  </label>
                  <input
                    id={`step-title-${index}`}
                    type="text"
                    value={step.title}
                    onChange={(e) =>
                      handleStepChange(index, 'title', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="예: 데이터 연동"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor={`step-desc-${index}`}
                    className="block text-xs font-medium text-gray-600 mb-1"
                  >
                    설명
                  </label>
                  <textarea
                    id={`step-desc-${index}`}
                    value={step.description}
                    onChange={(e) =>
                      handleStepChange(index, 'description', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={2}
                    placeholder="단계에 대한 간단한 설명을 입력하세요"
                    required
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
            <Lightbulb className="w-3.5 h-3.5 flex-shrink-0" />
            <span>각 단계는 번호와 함께 세로로 연결되어 표시돼요</span>
          </p>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="flex items-center gap-1.5 text-xs text-purple-700">
          <RotateCw className="w-3.5 h-3.5 flex-shrink-0" />
          <span>프로세스는 세로 플로우 형태로 단계 간 연결선이 표시돼요</span>
        </p>
      </div>
    </div>
  );
}
