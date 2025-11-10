'use client';

import Script from 'next/script';

/**
 * 카카오 애드핏 광고 컴포넌트
 *
 * @description
 * 160x600 사이즈의 카카오 애드핏 세로 배너 광고를 표시합니다.
 *
 * Next.js Script 컴포넌트의 id prop을 사용하여 중복 로드를 방지합니다.
 * 동일한 id를 가진 스크립트는 한 번만 로드됩니다.
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

      {/* 카카오 애드핏 스크립트 - id로 중복 로드 방지 */}
      <Script
        id="kakao-adfit-sdk"
        async
        type="text/javascript"
        src="https://t1.daumcdn.net/kas/static/ba.min.js"
        strategy="afterInteractive"
      />
    </div>
  );
}
