'use client';

/**
 * 카카오 애드핏 모바일 굵은 광고 컴포넌트
 *
 * @description
 * 320x100 사이즈의 카카오 애드핏 모바일 배너 광고를 표시합니다.
 * 홈화면과 인풋 페이지 중간 위치에 배치됩니다.
 *
 * 스크립트는 layout.tsx에서 한 번만 로드되므로 여기서는 광고 영역만 렌더링합니다.
 *
 * @example
 * ```tsx
 * <KakaoAdMobileThick />
 * ```
 */
export default function KakaoAdMobileThick() {
  return (
    <div className="kakao-ad-mobile-thick-container flex justify-center items-center w-full py-4 bg-gray-50">
      {/* 광고 영역 */}
      <ins
        className="kakao_ad_area"
        style={{ display: 'none' }}
        data-ad-unit="DAN-gw6hndJJ9GnJvpMC"
        data-ad-width="320"
        data-ad-height="100"
      />
    </div>
  );
}
