'use client';

/**
 * 카카오 애드핏 가로 배너 광고 컴포넌트
 *
 * @description
 * 728x90 사이즈의 카카오 애드핏 가로 배너 광고를 표시합니다.
 * 일반적으로 페이지 상단이나 하단에 배치됩니다.
 *
 * 스크립트는 layout.tsx에서 한 번만 로드되므로 여기서는 광고 영역만 렌더링합니다.
 *
 * @example
 * ```tsx
 * <KakaoAdBanner />
 * ```
 */
export default function KakaoAdBanner() {
  return (
    <div className="kakao-ad-banner-container flex justify-center items-center w-full py-4 bg-gray-50">
      {/* 광고 영역 */}
      <ins
        className="kakao_ad_area"
        style={{ display: 'none' }}
        data-ad-unit="DAN-KdwUe18xk7G0tjME"
        data-ad-width="728"
        data-ad-height="90"
      />
    </div>
  );
}
