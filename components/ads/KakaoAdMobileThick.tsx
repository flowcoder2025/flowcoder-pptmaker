'use client';

import Script from 'next/script';

/**
 * 카카오 애드핏 모바일 굵은 광고 컴포넌트
 *
 * @description
 * 320x100 사이즈의 카카오 애드핏 모바일 배너 광고를 표시합니다.
 * 홈화면과 인풋 페이지 중간 위치에 배치됩니다.
 *
 * Next.js Script 컴포넌트의 id prop을 사용하여 중복 로드를 방지합니다.
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
