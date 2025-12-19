'use client';

/**
 * 결제 테스트 환경 안내 배너
 *
 * @description
 * 결제 시스템이 테스트 모드일 때 안내하는 배너입니다.
 * NEXT_PUBLIC_PAYMENT_ENABLED=true이면 배너가 숨겨집니다.
 *
 * @example
 * ```tsx
 * <PaymentTestBanner />
 * ```
 */

// 배포 환경 감지
const DEPLOYMENT_ENV = process.env.NEXT_PUBLIC_DEPLOYMENT_ENV || 'standalone';
const isAppsInToss = DEPLOYMENT_ENV === 'apps-in-toss';

// 결제 활성화 여부 (프로덕션이면 배너 숨김)
const isPaymentEnabled = process.env.NEXT_PUBLIC_PAYMENT_ENABLED === 'true';

/**
 * 배너 텍스트 (환경별 분기)
 */
const BANNER_TEXT = {
  title: isAppsInToss ? '결제 테스트를 진행하고 있어요' : '결제 테스트 진행 중',
  content1: isAppsInToss
    ? '현재 결제 시스템 테스트를 진행하고 있어요'
    : '현재 결제 시스템 테스트를 진행하고 있습니다',
  content2: '실제 결제가 이루어지지 않으니 안심하세요',
  content3: isAppsInToss
    ? '결제 시스템 구축 완료 후 별도로 공지할 예정이에요'
    : '결제 시스템 구축 완료 후 별도 공지 예정입니다',
} as const;

export default function PaymentTestBanner() {
  // 프로덕션 환경에서는 배너 숨김
  if (isPaymentEnabled) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        {/* 아이콘 */}
        <div className="text-2xl flex-shrink-0" aria-hidden="true">
          🧪
        </div>

        {/* 텍스트 컨텐츠 */}
        <div className="flex-1">
          <h3 className="font-bold text-yellow-900 mb-2">
            {BANNER_TEXT.title}
          </h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• {BANNER_TEXT.content1}</li>
            <li>• {BANNER_TEXT.content2}</li>
            <li>• {BANNER_TEXT.content3}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
