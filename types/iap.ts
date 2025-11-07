/**
 * IAP(In-App Purchase) 관련 타입 정의
 *
 * @description
 * Apps in Toss WebView 앱에서 인앱 결제를 위한 타입 정의
 *
 * @reference
 * - Bedrock SDK: docs/reference/bedrock/payment/iap/createOneTimePurchaseOrder.md
 */

/**
 * 프리미엄 템플릿 SKU
 */
export const TEMPLATE_SKUS = {
  PREMIUM_BUSINESS: 'template_premium_business',
  PREMIUM_EDUCATION: 'template_premium_education',
  PREMIUM_MARKETING: 'template_premium_marketing',
  PREMIUM_CREATIVE: 'template_premium_creative',
} as const;

export type TemplateSKU = (typeof TEMPLATE_SKUS)[keyof typeof TEMPLATE_SKUS];

/**
 * 템플릿 상품 정보
 */
export interface TemplateProduct {
  sku: TemplateSKU;
  name: string;
  description: string;
  price: number;
  templateId: string;
}

/**
 * 템플릿 가격 정보 (₩900~₩4,900)
 */
export const TEMPLATE_PRICES: Record<TemplateSKU, number> = {
  [TEMPLATE_SKUS.PREMIUM_BUSINESS]: 4900,
  [TEMPLATE_SKUS.PREMIUM_EDUCATION]: 2900,
  [TEMPLATE_SKUS.PREMIUM_MARKETING]: 3900,
  [TEMPLATE_SKUS.PREMIUM_CREATIVE]: 900,
} as const;

/**
 * 구독자 할인율 (30%)
 */
export const SUBSCRIBER_DISCOUNT = 0.3;

/**
 * 구매 검증 요청
 */
export interface VerifyPurchaseRequest {
  orderId: string;
  sku: TemplateSKU;
  userKey: string;
}

/**
 * 구매 검증 응답
 */
export interface VerifyPurchaseResponse {
  data?: {
    success?: {
      templateId: string;
      unlocked: boolean;
    };
  };
  error?: string;
}

/**
 * createOneTimePurchaseOrder의 processProductGrant 콜백 파라미터
 */
export interface ProcessProductGrantParams {
  orderId: string;
}

/**
 * IAP 이벤트 타입
 */
export interface IAPEvent {
  type: 'success' | 'cancel' | 'fail';
  orderId?: string;
  message?: string;
}

/**
 * IAP 에러 타입
 */
export interface IAPError {
  code: string;
  message: string;
}

/**
 * 구매한 템플릿 정보
 */
export interface PurchasedTemplate {
  userKey: string;
  sku: TemplateSKU;
  templateId: string;
  orderId: string;
  purchasedAt: string;
}

/**
 * IAP 훅 상태
 */
export interface IAPState {
  loading: boolean;
  error: string | null;
  purchaseTemplate: (sku: TemplateSKU) => Promise<boolean>;
  isPurchased: (sku: TemplateSKU) => boolean;
  purchasedTemplates: TemplateSKU[];
}
