/**
 * 광고 훅 (WebView 전면광고)
 *
 * @description
 * GoogleAdMob 전면광고 연동 훅 (WebView용)
 *
 * @example
 * ```tsx
 * const ad = useAd();
 *
 * // 광고 로드
 * useEffect(() => {
 *   ad.loadAd();
 *   return ad.cleanup;
 * }, []);
 *
 * // 광고 표시
 * const handleGenerate = async () => {
 *   await ad.showAd();
 *   // 광고 종료 후 슬라이드 생성
 *   generateSlides();
 * };
 * ```
 *
 * @reference
 * - Bedrock SDK: docs/reference/bedrock/ads/loadAppsInTossAdMob.md
 */

'use client';

import { useState, useCallback, useRef } from 'react';

/**
 * 광고 환경 체크 (런타임에서만 사용)
 */
const checkAdSupport = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    // @ts-expect-error - 앱인토스 런타임 API
    return window.GoogleAdMob?.loadAppsInTossAdMob?.isSupported?.() === true;
  } catch {
    return false;
  }
};

/**
 * 광고 이벤트 타입
 */
interface AdEvent {
  type:
    | 'loaded'
    | 'requested'
    | 'clicked'
    | 'dismissed'
    | 'failedToShow'
    | 'impression'
    | 'show';
  data?: unknown;
}

/**
 * 광고 훅 상태
 */
export interface AdState {
  /** 광고 로딩 중 */
  loading: boolean;

  /** 광고 준비 완료 */
  ready: boolean;

  /** 에러 메시지 */
  error: string | null;

  /** 광고 지원 여부 */
  supported: boolean;

  /** 광고 로드 */
  loadAd: () => void;

  /** 광고 표시 (Promise로 종료 대기) */
  showAd: () => Promise<void>;

  /** Cleanup 함수 */
  cleanup: () => void;
}

/**
 * 광고 훅
 *
 * ⚠️ 주의:
 * - 앱인토스 앱에서만 동작해요
 * - 개발자 콘솔에서 광고 그룹 ID 발급 필요
 * - 테스트 ID: 'ait-ad-test-interstitial-id'
 */
export const useAd = (): AdState => {
  const [loading, setLoading] = useState<boolean>(false);
  const [ready, setReady] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [supported] = useState<boolean>(() => checkAdSupport());

  const cleanupRef = useRef<(() => void) | null>(null);
  const dismissResolveRef = useRef<(() => void) | null>(null);

  /**
   * 광고 로드
   */
  const loadAd = useCallback(() => {
    if (!supported) {
      console.warn('[Ad] 광고가 지원되지 않는 환경이에요');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 환경 변수에서 광고 그룹 ID 가져오기
      const AD_GROUP_ID =
        process.env.NEXT_PUBLIC_AD_GROUP_ID || 'ait-ad-test-interstitial-id';

      // @ts-expect-error - 앱인토스 런타임 API
      const cleanup = window.GoogleAdMob.loadAppsInTossAdMob({
        options: {
          adGroupId: AD_GROUP_ID,
        },
        onEvent: (event: AdEvent) => {
          console.log('[Ad] 로드 이벤트:', event.type);

          if (event.type === 'loaded') {
            setLoading(false);
            setReady(true);
            console.log('[Ad] 광고 로드 완료');
          }
        },
        onError: (err: unknown) => {
          console.error('[Ad] 로드 실패:', err);
          setLoading(false);
          setError('광고를 불러오지 못했어요');
        },
      });

      cleanupRef.current = cleanup;
    } catch (err) {
      console.error('[Ad] 광고 로드 중 오류:', err);
      setLoading(false);
      setError('광고 로드 중 문제가 발생했어요');
    }
  }, [supported]);

  /**
   * 광고 표시 (Promise로 종료 대기)
   */
  const showAd = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!supported) {
        console.warn('[Ad] 광고가 지원되지 않는 환경이에요');
        resolve(); // 지원 안 되면 그냥 통과
        return;
      }

      if (!ready) {
        console.warn('[Ad] 광고가 준비되지 않았어요');
        resolve(); // 준비 안 되면 그냥 통과
        return;
      }

      try {
        // 환경 변수에서 광고 그룹 ID 가져오기
        const AD_GROUP_ID =
          process.env.NEXT_PUBLIC_AD_GROUP_ID || 'ait-ad-test-interstitial-id';

        dismissResolveRef.current = resolve;

        // @ts-expect-error - 앱인토스 런타임 API
        window.GoogleAdMob.showAppsInTossAdMob({
          options: {
            adGroupId: AD_GROUP_ID,
          },
          onEvent: (event: AdEvent) => {
            console.log('[Ad] 표시 이벤트:', event.type);

            switch (event.type) {
              case 'requested':
                console.log('[Ad] 광고 요청됨');
                break;

              case 'show':
                console.log('[Ad] 광고 표시 시작');
                break;

              case 'impression':
                console.log('[Ad] 광고 노출됨 (수익 발생)');
                break;

              case 'clicked':
                console.log('[Ad] 광고 클릭됨');
                break;

              case 'dismissed':
                console.log('[Ad] 광고 닫힘');
                setReady(false);
                dismissResolveRef.current?.();
                dismissResolveRef.current = null;
                break;

              case 'failedToShow':
                console.warn('[Ad] 광고 표시 실패');
                setReady(false);
                dismissResolveRef.current?.();
                dismissResolveRef.current = null;
                break;
            }
          },
          onError: (err: unknown) => {
            console.error('[Ad] 표시 실패:', err);
            setReady(false);
            reject(new Error('광고 표시 중 문제가 발생했어요'));
            dismissResolveRef.current = null;
          },
        });
      } catch (err) {
        console.error('[Ad] 광고 표시 중 오류:', err);
        reject(err);
        dismissResolveRef.current = null;
      }
    });
  }, [supported, ready]);

  /**
   * Cleanup
   */
  const cleanup = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
  }, []);

  return {
    loading,
    ready,
    error,
    supported,
    loadAd,
    showAd,
    cleanup,
  };
};
