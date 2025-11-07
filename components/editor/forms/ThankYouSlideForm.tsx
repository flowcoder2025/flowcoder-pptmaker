/**
 * ThankYouSlideForm 컴포넌트
 * 감사 슬라이드 편집 폼
 */

'use client';

import type { ThankYouSlide } from '@/types/slide';

interface ThankYouSlideFormProps {
  slide: ThankYouSlide;
  onChange: (updatedSlide: ThankYouSlide) => void;
}

export default function ThankYouSlideForm({ slide, onChange }: ThankYouSlideFormProps) {
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        message: e.target.value,
      },
    });
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        contact: e.target.value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">감사 슬라이드 편집</h3>
        <p className="text-sm text-gray-600 mb-6">
          프리젠테이션을 마무리하는 감사 메시지를 입력하세요
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            감사 메시지 <span className="text-red-500">*</span>
          </label>
          <input
            id="message"
            type="text"
            value={slide.props.message}
            onChange={handleMessageChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            placeholder="예: 감사합니다!"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 간결하고 진심이 담긴 감사 인사를 작성하세요
          </p>
        </div>

        <div>
          <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-2">
            연락처 정보 (선택)
          </label>
          <input
            id="contact"
            type="text"
            value={slide.props.contact || ''}
            onChange={handleContactChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="예: email@example.com | +82-10-1234-5678"
          />
          <p className="text-xs text-gray-500 mt-1">
            📧 이메일, 전화번호, 웹사이트 등을 입력하세요
          </p>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-xs text-green-700 text-center">
          🙏 마지막 슬라이드로 감사 메시지와 연락처를 표시해요
        </p>
      </div>
    </div>
  );
}
