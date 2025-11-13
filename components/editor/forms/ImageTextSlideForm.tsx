/**
 * ImageTextSlideForm 컴포넌트
 * 이미지+텍스트 슬라이드 편집 폼
 */

'use client';

import { Lightbulb, ImageIcon } from 'lucide-react';
import type { ImageTextSlide } from '@/types/slide';
import IconSelector from '../IconSelector';

interface ImageTextSlideFormProps {
  slide: ImageTextSlide;
  onChange: (updatedSlide: ImageTextSlide) => void;
}

export default function ImageTextSlideForm({
  slide,
  onChange,
}: ImageTextSlideFormProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        title: e.target.value,
      },
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        image: e.target.value,
      },
    });
  };

  const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        imagePosition: e.target.value as 'left' | 'right',
      },
    });
  };

  const handleBulletChange = (index: number, value: string) => {
    const newBullets = [...slide.props.bullets];
    newBullets[index] = value;
    onChange({
      ...slide,
      props: {
        ...slide.props,
        bullets: newBullets,
      },
    });
  };

  const handleAddBullet = () => {
    const newBullets = [...slide.props.bullets, ''];
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

  const handleIconChange = (iconType: 'arrow' | 'dot' | 'check') => {
    onChange({
      ...slide,
      style: {
        ...slide.style,
        bullets: {
          ...slide.style.bullets,
          iconType,
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          이미지+텍스트 슬라이드 편집
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          이미지와 텍스트를 좌우로 배치하세요
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
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            이미지 URL <span className="text-red-500">*</span>
          </label>
          <input
            id="image"
            type="url"
            value={slide.props.image}
            onChange={handleImageChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com/image.jpg"
            required
          />
        </div>

        <div>
          <label
            htmlFor="position"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            이미지 위치
          </label>
          <select
            id="position"
            value={slide.props.imagePosition}
            onChange={handlePositionChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="left">왼쪽 (텍스트 오른쪽)</option>
            <option value="right">오른쪽 (텍스트 왼쪽)</option>
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              텍스트 항목 <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleAddBullet}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + 항목 추가
            </button>
          </div>

          <div className="space-y-2">
            {slide.props.bullets.map((bullet, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={bullet}
                  onChange={(e) => handleBulletChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="텍스트 항목을 입력하세요"
                  required
                />
                {slide.props.bullets.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveBullet(index)}
                    className="text-red-500 hover:text-red-600 text-sm px-2"
                    aria-label="항목 삭제"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <p className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
            <Lightbulb className="w-3.5 h-3.5 flex-shrink-0" />
            <span>각 항목은 선택한 아이콘과 함께 리스트로 표시돼요</span>
          </p>
        </div>

        {/* 아이콘 선택 */}
        <div>
          <IconSelector
            value={slide.style.bullets?.iconType || 'arrow'}
            onChange={handleIconChange}
            label="불릿 아이콘"
          />
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="flex items-center gap-1.5 text-xs text-purple-700">
          <ImageIcon className="w-3.5 h-3.5 flex-shrink-0" />
          <span>이미지는 55%, 텍스트는 45% 비율로 표시돼요</span>
        </p>
      </div>
    </div>
  );
}
