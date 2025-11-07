/**
 * 토스페이 결제 관련 타입 정의
 *
 * @description
 * Apps in Toss WebView 앱에서 토스페이 구독 결제를 위한 타입 정의
 *
 * @reference
 * - Bedrock SDK: docs/reference/bedrock/payment/tosspay/checkoutPayment.md
 */

/**
 * 구독 플랜 타입
 */
export type SubscriptionPlan = 'basic' | 'pro' | 'enterprise';

/**
 * 구독 플랜 정보
 */
export interface PlanInfo {
  id: SubscriptionPlan;
  name: string;
  price: number;
  monthlySlideLimit: number;
  premiumTemplates: boolean;
  designQuality: 'flash' | 'pro' | 'pro-priority';
  research: boolean;
}

/**
 * PayToken 생성 요청
 */
export interface CreatePayTokenRequest {
  plan: Exclude<SubscriptionPlan, 'basic'>; // basic은 무료
  userKey: string;
}

/**
 * PayToken 생성 응답
 */
export interface CreatePayTokenResponse {
  data?: {
    success?: {
      payToken: string;
    };
  };
  error?: string;
}

/**
 * 결제 실행 요청
 */
export interface ExecutePaymentRequest {
  payToken: string;
  userKey: string;
}

/**
 * 결제 실행 응답
 */
export interface ExecutePaymentResponse {
  data?: {
    success?: {
      orderId: string;
      subscriptionId: string;
    };
  };
  error?: string;
}

/**
 * 토스페이 결제 결과 (checkoutPayment 반환값)
 */
export interface CheckoutPaymentResult {
  success: boolean;
  reason?: string;
}

/**
 * 구독 상태
 */
export interface SubscriptionStatus {
  userKey: string;
  plan: SubscriptionPlan;
  status: 'active' | 'canceled' | 'expired';
  startDate: string;
  endDate: string;
  autoRenewal: boolean;
  subscriptionId?: string;
}

/**
 * 결제 훅 상태
 */
export interface PaymentState {
  loading: boolean;
  error: string | null;
  paySubscription: (plan: Exclude<SubscriptionPlan, 'basic'>) => Promise<boolean>;
  cancelSubscription: () => Promise<void>;
}
