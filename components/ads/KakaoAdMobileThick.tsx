'use client';

import { useEffect, useRef } from 'react';

/**
 * 카카오 애드핏 모바일 굵은 광고 컴포넌트
 *
 * @description
 * 320x100 사이즈의 카카오 애드핏 모바일 배너 광고를 표시합니다.
 * 홈화면과 인풋 페이지 중간 위치에 배치됩니다.
 *
 * Next.js 페이지 전환 시 광고가 제대로 로드되도록 useEffect에서
 * 스크립트를 동적으로 로드하고, cleanup 시 destroy를 호출합니다.
 *
 * @example
 * ```tsx
 * <KakaoAdMobileThick />
 * ```
 */
export default function KakaoAdMobileThick() {
  const scriptElement = useRef<HTMLDivElement>(null);
  const adUnit = 'DAN-gw6hndJJ9GnJvpMC';

  useEffect(() => {
    // 스크립트 동적 로드
    const script = document.createElement('script');
    script.src = 'https://t1.daumcdn.net/kas/static/ba.min.js';
    script.async = true;
    script.type = 'text/javascript';

    if (scriptElement.current) {
      scriptElement.current.appendChild(script);
    }

    // Cleanup: 컴포넌트 언마운트 시 광고 제거
    return () => {
      if (window.adfit) {
        window.adfit.destroy(adUnit);
      }
    };
  }, []);

  return (
    <div
      ref={scriptElement}
      className="kakao-ad-mobile-thick-container flex justify-center items-center w-full py-4 bg-gray-50"
    >
      {/* 광고 영역 */}
      <ins
        className="kakao_ad_area"
        style={{ display: 'none' }}
        data-ad-unit={adUnit}
        data-ad-width="320"
        data-ad-height="100"
      />
    </div>
  );
}
