/**
 * TeamProfileSlideForm 컴포넌트
 * 팀 프로필 슬라이드 편집 폼
 */

'use client';

import { Lightbulb, Users } from 'lucide-react';
import type { TeamProfileSlide } from '@/types/slide';
import ImageUploader from '../ImageUploader';

interface TeamProfileSlideFormProps {
  slide: TeamProfileSlide;
  onChange: (updatedSlide: TeamProfileSlide) => void;
}

export default function TeamProfileSlideForm({
  slide,
  onChange,
}: TeamProfileSlideFormProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        title: e.target.value,
      },
    });
  };

  const handleProfileChange = (
    index: number,
    field: 'name' | 'role' | 'bio' | 'image',
    value: string
  ) => {
    const newProfiles = [...slide.props.profiles];
    newProfiles[index] = {
      ...newProfiles[index],
      [field]: value,
    };
    onChange({
      ...slide,
      props: {
        ...slide.props,
        profiles: newProfiles,
      },
    });
  };

  const handleAddProfile = () => {
    const newProfiles = [
      ...slide.props.profiles,
      { name: '', role: '', bio: '' },
    ];
    onChange({
      ...slide,
      props: {
        ...slide.props,
        profiles: newProfiles,
      },
    });
  };

  const handleRemoveProfile = (index: number) => {
    if (slide.props.profiles.length <= 1) {
      alert('최소 1명의 프로필이 필요해요');
      return;
    }
    const newProfiles = slide.props.profiles.filter((_, i) => i !== index);
    onChange({
      ...slide,
      props: {
        ...slide.props,
        profiles: newProfiles,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          팀 프로필 슬라이드 편집
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          팀원들을 소개하세요 (1-6명 최적화)
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
              팀원 프로필 <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleAddProfile}
              disabled={slide.props.profiles.length >= 6}
              className={`text-sm font-medium ${
                slide.props.profiles.length >= 6
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-blue-600 hover:text-blue-700'
              }`}
              title={
                slide.props.profiles.length >= 6
                  ? '최대 6명까지만 추가할 수 있어요'
                  : ''
              }
            >
              + 프로필 추가
            </button>
          </div>

          <div className="space-y-4">
            {slide.props.profiles.map((profile, index) => (
              <div
                key={index}
                className="border border-gray-300 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500">
                    팀원 {index + 1}
                  </span>
                  {slide.props.profiles.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveProfile(index)}
                      className="text-red-500 hover:text-red-600 text-sm"
                      aria-label="프로필 삭제"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={`name-${index}`}
                    className="block text-xs font-medium text-gray-600 mb-1"
                  >
                    이름
                  </label>
                  <input
                    id={`name-${index}`}
                    type="text"
                    value={profile.name}
                    onChange={(e) =>
                      handleProfileChange(index, 'name', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="예: 김철수"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor={`role-${index}`}
                    className="block text-xs font-medium text-gray-600 mb-1"
                  >
                    역할/직책
                  </label>
                  <input
                    id={`role-${index}`}
                    type="text"
                    value={profile.role}
                    onChange={(e) =>
                      handleProfileChange(index, 'role', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="예: CEO & Co-Founder"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor={`bio-${index}`}
                    className="block text-xs font-medium text-gray-600 mb-1"
                  >
                    소개
                  </label>
                  <textarea
                    id={`bio-${index}`}
                    value={profile.bio}
                    onChange={(e) =>
                      handleProfileChange(index, 'bio', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={2}
                    placeholder="간단한 경력이나 전문 분야를 입력하세요"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    프로필 이미지 (선택)
                  </label>
                  <ImageUploader
                    currentImage={profile.image || ''}
                    onImageChange={(base64) => handleProfileChange(index, 'image', base64)}
                    maxSizeMB={2}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
            <Lightbulb className="w-3.5 h-3.5 flex-shrink-0" />
            <span>1-3명: 인원수만큼, 4-6명: 3열 그리드로 표시돼요 (최대 6명)</span>
          </p>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="flex items-center gap-1.5 text-xs text-purple-700">
          <Users className="w-3.5 h-3.5 flex-shrink-0" />
          <span>각 프로필은 원형 이미지와 이름, 역할, 소개로 표시돼요</span>
        </p>
      </div>
    </div>
  );
}
