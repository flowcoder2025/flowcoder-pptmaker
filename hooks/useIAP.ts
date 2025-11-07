'use client';

import { useState } from 'react';
import type {
  TemplateSKU,
  IAPState,
} from '@/types/iap';

/**
 * IAP(인앱 결제) 훅
 *
 * @description
 * 프리미엄 템플릿 개별 구매를 위한 인앱 결제 훅
 *
 * @example
 * ```tsx
 * const iap = useIAP();
 *
 * // 템플릿 구매
 * const success = await iap.purchaseTemplate('template_premium_business');
 *
 * // 구매 여부 확인
 * const isPurchased = iap.isPurchased('template_premium_business');
 * ```
 *
 * @reference
 * - Bedrock SDK: docs/reference/bedrock/payment/iap/createOneTimePurchaseOrder.md
 */
export const useIAP = (): IAPState => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [purchasedTemplates, setPurchasedTemplates] = useState<TemplateSKU[]>(
    []
  );

  /**
   * 템플릿 구매
   *
   * @param sku - 템플릿 SKU
   * @returns 구매 성공 여부
   */
  const purchaseTemplate = async (sku: TemplateSKU): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Apps in Toss IAP SDK 연동
      console.log('[IAP] 템플릿 구매 요청:', sku);
      console.warn('[IAP] Apps in Toss IAP SDK 미구현');

      // 실제 구현:
      // 1. Apps in Toss IAP SDK 연동
      // 2. 서버에서 구매 검증
      // 3. 구매 내역 DB 저장
      // 4. 로컬 상태 업데이트

      // 임시: 미구현 상태
      setLoading(false);
      return false;

      /* 실제 구현 시 주석 해제:
      const cleanup = IAP.createOneTimePurchaseOrder({
        options: {
          sku,
          processProductGrant: async ({ orderId }: ProcessProductGrantParams) => {
            console.log('[IAP] 구매 검증 시작:', { orderId, sku });

            const response = await fetch('/api/iap/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId, sku }),
            });

            const data: VerifyPurchaseResponse = await response.json();

            if (data.error) {
              console.error('[IAP] 구매 검증 실패:', data.error);
              return false;
            }

            const success = data?.data?.success;

            if (success?.unlocked) {
              console.log('[IAP] 템플릿 잠금 해제 성공:', success.templateId);
              setPurchasedTemplates((prev) => [...prev, sku]);
              return true;
            }

            return false;
          },
        },
        onEvent: (event: IAPEvent) => {
          console.log('[IAP] 이벤트:', event);
          if (event.type === 'success') {
            console.log('[IAP] 구매 성공:', event.orderId);
          } else if (event.type === 'cancel') {
            setError('구매를 취소했어요.');
          }
        },
        onError: (error: unknown) => {
          console.error('[IAP] 에러:', error);
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
          setError(`구매 실패: ${errorMessage}`);
        },
      });

      if (cleanup) {
        cleanup();
      }

      return true;
      */
    } catch (e) {
      console.error('[IAP] 구매 실패:', e);
      setError('구매 중 문제가 발생했어요.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 구매 여부 확인
   *
   * @param sku - 템플릿 SKU
   * @returns 구매 여부
   */
  const isPurchased = (sku: TemplateSKU): boolean => {
    return purchasedTemplates.includes(sku);
  };

  return {
    loading,
    error,
    purchaseTemplate,
    isPurchased,
    purchasedTemplates,
  };
};
