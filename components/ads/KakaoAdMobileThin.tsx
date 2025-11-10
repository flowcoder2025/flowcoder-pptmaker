'use client';

/**
 * 카카오 애드핏 모바일 얇은 광고 컴포넌트
 *
 * @description
 * 320x50 사이즈의 카카오 애드핏 모바일 배너 광고를 표시합니다.
 * 모바일 하단 고정 위치에 배치됩니다.
 *
 * 스크립트는 layout.tsx에서 한 번만 로드되므로 여기서는 광고 영역만 렌더링합니다.
 *
 * @example
 * ```tsx
 * <KakaoAdMobileThin />
 * ```
 */
export default function KakaoAdMobileThin() {
  return (
    <div className="kakao-ad-mobile-thin-container flex justify-center items-center w-full py-2 bg-gray-50">
      {/* 광고 영역 */}
      <ins
        className="kakao_ad_area"
        style={{ display: 'none' }}
        data-ad-unit="DAN-kxw4yJT2g31vNCIv"
        data-ad-width="320"
        data-ad-height="50"
      />
    </div>
  );
}
