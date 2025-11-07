import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SubscriptionPlan } from '@/types/monetization';
import {
  getMonthlyCredits as getPlanMonthlyCredits,
  getPayPerUseDiscount as getPlanPayPerUseDiscount,
  getMaxSlides as getPlanMaxSlides,
  hasWatermark as planHasWatermark,
  getPremiumTemplatesAccess as getPlanPremiumTemplatesAccess,
} from '@/constants/subscription';

/**
 * 구독 상태 인터페이스 (하이브리드 모델)
 */
interface SubscriptionState {
  // 현재 구독 플랜
  plan: SubscriptionPlan;

  // 구독 만료 시간 (Unix timestamp)
  expiresAt: number | null;

  // 구독 상태
  status: 'active' | 'canceled' | 'expired';

  // 자동 갱신 여부
  autoRenewal: boolean;

  // 구독 ID (토스페이 구독 관리용)
  subscriptionId: string | null;

  // 이번 달 크래딧 제공 완료 여부
  monthlyCreditsProvided: boolean;

  // 마지막 크래딧 제공 날짜
  lastCreditProvidedDate: number;

  // 구독 시작 날짜 (갱신 주기 계산용)
  subscriptionStartDate: number | null;

  /**
   * 플랜 설정
   */
  setPlan: (
    plan: SubscriptionPlan,
    expiresAt: number | null,
    subscriptionId?: string
  ) => void;

  /**
   * 구독 상태 업데이트
   */
  setStatus: (status: 'active' | 'canceled' | 'expired') => void;

  /**
   * 자동 갱신 설정
   */
  setAutoRenewal: (enabled: boolean) => void;

  /**
   * 구독 활성 여부 확인
   */
  isActive: () => boolean;

  /**
   * 구독 만료 여부 확인
   */
  isExpired: () => boolean;

  /**
   * 남은 일수 계산
   */
  getDaysRemaining: () => number;

  /**
   * 광고 제거 여부
   */
  isAdFree: () => boolean;

  /**
   * 월간 크래딧 제공량 가져오기
   */
  getMonthlyCredits: () => number;

  /**
   * 월간 크래딧 제공 처리
   */
  provideMonthlyCredits: () => void;

  /**
   * 건당 결제 할인율 가져오기
   */
  getPayPerUseDiscount: () => number;

  /**
   * 슬라이드 수 제한 가져오기
   */
  getMaxSlides: () => number;

  /**
   * 워터마크 표시 여부
   */
  hasWatermark: () => boolean;

  /**
   * 프리미엄 템플릿 접근 권한 가져오기
   */
  getPremiumTemplatesAccess: () => 'none' | 'discount' | 'unlimited';

  /**
   * 월별 초기화 (크래딧 제공)
   */
  resetMonthly: () => void;

  /**
   * 구독 초기화 (로그아웃 시 등)
   */
  reset: () => void;
}

/**
 * 구독 관리 Store
 *
 * @description
 * Zustand로 구독 상태를 관리하며, localStorage에 persist됩니다.
 *
 * @example
 * ```tsx
 * const { plan, isActive, setPlan } = useSubscriptionStore();
 *
 * // 구독 활성 여부 확인
 * if (isActive()) {
 *   // Pro 또는 Enterprise 기능 사용 가능
 * }
 *
 * // 플랜 설정
 * setPlan('pro', Date.now() + 30 * 24 * 60 * 60 * 1000);
 * ```
 */
