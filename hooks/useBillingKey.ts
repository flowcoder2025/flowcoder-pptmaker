/**
 * 빌링키 관리 커스텀 훅
 *
 * @description
 * 포트원 SDK를 사용하여 빌링키 발급, 조회, 삭제를 담당하는 훅
 *
 * @example
 * ```typescript
 * const { billingKey, issueBillingKey, deleteBillingKey, isLoading } = useBillingKey();
 *
 * // 빌링키 발급
 * const success = await issueBillingKey();
 * if (success) {
 *   console.log('빌링키 발급 성공!');
 * }
 * ```
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import * as PortOne from '@portone/browser-sdk/v2';

interface BillingKeyInfo {
  id: string;
  billingKeyId: string;
  isActive: boolean;
  cardInfo: {
    issuer: string;
    maskedNumber: string;
    cardType: string;
  };
  expiresAt: string | null;
  createdAt: string;
  isConnectedToSubscription: boolean;
}

interface SubscriptionInfo {
  id: string;
  autoRenewal: boolean;
  nextBillingDate: string | null;
}

interface BillingKeyState {
  billingKey: BillingKeyInfo | null;
  subscription: SubscriptionInfo | null;
  isLoading: boolean;
  error: string | null;
}

export function useBillingKey() {
  const [state, setState] = useState<BillingKeyState>({
    billingKey: null,
    subscription: null,
    isLoading: true,
    error: null,
  });

  /**
   * 빌링키 조회
   */
  const fetchBillingKey = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/payments/billing-key');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '빌링키 조회에 실패했어요');
      }

      setState({
        billingKey: data.billingKey,
        subscription: data.subscription,
        isLoading: false,
        error: null,
      });

      return data.billingKey;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '빌링키 조회 중 오류가 발생했어요';

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      return null;
    }
  }, []);

  /**
   * 빌링키 발급
   */
  const issueBillingKey = useCallback(async (): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // 1. 결제 시스템 활성화 체크
      const isDevelopment = process.env.NODE_ENV === 'development';
      const isPaymentEnabled = process.env.NEXT_PUBLIC_PAYMENT_ENABLED === 'true';

      if (!isDevelopment && !isPaymentEnabled) {
        throw new Error('결제 시스템 준비 중입니다.');
      }

      // 2. 서버에서 빌링키 발급 요청 데이터 생성
      const issueResponse = await fetch('/api/payments/billing-key/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const issueData = await issueResponse.json();

      if (!issueResponse.ok || !issueData.success) {
        throw new Error(issueData.error || '빌링키 발급 요청 생성에 실패했어요');
      }

      const { billingKeyId, billingKeyRequest } = issueData;

      // 3. 포트원 SDK로 빌링키 발급 창 열기
      const response = await PortOne.requestIssueBillingKey({
        storeId: billingKeyRequest.storeId,
        channelKey: billingKeyRequest.channelKey,
        billingKeyMethod: 'EASY_PAY',
        customer: billingKeyRequest.customer,
        customData: {
          billingKeyId,
          userId: billingKeyRequest.customer.customerId,
        },
        redirectUrl: billingKeyRequest.redirectUrl,
      });

      // 4. 발급 결과 확인
      if (!response) {
        throw new Error('빌링키 발급 응답을 받지 못했어요');
      }

      if (response.code !== undefined && response.code !== null) {
        // 사용자 취소 또는 에러
        if (response.code === 'USER_CANCELLED') {
          throw new Error('빌링키 발급이 취소되었어요');
        }
        throw new Error(response.message || '빌링키 발급 중 오류가 발생했어요');
      }

      // 5. 서버에 빌링키 저장 요청
      const saveResponse = await fetch('/api/payments/billing-key/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billingKeyId: response.billingKey || billingKeyId,
          connectToSubscription: true,
        }),
      });

      const saveData = await saveResponse.json();

      if (!saveResponse.ok || !saveData.success) {
        throw new Error(saveData.error || '빌링키 저장에 실패했어요');
      }

      // 6. 상태 업데이트
      setState({
        billingKey: saveData.billingKey,
        subscription: saveData.subscription,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '빌링키 발급 중 오류가 발생했어요';

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      return false;
    }
  }, []);

  /**
   * 빌링키 삭제
   */
  const deleteBillingKey = useCallback(async (): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/payments/billing-key', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '빌링키 삭제에 실패했어요');
      }

      setState({
        billingKey: null,
        subscription: null,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '빌링키 삭제 중 오류가 발생했어요';

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      return false;
    }
  }, []);

  /**
   * 에러 초기화
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // 컴포넌트 마운트 시 빌링키 조회
  useEffect(() => {
    fetchBillingKey();
  }, [fetchBillingKey]);

  return {
    billingKey: state.billingKey,
    subscription: state.subscription,
    isLoading: state.isLoading,
    error: state.error,
    fetchBillingKey,
    issueBillingKey,
    deleteBillingKey,
    clearError,
  };
}
