'use client';

import { useEffect, useRef } from 'react';

/**
 * 카카오 애드핏 광고 컴포넌트
 *
 * @description
 * 160x600 사이즈의 카카오 애드핏 세로 배너 광고를 표시합니다.
 *
 * Next.js 페이지 전환 시 광고가 제대로 로드되도록 useEffect에서
 * 스크립트를 동적으로 로드하고, cleanup 시 destroy를 호출합니다.
 *
 * @example
 * ```tsx
 * <KakaoAd />
 * ```
 */
export default function KakaoAd() {
  const scriptElement = useRef<HTMLDivElement>(null);
  const adUnit = 'DAN-4nZcvZfI1HTVl91S';

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
    <div ref={scriptElement} className="kakao-ad-container">
      {/* 광고 영역 */}
      <ins
        className="kakao_ad_area"
        style={{ display: 'none' }}
        data-ad-unit={adUnit}
        data-ad-width="160"
        data-ad-height="600"
      />
    </div>
  );
}
