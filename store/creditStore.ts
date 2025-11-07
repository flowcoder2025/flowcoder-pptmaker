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
  useCredits: (amount: number) => Promise<boolean>;

  /**
   * 크래딧 추가
   */
  addCredits: (amount: number) => Promise<void>;

  /**
   * API에서 크레딧 잔액 가져오기
   */
  fetchBalance: () => Promise<void>;

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

      useCredits: async (amount) => {
        const { totalCredits } = get();

        if (totalCredits < amount) {
          console.warn(`[Credit] 크래딧 부족: 필요 ${amount}, 보유 ${totalCredits}`);
          return false;
        }

        try {
          // API 호출: 크레딧 소비
          const response = await fetch('/api/credits/consume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount }),
          });

          if (!response.ok) {
            throw new Error(`크레딧 사용 실패: ${response.status}`);
          }

          const data = await response.json();

          // 서버에서 반환된 최신 잔액으로 업데이트
          set({ totalCredits: data.balance });
          console.log(`✅ 크래딧 사용: -${amount} (남은 크래딧: ${data.balance})`);
          return true;
        } catch (error) {
          console.error('❌ 크래딧 사용 실패:', error);
          // 에러 시 로컬 상태 업데이트 (fallback)
          set({ totalCredits: totalCredits - amount });
          console.log(`[Credit] 로컬 크래딧 사용 (fallback): -${amount} (남은 크래딧: ${totalCredits - amount})`);
          return true;
        }
      },

      addCredits: async (amount) => {
        try {
          // API 호출: 크레딧 구매
          const response = await fetch('/api/credits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount }),
          });

          if (!response.ok) {
            throw new Error(`크레딧 구매 실패: ${response.status}`);
          }

          const data = await response.json();

          // 서버에서 반환된 최신 잔액으로 업데이트
          set({ totalCredits: data.balance });
          console.log(`✅ 크래딧 충전: +${amount} (현재 ${data.balance})`);
        } catch (error) {
          console.error('❌ 크래딧 충전 실패:', error);
          // 에러 시 로컬 상태 업데이트 (fallback)
          set((state) => ({
            totalCredits: state.totalCredits + amount,
          }));
          console.log(`[Credit] 로컬 크래딧 충전 (fallback): +${amount} (현재 ${get().totalCredits})`);
        }
      },

      fetchBalance: async () => {
        try {
          const response = await fetch('/api/credits');

          if (!response.ok) {
            // 401/403이면 로그인 필요
            if (response.status === 401 || response.status === 403) {
              console.log('⚠️ 인증 필요: 로그인 후 크레딧 조회 가능');
              return;
            }
            throw new Error(`크레딧 조회 실패: ${response.status}`);
          }

          const data = await response.json();

          set({ totalCredits: data.balance });
          console.log(`✅ 크레딧 잔액 로드: ${data.balance} 크래딧`);
        } catch (error) {
          console.error('❌ 크레딧 잔액 조회 실패:', error);
          // 에러 시 로컬 상태 유지 (fallback)
        }
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
