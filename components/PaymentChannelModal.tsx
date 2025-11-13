'use client';

import { Card } from '@/components/ui/card';
import { Loader2, CreditCard, Heart, RotateCw, Building2 } from 'lucide-react';
import { PAYMENT_CHANNELS } from '@/hooks/usePortOnePayment';

interface PaymentChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChannel: (channelKey: string) => void;
  paymentType: 'onetime' | 'subscription';
  isLoading: boolean;
  title?: string;
  description?: string;
}

/**
 * 결제 방법 선택 모달
 *
 * @description
 * DownloadProgressModal과 동일한 디자인 패턴을 사용하는 결제 채널 선택 모달입니다.
 * - onetime: 일반 결제 채널만 표시 (토스페이, 카카오페이, 이니시스)
 * - subscription: 정기 결제 채널만 표시 (토스페이, 카카오페이 정기, 이니시스 정기)
 * - 토스페이는 일반/정기 둘 다 지원하므로 양쪽에 모두 표시
 */
export default function PaymentChannelModal({
  isOpen,
  onClose,
  onSelectChannel,
  paymentType,
  isLoading,
  title = '결제 방법을 선택해주세요',
  description = '빠르고 안전하게 결제할 수 있어요',
}: PaymentChannelModalProps) {
  if (!isOpen) return null;

  // 결제 타입에 따라 채널 필터링
  const channels = paymentType === 'onetime'
    ? [
        PAYMENT_CHANNELS.TOSSPAY,
        PAYMENT_CHANNELS.KAKAOPAY_ONETIME,
        PAYMENT_CHANNELS.INICIS_ONETIME,
      ]
    : [
        PAYMENT_CHANNELS.TOSSPAY,
        PAYMENT_CHANNELS.KAKAOPAY_SUBSCRIPTION,
        PAYMENT_CHANNELS.INICIS_SUBSCRIPTION,
      ];

  // 채널별 UI 설정
  const channelUIConfig: Record<string, {
    icon: React.ReactNode;
    gradient: string;
    hoverBorder: string;
    textColor: string;
    label: string;
    badge?: string;
    badgeColor?: string;
  }> = {
    [PAYMENT_CHANNELS.TOSSPAY.key]: {
      icon: <CreditCard className="w-8 h-8" />,
      gradient: 'from-blue-50 to-blue-100',
      hoverBorder: 'hover:border-blue-500',
      textColor: 'text-blue-700',
      label: '토스페이',
      // 정기 결제(subscription) 모드일 때만 뱃지 표시
      badge: paymentType === 'subscription' ? '정기' : undefined,
      badgeColor: paymentType === 'subscription' ? 'bg-blue-300 text-blue-900' : undefined,
    },
    [PAYMENT_CHANNELS.KAKAOPAY_ONETIME.key]: {
      icon: <Heart className="w-8 h-8 fill-yellow-400 text-yellow-400" />,
      gradient: 'from-yellow-50 to-yellow-100',
      hoverBorder: 'hover:border-yellow-500',
      textColor: 'text-yellow-800',
      label: '카카오페이',
    },
    [PAYMENT_CHANNELS.KAKAOPAY_SUBSCRIPTION.key]: {
      icon: <RotateCw className="w-8 h-8" />,
      gradient: 'from-yellow-100 to-yellow-200',
      hoverBorder: 'hover:border-yellow-600',
      textColor: 'text-yellow-900',
      label: '카카오페이',
      badge: '정기',
      badgeColor: 'bg-yellow-300 text-yellow-900',
    },
    [PAYMENT_CHANNELS.INICIS_ONETIME.key]: {
      icon: <Building2 className="w-8 h-8" />,
      gradient: 'from-gray-50 to-gray-100',
      hoverBorder: 'hover:border-gray-500',
      textColor: 'text-gray-700',
      label: '이니시스',
    },
    [PAYMENT_CHANNELS.INICIS_SUBSCRIPTION.key]: {
      icon: <RotateCw className="w-8 h-8" />,
      gradient: 'from-gray-100 to-gray-200',
      hoverBorder: 'hover:border-gray-600',
      textColor: 'text-gray-800',
      label: '이니시스',
      badge: '정기',
      badgeColor: 'bg-gray-300 text-gray-800',
    },
  };

  return (
    <div
      onClick={!isLoading ? onClose : undefined}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <Card
        onClick={(e) => e.stopPropagation()}
        className="relative p-8 max-w-2xl w-full bg-white shadow-2xl border-4 border-primary rounded-2xl"
      >
        {/* 닫기 버튼 (로딩 중이 아닐 때만) */}
        {!isLoading && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="닫기"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}

        {/* 타이틀 */}
        <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
          {title}
        </h3>

        {/* 설명 */}
        <p className="text-gray-600 mb-6 text-center">
          {description}
        </p>

        {/* 결제 채널 선택 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {channels.map((channel) => {
            const config = channelUIConfig[channel.key];
            if (!config) return null;

            return (
              <button
                key={channel.key}
                type="button"
                onClick={() => onSelectChannel(channel.key)}
                disabled={isLoading}
                className={`
                  relative h-28 rounded-xl border-2 border-transparent
                  bg-gradient-to-br ${config.gradient}
                  ${config.hoverBorder}
                  hover:scale-105 transition-all duration-200
                  shadow-sm hover:shadow-md
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <div className="flex flex-col items-center justify-center gap-2 h-full">
                  <div className={config.textColor}>{config.icon}</div>
                  <div className="text-center">
                    <div className={`font-bold text-lg ${config.textColor}`}>
                      {config.label}
                    </div>
                    {config.badge && (
                      <span className={`text-xs px-2 py-0.5 ${config.badgeColor} rounded-full font-semibold mt-1 inline-block`}>
                        {config.badge}
                      </span>
                    )}
                  </div>
                </div>

                {/* 로딩 오버레이 */}
                {isLoading && (
                  <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* 안내 문구 */}
        <p className="text-sm text-gray-500 text-center mt-6">
          결제 정보는 안전하게 보호돼요
        </p>
      </Card>
    </div>
  );
}
