/**
 * 포트원 V2 결제 연동 커스텀 훅
 *
 * @description
 * 포트원 SDK를 사용하여 결제 요청, 검증, 결과 처리를 담당하는 훅
 *
 * @example
 * ```typescript
 * const { requestPayment, isLoading, error } = usePortOnePayment();
 *
 * const handlePay = async () => {
 *   const result = await requestPayment({
 *     purpose: 'SUBSCRIPTION_UPGRADE',
 *     amount: 5900,
 *     orderName: '프리미엄 구독 (1개월)',
 *     channelKey: 'channel-key-ac45bcb3-910c-4a2b-bc46-24ec05d207...',
 *   });
 *
 *   if (result.success) {
 *     // 결제 성공 처리
 *   }
 * };
 * ```
 */

'use client';

import { useState, useCallback } from 'react';
import * as PortOne from '@portone/browser-sdk/v2';
import type {
  CreatePaymentRequestBody,
  CreatePaymentRequestResponse,
  VerifyPaymentResponse,
  PortOnePaymentPurpose,
} from '@/types/payment';

/**
 * 사용 가능한 결제 채널 (포트원 콘솔에서 설정된 채널)
 *
 * @description
 * 포트원 테스트 환경 채널키 (2025-11-12 확인)
 */
export const PAYMENT_CHANNELS = {
  // 토스페이 일반/정기결제
  TOSSPAY: {
    key: 'channel-key-ac45bcb3-910c-4a2b-bc46-24ec05d20742',
    name: '토스페이',
    pgProvider: 'tosspay_v2',
    mid: 'tosstest',
  },
  // 카카오페이 일반결제
  KAKAOPAY_ONETIME: {
    key: 'channel-key-b67c5e30-67da-4b6d-bb60-abdcea65ab96',
    name: '카카오페이',
    pgProvider: 'kakaopay',
    mid: 'TC0ONETIME',
  },
  // 카카오페이 정기결제
  KAKAOPAY_SUBSCRIPTION: {
    key: 'channel-key-5bf9403e-6158-4a41-b756-0785c9dbbc32',
    name: '카카오페이 (정기)',
    pgProvider: 'kakaopay',
    mid: 'TCSUBSCRIP',
  },
  // 이니시스 일반결제
  INICIS_ONETIME: {
    key: 'channel-key-7b85a467-d1a5-4233-a502-1748a38192ef',
    name: '이니시스',
    pgProvider: 'inicis_v2',
    mid: 'INIpayTest',
  },
  // 이니시스 정기결제
  INICIS_SUBSCRIPTION: {
    key: 'channel-key-2d471aaa-b5b1-45ff-b4a8-961d28083960',
    name: '이니시스 (정기)',
    pgProvider: 'inicis_v2',
    mid: 'INIBillTst',
  },
} as const;

/**
 * 결제 요청 옵션
 */
export interface RequestPaymentOptions {
  purpose: PortOnePaymentPurpose;
  amount: number;
  orderName: string;
  channelKey?: string; // 선택한 채널 키
  subscriptionId?: string;
  creditAmount?: number;
}

/**
 * 결제 결과
 */
export interface PaymentResult {
  success: boolean;
  payment?: VerifyPaymentResponse['payment'];
  subscription?: VerifyPaymentResponse['subscription'];
  credits?: VerifyPaymentResponse['credits'];
  error?: string;
}

/**
 * 포트원 결제 훅
 */
export function usePortOnePayment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 결제 요청 및 검증
   */
  const requestPayment = useCallback(
    async (options: RequestPaymentOptions): Promise<PaymentResult> => {
      setIsLoading(true);
      setError(null);

      try {
        // 0. 결제 시스템 활성화 체크
        // 개발 환경에서는 항상 허용, 프로덕션에서는 환경 변수로 제어
        const isDevelopment = process.env.NODE_ENV === 'development';
        const isPaymentEnabled = process.env.NEXT_PUBLIC_PAYMENT_ENABLED === 'true';

        if (!isDevelopment && !isPaymentEnabled) {
          throw new Error('결제 시스템 준비 중입니다. 곧 서비스를 시작할 예정이에요.');
        }

        // 1. 결제 요청 생성 API 호출
        const requestBody: CreatePaymentRequestBody = {
          purpose: options.purpose,
          amount: options.amount,
          orderName: options.orderName,
          subscriptionId: options.subscriptionId,
          creditAmount: options.creditAmount,
        };

        const requestResponse = await fetch('/api/payments/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (!requestResponse.ok) {
          const errorData = await requestResponse.json();
          throw new Error(errorData.error || '결제 요청 생성에 실패했어요');
        }

        const { success, paymentId, paymentRequest } =
          (await requestResponse.json()) as CreatePaymentRequestResponse;

        if (!success || !paymentId || !paymentRequest) {
          throw new Error('결제 요청 생성에 실패했어요');
        }

        // 2. 포트원 SDK로 결제창 열기
        // channelKey 설정 (옵션으로 제공되면 사용, 아니면 기본값)
        const finalPaymentRequest = {
          ...paymentRequest,
          channelKey: options.channelKey || paymentRequest.channelKey,
        };

        const response = await PortOne.requestPayment(finalPaymentRequest);

        // 3. 결제 결과 확인
        if (!response) {
          throw new Error('결제 응답을 받지 못했어요');
        }

        if (response.code !== undefined && response.code !== null) {
          // 에러 발생
          throw new Error(
            response.message || '결제 처리 중 오류가 발생했어요'
          );
        }

        const txId = response.txId || (response as Record<string, unknown>).transactionId as string | undefined;
        if (!txId) {
          throw new Error('결제 트랜잭션 ID를 받지 못했어요');
        }

        // 4. 결제 검증 API 호출
        const verifyResponse = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId,
            txId,
          }),
        });

        if (!verifyResponse.ok) {
          const errorData = await verifyResponse.json();
          throw new Error(errorData.error || '결제 검증에 실패했어요');
        }

        const verifyData = (await verifyResponse.json()) as VerifyPaymentResponse;

        if (!verifyData.success) {
          throw new Error(verifyData.error || '결제 검증에 실패했어요');
        }

        // 5. 성공 결과 반환
        return {
          success: true,
          payment: verifyData.payment,
          subscription: verifyData.subscription,
          credits: verifyData.credits,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '결제 처리 중 오류가 발생했어요';
        setError(errorMessage);

        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * 에러 초기화
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    requestPayment,
    isLoading,
    error,
    clearError,
    PAYMENT_CHANNELS,
  };
}
