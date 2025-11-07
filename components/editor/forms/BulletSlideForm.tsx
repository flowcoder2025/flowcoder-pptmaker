/**
 * BulletSlideForm 컴포넌트
 * 목록 슬라이드 편집 폼
 */

'use client';

import type { BulletSlide } from '@/types/slide';

interface BulletSlideFormProps {
  slide: BulletSlide;
  onChange: (updatedSlide: BulletSlide) => void;
}

export default function BulletSlideForm({ slide, onChange }: BulletSlideFormProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        title: e.target.value,
      },
    });
  };

  const handleBulletChange = (index: number, value: string) => {
    const newBullets = [...slide.props.bullets];
    newBullets[index] = { ...newBullets[index], text: value };
    onChange({
      ...slide,
      props: {
        ...slide.props,
        bullets: newBullets,
      },
    });
  };

  const handleAddBullet = () => {
    const newBullets = [...slide.props.bullets, { text: '', level: 0 as const }];
    onChange({
      ...slide,
      props: {
        ...slide.props,
        bullets: newBullets,
      },
    });
  };

  const handleRemoveBullet = (index: number) => {
    if (slide.props.bullets.length <= 1) {
      alert('최소 1개의 항목이 필요해요');
      return;
    }

    const newBullets = slide.props.bullets.filter((_, i) => i !== index);
    onChange({
      ...slide,
      props: {
        ...slide.props,
        bullets: newBullets,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">목록 슬라이드 편집</h3>
        <p className="text-sm text-gray-600 mb-6">
          슬라이드의 제목과 목록 항목들을 입력하세요
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
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              목록 항목 <span className="text-red-500">*</span>
            </label>
            <span className="text-xs text-gray-500">{slide.props.bullets.length}개 항목</span>
          </div>

          <div className="space-y-3">
            {slide.props.bullets.map((bullet, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-shrink-0 w-8 h-11 flex items-center justify-center text-gray-500 font-medium text-sm">
                  {index + 1}
                </div>
                <input
                  type="text"
                  value={bullet.text}
                  onChange={(e) => handleBulletChange(index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`항목 ${index + 1}`}
                  required
                />
                <button
                  onClick={() => handleRemoveBullet(index)}
                  className="flex-shrink-0 px-3 py-2 border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
                  title="항목 삭제"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleAddBullet}
            className="w-full mt-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm text-gray-600"
          >
            + 항목 추가
          </button>

          <p className="text-xs text-gray-500 mt-2">
            💡 각 항목은 간결하게 작성하세요 (1-2줄 권장)
          </p>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-xs text-purple-700">
          📋 목록은 슬라이드에 화살표 아이콘(→)과 함께 표시돼요
        </p>
      </div>
    </div>
  );
}
