'use client';

import Script from 'next/script';

/**
 * 카카오 애드핏 모바일 얇은 광고 컴포넌트
 *
 * @description
 * 320x50 사이즈의 카카오 애드핏 모바일 배너 광고를 표시합니다.
 * 모바일 하단 고정 위치에 배치됩니다.
 *
 * Next.js Script 컴포넌트의 id prop을 사용하여 중복 로드를 방지합니다.
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