export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      // 초기 상태: 무료 플랜
      plan: 'free',
      expiresAt: null,
      status: 'active',
      autoRenewal: false,
      subscriptionId: null,
      monthlyCreditsProvided: false,
      lastCreditProvidedDate: Date.now(),
      subscriptionStartDate: null,

      setPlan: (plan, expiresAt, subscriptionId) => {
        const now = Date.now();
        const currentState = get();

        set({
          plan,
          expiresAt,
          status: 'active',
          subscriptionId: subscriptionId || null,
          // 구독 시작일 설정 (처음 구독 시에만)
          subscriptionStartDate: currentState.subscriptionStartDate || now,
          // 구독 변경 시 월간 크래딧 제공 상태 초기화
          monthlyCreditsProvided: false,
          lastCreditProvidedDate: now,
        });

        // Pro 이상 플랜이면 즉시 크래딧 제공
        if ((plan === 'pro' || plan === 'premium') && !currentState.monthlyCreditsProvided) {
          get().provideMonthlyCredits();
        }
      },

      setStatus: (status) => {
        set({ status });
      },

      setAutoRenewal: (enabled) => {
        set({ autoRenewal: enabled });
      },

      isActive: () => {
        const { status, expiresAt, plan } = get();

        // 무료 플랜은 항상 활성
        if (plan === 'free') {
          return true;
        }

        // 구독 상태 확인
        if (status === 'canceled' || status === 'expired') {
          return false;
        }

        // 만료 시간 확인
        if (expiresAt && Date.now() > expiresAt) {
          set({ status: 'expired' });
          return false;
        }

        return true;
      },

      isExpired: () => {
        const { expiresAt, plan } = get();

        // 무료 플랜은 만료 없음
        if (plan === 'free') {
          return false;
        }

        return expiresAt ? Date.now() > expiresAt : false;
      },

      getDaysRemaining: () => {
        const { expiresAt, plan } = get();

        // 무료 플랜은 무제한
        if (plan === 'free' || !expiresAt) {
          return -1;
        }

        const remaining = expiresAt - Date.now();
        return Math.max(0, Math.ceil(remaining / (24 * 60 * 60 * 1000)));
      },

      isAdFree: () => {
        const { plan } = get();
        return (plan === 'pro' || plan === 'premium') && get().isActive();
      },

      getMonthlyCredits: () => {
        const { plan } = get();

        if (!get().isActive()) {
          return 0;
        }

        return getPlanMonthlyCredits(plan);
      },

      provideMonthlyCredits: () => {
        const { plan, monthlyCreditsProvided } = get();

        // 무료 플랜이거나 이미 제공했으면 스킵
        if (plan === 'free' || monthlyCreditsProvided) {
          return;
        }

        // 구독이 활성 상태가 아니면 스킵
        if (!get().isActive()) {
          return;
        }

        const monthlyCredits = getPlanMonthlyCredits(plan);

        if (monthlyCredits > 0) {
          // creditStore에 크래딧 추가
          import('@/store/creditStore').then((module) => {
            module.useCreditStore.getState().addCredits(monthlyCredits);
          });

          set({
            monthlyCreditsProvided: true,
            lastCreditProvidedDate: Date.now(),
          });

          console.log(`[Subscription] 월간 크래딧 제공: ${monthlyCredits} 크래딧`);
        }
      },

      getPayPerUseDiscount: () => {
        const { plan } = get();

        if (!get().isActive()) {
          return 0;
        }

        return getPlanPayPerUseDiscount(plan);
      },

      getMaxSlides: () => {
        const { plan } = get();
        return getPlanMaxSlides(plan);
      },

      hasWatermark: () => {
        const { plan } = get();
        return planHasWatermark(plan);
      },

      getPremiumTemplatesAccess: () => {
        const { plan } = get();

        if (!get().isActive()) {
          return 'none';
        }

        return getPlanPremiumTemplatesAccess(plan);
      },

      resetMonthly: () => {
        const { lastCreditProvidedDate, subscriptionStartDate, plan } = get();
        const now = Date.now();

        // 무료 플랜이면 스킵
        if (plan === 'free') {
          return;
        }

        // 구독 시작일 기준으로 갱신 주기 계산
        if (!subscriptionStartDate) {
          // 구독 시작일이 없으면 매월 1일 기준
          const lastMonth = new Date(lastCreditProvidedDate).getMonth();
          const currentMonth = new Date(now).getMonth();

          if (lastMonth !== currentMonth) {
            set({
              monthlyCreditsProvided: false,
            });
            console.log('[Subscription] 월간 크래딧 제공 플래그 초기화 (매월 1일 기준)');
            get().provideMonthlyCredits();
          }
          return;
        }

        const startDate = new Date(subscriptionStartDate);
        const lastProvided = new Date(lastCreditProvidedDate);
        const currentDate = new Date(now);

        const dayOfMonth = startDate.getDate(); // 구독 시작일의 날짜 (1-31)

        // 마지막 제공 이후 갱신일이 지났는지 확인
        const nextResetDate = new Date(lastProvided);
        nextResetDate.setMonth(nextResetDate.getMonth() + 1);
        nextResetDate.setDate(dayOfMonth);

        if (currentDate >= nextResetDate) {
          set({
            monthlyCreditsProvided: false,
          });
          console.log(`[Subscription] 월간 크래딧 제공 플래그 초기화 (매월 ${dayOfMonth}일 기준)`);
          get().provideMonthlyCredits();
        }
      },

      reset: () => {
        set({
          plan: 'free',
          expiresAt: null,
          status: 'active',
          autoRenewal: false,
          subscriptionId: null,
          monthlyCreditsProvided: false,
          lastCreditProvidedDate: Date.now(),
          subscriptionStartDate: null,
        });
      },
    }),
    {
      name: 'subscription-storage', // localStorage key
    }
  )
);

/**
 * 앱 시작 시 월별 초기화 체크
 */
if (typeof window !== 'undefined') {
  useSubscriptionStore.getState().resetMonthly();

  // 하루에 한 번 초기화 체크
  setInterval(
    () => {
      useSubscriptionStore.getState().resetMonthly();
    },
    24 * 60 * 60 * 1000
  );
}
