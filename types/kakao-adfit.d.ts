/**
 * 카카오 애드핏 전역 타입 선언
 *
 * @description
 * window.adfit API를 TypeScript에서 사용하기 위한 타입 정의입니다.
 * 광고 컴포넌트 언마운트 시 cleanup을 위해 destroy 메서드를 사용합니다.
 */

interface Window {
  adfit?: {
    /**
     * 광고 단위 제거
     * @param unit - 광고 단위 ID (예: 'DAN-gw6hndJJ9GnJvpMC')
     */
    destroy: (unit: string) => void;
  };
}
