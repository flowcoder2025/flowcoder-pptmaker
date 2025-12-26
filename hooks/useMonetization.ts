/**
 * 통합 수익화 훅 (크래딧 시스템 v4.0)
 *
 * @description
 * 광고, 구독, 크래딧을 통합 관리하는 훅
 *
 * @example
 * ```tsx
 * const monetization = useMonetization();
 *
 * // 생성 전 결제 검증
 * const validation = monetization.validateGeneration(options);
 *
 * if (validation.requiresAd) {
 *   await monetization.showAdBeforeGeneration();
 * }
 *
 * // 생성 진행
 * await generateSlides(options);
 *
 * // 다운로드 전 광고 (무료 사용자)
 * if (monetization.requiresDownloadAd()) {
 *   await monetization.showAdBeforeDownload();
 * }
 * ```
 */

'use client';

import { useCallback } from 'react';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { useCreditStore } from '@/store/creditStore';
import { useAd } from '@/hooks/useAd';
import type {
  GenerationOptions,
  PaymentValidation,
  SubscriptionPlan,
  CreditUsageType,
} from '@/types/monetization';
import { logger } from '@/lib/logger';

/**
 * 통합 수익화 훅 상태
 */
export interface MonetizationState {
  /** 광고 상태 */
  ad: ReturnType<typeof useAd>;

  /** 구독 플랜 */
  plan: SubscriptionPlan;

  /** 광고 제거 여부 (구독자) */
  isAdFree: boolean;

  /** 전체 크래딧 잔액 */
  totalCredits: number;

  /** 최초 무료 사용 가능 여부 */
  isFirstTimeFree: (type: CreditUsageType) => boolean;

  /**
   * 생성 검증 (광고 필요 여부 + 크래딧 확인)
   */
  validateGeneration: (options: GenerationOptions) => PaymentValidation;

  /**
   * 생성 전 광고 표시
   */
  showAdBeforeGeneration: () => Promise<void>;

  /**
   * 다운로드 전 광고 필요 여부
   */
  requiresDownloadAd: () => boolean;

  /**
   * 다운로드 전 광고 표시
   */
  showAdBeforeDownload: () => Promise<void>;

  /**
   * 크래딧 차감 처리
   */
  processCredits: (options: GenerationOptions) => Promise<boolean>;
}

/**
 * 통합 수익화 훅
 */
