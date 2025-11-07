/**
 * GallerySlideForm 컴포넌트
 * 이미지 갤러리 슬라이드 편집 폼
 */

'use client';

import type { GallerySlide } from '@/types/slide';

interface GallerySlideFormProps {
  slide: GallerySlide;
  onChange: (updatedSlide: GallerySlide) => void;
}

export default function GallerySlideForm({
  slide,
  onChange,
}: GallerySlideFormProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        title: e.target.value,
      },
    });
  };

  const handleImageChange = (
    index: number,
    field: 'url' | 'caption',
    value: string
  ) => {
    const newImages = [...slide.props.images];
    newImages[index] = {
      ...newImages[index],
      [field]: value,
    };
    onChange({
      ...slide,
      props: {
        ...slide.props,
        images: newImages,
      },
    });
  };

  const handleAddImage = () => {
    const newImages = [...slide.props.images, { url: '', caption: '' }];
    onChange({
      ...slide,
      props: {
        ...slide.props,
        images: newImages,
      },
    });
  };

  const handleRemoveImage = (index: number) => {
    if (slide.props.images.length <= 1) {
      alert('최소 1개의 이미지가 필요해요');
      return;
    }
    const newImages = slide.props.images.filter((_, i) => i !== index);
    onChange({
      ...slide,
      props: {
        ...slide.props,
        images: newImages,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          갤러리 슬라이드 편집
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          이미지 갤러리를 2x2 그리드로 표시하세요 (4개 권장)
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
              이미지 목록 <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleAddImage}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + 이미지 추가
            </button>
          </div>

          <div className="space-y-4">
            {slide.props.images.map((image, index) => (
              <div
                key={index}
                className="border border-gray-300 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500">
                    이미지 {index + 1}
                  </span>
                  {slide.props.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="text-red-500 hover:text-red-600 text-sm"
                      aria-label="이미지 삭제"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={`image-url-${index}`}
                    className="block text-xs font-medium text-gray-600 mb-1"
                  >
                    이미지 URL
                  </label>
                  <input
                    id={`image-url-${index}`}
                    type="url"
                    value={image.url}
                    onChange={(e) =>
                      handleImageChange(index, 'url', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor={`image-caption-${index}`}
                    className="block text-xs font-medium text-gray-600 mb-1"
                  >
                    이미지 설명
                  </label>
                  <input
                    id={`image-caption-${index}`}
                    type="text"
                    value={image.caption}
                    onChange={(e) =>
                      handleImageChange(index, 'caption', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="이미지에 대한 간단한 설명"
                    required
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-2">
            💡 4개 이미지가 2x2 그리드로 가장 보기 좋아요
          </p>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-xs text-purple-700">
          🖼️ 각 이미지는 캡션과 함께 2x2 그리드로 표시돼요
        </p>
      </div>
    </div>
  );
}
