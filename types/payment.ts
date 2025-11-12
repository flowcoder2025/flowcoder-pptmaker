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

// ============================================
// PortOne V2 Payment Types (웹 서비스용)
// ============================================

/**
 * PortOne V2 결제 방법
 */
export type PortOnePaymentMethod =
  | 'CARD'              // 신용카드
  | 'VIRTUAL_ACCOUNT'   // 가상계좌
  | 'TRANSFER'          // 계좌이체
  | 'MOBILE'            // 휴대폰 소액결제
  | 'EASY_PAY'          // 간편결제 (토스페이, 카카오페이, 네이버페이 등)
  | 'GIFT_CERTIFICATE'; // 상품권

/**
 * PortOne V2 결제 상태
 */
export type PortOnePaymentStatus =
  | 'PENDING'    // 결제 대기
  | 'PAID'       // 결제 완료
  | 'FAILED'     // 결제 실패
  | 'CANCELED'   // 결제 취소
  | 'REFUNDED';  // 환불 완료

/**
 * PortOne V2 결제 목적
 */
export type PortOnePaymentPurpose =
  | 'SUBSCRIPTION_UPGRADE'  // 구독 업그레이드
  | 'CREDIT_PURCHASE';      // 크레딧 충전

/**
 * PortOne V2 결제 요청 데이터
 */
export interface PortOnePaymentRequest {
  storeId: string;           // 포트원 상점 ID
  paymentId: string;         // 고유 결제 ID (UUID 등)
  orderName: string;         // 주문명 (예: "프리미엄 구독", "크레딧 10개")
  totalAmount: number;       // 결제 금액 (원)
  currency: string;          // 통화 (기본: 'KRW')
  channelKey?: string;       // 채널 키 (특정 PG사 지정 시)
  payMethod?: PortOnePaymentMethod; // 결제 방법
  customer?: {
    customerId: string;      // 고객 ID
    fullName?: string;       // 고객명
    phoneNumber?: string;    // 전화번호
    email?: string;          // 이메일
  };
  customData?: {
    purpose: PortOnePaymentPurpose;
    userId: string;
    subscriptionId?: string;
    creditAmount?: number;
  };
  redirectUrl?: string;      // 결제 완료 후 리다이렉트 URL
  noticeUrls?: string[];     // Webhook URL
}

/**
 * PortOne V2 결제 응답 데이터
 */
export interface PortOnePaymentResponse {
  code: string;              // 응답 코드
  message?: string;          // 응답 메시지
  paymentId?: string;        // 결제 ID
  transactionId?: string;    // 트랜잭션 ID
  txId?: string;             // 포트원 트랜잭션 ID
}

/**
 * PortOne V2 결제 검증 요청
 */
export interface PortOnePaymentVerifyRequest {
  paymentId: string;         // 결제 ID
  txId: string;              // 포트원 트랜잭션 ID
}

/**
 * PortOne V2 결제 검증 응답
 */
export interface PortOnePaymentVerifyResponse {
  paymentId: string;
  status: PortOnePaymentStatus;
  amount: number;
  paidAmount: number;
  method?: PortOnePaymentMethod;
  paidAt?: string;           // ISO 8601 날짜
  receiptUrl?: string;       // 영수증 URL
  customer?: {
    customerId: string;
    fullName?: string;
    email?: string;
  };
  customData?: Record<string, any>;
}

/**
 * PortOne V2 빌링키 발급 요청
 */
export interface PortOneBillingKeyRequest {
  storeId: string;
  billingKeyMethod: 'CARD';  // 현재는 카드만 지원
  customer: {
    customerId: string;
    fullName?: string;
    phoneNumber?: string;
    email?: string;
  };
  redirectUrl?: string;
  noticeUrls?: string[];
}

/**
 * PortOne V2 빌링키 발급 응답
 */
export interface PortOneBillingKeyResponse {
  code: string;
  message?: string;
  billingKey?: string;
  cardInfo?: {
    issuer: string;          // 카드사 (예: '신한카드')
    maskedNumber: string;    // 마스킹된 카드번호 (예: '1234-****-****-5678')
    cardType: 'CREDIT' | 'DEBIT' | 'GIFT';
    expiresAt?: string;      // 카드 만료일 (YYMM)
  };
}

/**
 * PortOne V2 Webhook 이벤트 타입
 */
export type PortOneWebhookEventType =
  | 'Transaction.Paid'       // 결제 완료
  | 'Transaction.Failed'     // 결제 실패
  | 'Transaction.Cancelled'  // 결제 취소
  | 'Transaction.PartialCancelled' // 부분 취소
  | 'Transaction.PayPending' // 결제 대기 (가상계좌)
  | 'BillingKey.Issued'      // 빌링키 발급
  | 'BillingKey.Deleted';    // 빌링키 삭제

/**
 * PortOne V2 Webhook 페이로드
 */
export interface PortOneWebhookPayload {
  type: PortOneWebhookEventType;
  timestamp: string;         // ISO 8601
  data: {
    paymentId?: string;
    billingKey?: string;
    transactionId?: string;
    status?: PortOnePaymentStatus;
    amount?: number;
    paidAmount?: number;
    method?: PortOnePaymentMethod;
    receiptUrl?: string;
    failReason?: string;
    customData?: Record<string, any>;
  };
}

/**
 * API: 결제 요청 생성 (POST /api/payments/request)
 */
export interface CreatePaymentRequestBody {
  purpose: PortOnePaymentPurpose;
  amount: number;
  orderName: string;
  channelKey?: string;       // PG 채널 키 (토스페이, 카카오페이 등)
  subscriptionId?: string;   // 구독 업그레이드 시
  creditAmount?: number;     // 크레딧 충전 시
  payMethod?: PortOnePaymentMethod;
}

export interface CreatePaymentRequestResponse {
  success: boolean;
  paymentId?: string;
  paymentRequest?: PortOnePaymentRequest;
  error?: string;
}

/**
 * API: 결제 검증 (POST /api/payments/verify)
 */
export interface VerifyPaymentRequestBody {
  paymentId: string;
  txId: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  payment?: {
    id: string;
    status: PortOnePaymentStatus;
    amount: number;
    paidAt?: string;
    receiptUrl?: string;
  };
  subscription?: {
    id: string;
    tier: string;
    status: string;
    endDate?: string;
  };
  credits?: {
    amount: number;
    balance: number;
  };
  error?: string;
}

/**
 * API: 빌링키 발급 요청 (POST /api/payments/billing-key/request)
 */
export interface CreateBillingKeyRequestBody {
  // 현재는 요청 본문 없음 (세션에서 사용자 정보 추출)
}

export interface CreateBillingKeyRequestResponse {
  success: boolean;
  billingKeyRequest?: PortOneBillingKeyRequest;
  error?: string;
}

/**
 * API: 빌링키 조회 (GET /api/payments/billing-key)
 */
export interface GetBillingKeyResponse {
  success: boolean;
  billingKey?: {
    id: string;
    billingKeyId: string;
    isActive: boolean;
    cardInfo: {
      issuer: string;
      maskedNumber: string;
      cardType: 'CREDIT' | 'DEBIT' | 'GIFT';
    };
    expiresAt?: string;
    createdAt: string;
  };
  error?: string;
}

/**
 * 결제 리스트 아이템 (사용자 결제 내역 조회용)
 */
export interface PaymentListItem {
  id: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: PortOnePaymentStatus;
  method?: string;
  purpose: string;
  orderName?: string;
  paidAt?: string;
  receiptUrl?: string;
  createdAt: string;
}