export const useMonetization = (): MonetizationState => {
  const subscriptionStore = useSubscriptionStore();
  const creditStore = useCreditStore();
  const ad = useAd();

  /**
   * 생성 검증
   */
  const validateGeneration = useCallback(
    (options: GenerationOptions): PaymentValidation => {
      const { aiModel, research } = options;

      // 무료 사용 (광고 필수)
      const isFreeUsage =
        (research === 'none' && aiModel === 'flash') ||
        (research === 'basic' && aiModel === 'flash');

      if (isFreeUsage) {
        return {
          allowed: true,
          method: 'free',
          price: 0,
          requiresAd: !subscriptionStore.isAdFree(),
          message: subscriptionStore.isAdFree()
            ? '구독자 혜택: 광고 없이 사용하실 수 있어요'
            : '광고를 시청하시고 무료로 사용하실 수 있어요',
        };
      }

      // Pro 모델 사용 (50 크래딧)
      if (aiModel === 'pro') {
        const isFirstFree = creditStore.isFirstTimeFree('qualityGeneration');
        const creditCost = creditStore.getCreditCost('qualityGeneration');
        const hasCredit = creditStore.totalCredits >= creditCost;

        if (isFirstFree) {
          return {
            allowed: true,
            method: 'bundle',
            price: 0,
            requiresAd: false,
            message: '🎁 최초 1회 무료로 고품질 생성을 사용할 수 있어요',
          };
        }

        if (hasCredit) {
          return {
            allowed: true,
            method: 'bundle',
            price: 0,
            requiresAd: false,
            message: `${creditCost} 크래딧을 사용해요 (잔액: ${creditStore.totalCredits})`,
          };
        }

        // 크래딧 부족
        return {
          allowed: false,
          method: 'bundle',
          price: 0,
          requiresAd: false,
          message: `크래딧이 부족해요. ${creditCost} 크래딧이 필요해요.`,
        };
      }

      // 깊은 조사 사용 (40 크래딧)
      if (research === 'deep') {
        const isFirstFree = creditStore.isFirstTimeFree('deepResearch');
        const creditCost = creditStore.getCreditCost('deepResearch');
        const hasCredit = creditStore.totalCredits >= creditCost;

        if (isFirstFree) {
          return {
            allowed: true,
            method: 'bundle',
            price: 0,
            requiresAd: false,
            message: '🎁 최초 1회 무료로 심층 검색을 사용할 수 있어요',
          };
        }

        if (hasCredit) {
          return {
            allowed: true,
            method: 'bundle',
            price: 0,
            requiresAd: false,
            message: `${creditCost} 크래딧을 사용해요 (잔액: ${creditStore.totalCredits})`,
          };
        }

        // 크래딧 부족
        return {
          allowed: false,
          method: 'bundle',
          price: 0,
          requiresAd: false,
          message: `크래딧이 부족해요. ${creditCost} 크래딧이 필요해요.`,
        };
      }

      // 여기 도달하면 안 됨
      return {
        allowed: false,
        method: 'free',
        price: 0,
        requiresAd: false,
        message: '알 수 없는 옵션이에요',
      };
    },
    [subscriptionStore, creditStore]
  );

  /**
   * 생성 전 광고 표시
   */
  const showAdBeforeGeneration = useCallback(async () => {
    if (subscriptionStore.isAdFree()) {
      logger.debug('구독자: 생성 전 광고 생략');
      return;
    }

    logger.debug('생성 전 광고 표시');
    await ad.showAd();
  }, [subscriptionStore, ad]);

  /**
   * 다운로드 전 광고 필요 여부
   */
  const requiresDownloadAd = useCallback((): boolean => {
    return !subscriptionStore.isAdFree();
  }, [subscriptionStore]);

  /**
   * 다운로드 전 광고 표시
   */
  const showAdBeforeDownload = useCallback(async () => {
    if (subscriptionStore.isAdFree()) {
      logger.debug('구독자: 다운로드 전 광고 생략');
      return;
    }

    logger.debug('다운로드 전 광고 표시');
    await ad.showAd();
  }, [subscriptionStore, ad]);

  /**
   * 크래딧 차감 처리
   */
  const processCredits = useCallback(
    async (options: GenerationOptions): Promise<boolean> => {
      const validation = validateGeneration(options);

      if (!validation.allowed) {
        logger.warn('크래딧 부족', { message: validation.message });
        return false;
      }

      // 무료 사용
      if (validation.method === 'free') {
        logger.debug('무료 사용 (광고 시청)');
        return true;
      }

      // 크래딧 사용
      if (validation.method === 'bundle') {
        // Pro 모델
        if (options.aiModel === 'pro') {
          const isFirstFree = creditStore.isFirstTimeFree('qualityGeneration');
          if (isFirstFree) {
            creditStore.useFirstTimeFree('qualityGeneration');
            logger.info('최초 무료 사용: 고품질 생성');
            return true;
          } else {
            const creditCost = creditStore.getCreditCost('qualityGeneration');
            const success = creditStore.useCredits(creditCost);
            logger.info('크래딧 차감', { creditCost, success });
            return success;
          }
        }

        // 깊은 조사
        if (options.research === 'deep') {
          const isFirstFree = creditStore.isFirstTimeFree('deepResearch');
          if (isFirstFree) {
            creditStore.useFirstTimeFree('deepResearch');
            logger.info('최초 무료 사용: 심층 검색');
            return true;
          } else {
            const creditCost = creditStore.getCreditCost('deepResearch');
            const success = creditStore.useCredits(creditCost);
            logger.info('크래딧 차감', { creditCost, success });
            return success;
          }
        }
      }

      return false;
    },
    [validateGeneration, creditStore]
  );

  return {
    ad,
    plan: subscriptionStore.plan,
    isAdFree: subscriptionStore.isAdFree(),
    totalCredits: creditStore.totalCredits,
    isFirstTimeFree: creditStore.isFirstTimeFree,
    validateGeneration,
    showAdBeforeGeneration,
    requiresDownloadAd,
    showAdBeforeDownload,
    processCredits,
  };
};
