'use client';

/**
 * 카카오 애드핏 광고 컴포넌트
 *
 * @description
 * 160x600 사이즈의 카카오 애드핏 세로 배너 광고를 표시합니다.
 *
 * 스크립트는 layout.tsx에서 한 번만 로드되므로 여기서는 광고 영역만 렌더링합니다.
 *
 * @example
 * ```tsx
 * <KakaoAd />
 * ```
 */
export default function KakaoAd() {
  return (
    <div className="kakao-ad-container">
      {/* 광고 영역 */}
      <ins
        className="kakao_ad_area"
        style={{ display: 'none' }}
        data-ad-unit="DAN-4nZcvZfI1HTVl91S"
        data-ad-width="160"
        data-ad-height="600"
      />
    </div>
  );
}
