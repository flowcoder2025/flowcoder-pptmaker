'use client';

import Script from 'next/script';

/**
 * 카카오 애드핏 가로 배너 광고 컴포넌트
 *
 * @description
 * 728x90 사이즈의 카카오 애드핏 가로 배너 광고를 표시합니다.
 * 일반적으로 페이지 상단이나 하단에 배치됩니다.
 *
 * Next.js Script 컴포넌트의 id prop을 사용하여 중복 로드를 방지합니다.
 * KakaoAd 컴포넌트와 동일한 id를 사용하여 스크립트가 한 번만 로드됩니다.
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
