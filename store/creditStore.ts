import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CreditUsageType } from '@/types/monetization';
import { CREDIT_COST } from '@/constants/credits';

/**
 * 크레딧 상태 인터페이스
 */
interface CreditState {
  // 총 크래딧 수
  totalCredits: number;

  // 최초 무료 사용 추적
  firstTimeFree: {
    deepResearch: boolean; // true면 이미 사용함
    qualityGeneration: boolean;
  };

  /**
   * 크래딧 사용 가능 여부 확인
   */
  canUseCredits: (amount: number) => boolean;

  /**
   * 크래딧 사용
   */
  useCredits: (amount: number) => boolean;

  /**
   * 크래딧 추가
   */
  addCredits: (amount: number) => void;

  /**
   * 최초 무료 사용 가능 여부 확인
   */
  isFirstTimeFree: (type: CreditUsageType) => boolean;

  /**
   * 최초 무료 사용 처리
   */
  useFirstTimeFree: (type: CreditUsageType) => void;

  /**
   * 특정 타입의 크래딧 비용 확인
   */
  getCreditCost: (type: CreditUsageType) => number;

  /**
   * 크래딧 초기화
   */
  reset: () => void;
}

/**
 * 크레딧 관리 Store (단일 크래딧 시스템)
 *
 * @description
 * 100원 = 10 크래딧 환산
 * - 심층 검색: 40 크래딧 (400원)
 * - 고품질 생성: 50 크래딧 (500원)
 * - 최초 1회 무료 제공
 *
 * @example
 * ```tsx
 * const { totalCredits, useCredits, isFirstTimeFree } = useCreditStore();
 *
 * // 최초 무료 체크
 * if (isFirstTimeFree('qualityGeneration')) {
 *   useFirstTimeFree('qualityGeneration');
 * } else {
 *   // 크래딧 차감
 *   if (useCredits(50)) {
 *     // 고품질 생성 진행
 *   }
 * }
 * ```
 */
export const useCreditStore = create<CreditState>()(
  persist(
    (set, get) => ({
      totalCredits: 0,
      firstTimeFree: {
        deepResearch: false,
        qualityGeneration: false,
      },

      canUseCredits: (amount) => {
        const { totalCredits } = get();
        return totalCredits >= amount;
      },

      useCredits: (amount) => {
        const { totalCredits } = get();

        if (totalCredits < amount) {
          console.warn(`[Credit] 크래딧 부족: 필요 ${amount}, 보유 ${totalCredits}`);
          return false;
        }

        set({ totalCredits: totalCredits - amount });
        console.log(`[Credit] 크래딧 사용: -${amount} (남은 크래딧: ${totalCredits - amount})`);
        return true;
      },

      addCredits: (amount) => {
        set((state) => ({
          totalCredits: state.totalCredits + amount,
        }));
        console.log(`[Credit] 크래딧 충전: +${amount} (현재 ${get().totalCredits})`);
      },

      isFirstTimeFree: (type) => {
        const { firstTimeFree } = get();
        return !firstTimeFree[type]; // false면 아직 사용 안함 (무료 가능)
      },

      useFirstTimeFree: (type) => {
        const { firstTimeFree } = get();

        if (firstTimeFree[type]) {
          console.warn(`[Credit] 이미 최초 무료를 사용했어요: ${type}`);
          return;
        }

        set({
          firstTimeFree: {
            ...firstTimeFree,
            [type]: true,
          },
        });

        console.log(`[Credit] 최초 무료 사용: ${type}`);
      },

      getCreditCost: (type) => {
        return type === 'deepResearch'
          ? CREDIT_COST.DEEP_RESEARCH
          : CREDIT_COST.QUALITY_GENERATION;
      },

      reset: () => {
        set({
          totalCredits: 0,
          firstTimeFree: {
            deepResearch: false,
            qualityGeneration: false,
          },
        });
        console.log('[Credit] 크래딧 초기화');
      },
    }),
    {
      name: 'credit-storage', // localStorage key
    }
  )
);
