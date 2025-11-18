'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Loader2, RotateCw } from 'lucide-react';
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
    logoSrc: string;
    logoAlt: string;
    logoWidth: number;
    logoHeight: number;
    bgColor: string;
    hoverBorder: string;
    label: string;
    badge?: string;
    badgeColor?: string;
  }> = {
    [PAYMENT_CHANNELS.TOSSPAY.key]: {
      logoSrc: '/Toss_Logo_Alternative.png',
      logoAlt: 'Toss Pay',
      logoWidth: 120,
      logoHeight: 60,
      bgColor: 'bg-white',
      hoverBorder: 'hover:border-blue-500',
      label: '토스페이',
      // 정기 결제(subscription) 모드일 때만 뱃지 표시
      badge: paymentType === 'subscription' ? '정기' : undefined,
      badgeColor: paymentType === 'subscription' ? 'bg-blue-300 text-blue-900' : undefined,
    },
    [PAYMENT_CHANNELS.KAKAOPAY_ONETIME.key]: {
      logoSrc: '/payment_icon_yellow_large.png',
      logoAlt: 'Kakao Pay',
      logoWidth: 64,
      logoHeight: 64,
      bgColor: 'bg-yellow-50',
      hoverBorder: 'hover:border-yellow-500',
      label: '카카오페이',
    },
    [PAYMENT_CHANNELS.KAKAOPAY_SUBSCRIPTION.key]: {
      logoSrc: '/payment_icon_yellow_large.png',
      logoAlt: 'Kakao Pay',
      logoWidth: 64,
      logoHeight: 64,
      bgColor: 'bg-yellow-100',
      hoverBorder: 'hover:border-yellow-600',
      label: '카카오페이',
      badge: '정기',
      badgeColor: 'bg-yellow-300 text-yellow-900',
    },
    [PAYMENT_CHANNELS.INICIS_ONETIME.key]: {
      logoSrc: '/kg이니시스.svg',
      logoAlt: 'KG Inicis',
      logoWidth: 80,
      logoHeight: 40,
      bgColor: 'bg-white',
      hoverBorder: 'hover:border-gray-500',
      label: 'KG이니시스',
    },
    [PAYMENT_CHANNELS.INICIS_SUBSCRIPTION.key]: {
      logoSrc: '/kg이니시스.svg',
      logoAlt: 'KG Inicis',
      logoWidth: 80,
      logoHeight: 40,
      bgColor: 'bg-gray-50',
      hoverBorder: 'hover:border-gray-600',
      label: 'KG이니시스',
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
        <p className="text-gray-600 mb-4 text-center">
          {description}
        </p>

        {/* 결제 테스트 안내 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-lg">ℹ️</span>
            <p className="text-sm text-blue-800">
              테스트 중이며 실제 결제가 이루어지지 않습니다
            </p>
          </div>
        </div>

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
                  relative h-32 rounded-xl border-2 border-gray-200
                  ${config.bgColor}
                  ${config.hoverBorder}
                  hover:scale-105 transition-all duration-200
                  shadow-sm hover:shadow-md
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <div className="flex flex-col items-center justify-center gap-3 h-full p-4">
                  {/* 로고 이미지 */}
                  <div className="flex items-center justify-center h-16">
                    <Image
                      src={config.logoSrc}
                      alt={config.logoAlt}
                      width={config.logoWidth}
                      height={config.logoHeight}
                      className="object-contain max-w-full max-h-full"
                      priority
                    />
                  </div>

                  {/* 뱃지 (정기 결제인 경우) */}
                  {config.badge && (
                    <span className={`text-xs px-2 py-0.5 ${config.badgeColor} rounded-full font-semibold`}>
                      {config.badge}
                    </span>
                  )}
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
