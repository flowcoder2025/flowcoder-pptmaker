'use client';

import { useRouter } from 'next/navigation';

/**
 * 메뉴 모달 컴포넌트
 *
 * 앱인토스 NavigationBar의 ... 버튼 클릭 시 표시되는 메뉴
 *
 * @component
 * @example
 * ```tsx
 * <MenuModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
 * ```
 */
interface MenuModalProps {
  /** 모달 표시 여부 */
  isOpen: boolean;
  /** 모달 닫기 콜백 */
  onClose: () => void;
}

export default function MenuModal({ isOpen, onClose }: MenuModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleNavigation = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <>
      {/* 오버레이 */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-label="모달 닫기"
      />

      {/* 모달 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 animate-slide-up">
        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* 메뉴 리스트 */}
        <div className="px-4 pb-8">
          <h2 className="text-lg font-bold mb-4 text-gray-900">메뉴</h2>

          {/* 구독 관리 */}
          <button
            onClick={() => handleNavigation('/subscription')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
          >
            <span className="text-2xl">💳</span>
            <div>
              <div className="font-medium text-gray-900">구독 관리</div>
              <div className="text-sm text-gray-600">요금제를 확인하고 관리해요</div>
            </div>
          </button>

          {/* 크레딧 관리 */}
          <button
            onClick={() => handleNavigation('/credits')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
          >
            <span className="text-2xl">🪙</span>
            <div>
              <div className="font-medium text-gray-900">크레딧 관리</div>
              <div className="text-sm text-gray-600">크레딧을 충전하고 확인해요</div>
            </div>
          </button>

          {/* 개발자 도구 (개발 환경 전용) */}
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={() => handleNavigation('/dev-tools')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
            >
              <span className="text-2xl">🛠️</span>
              <div>
                <div className="font-medium text-gray-900">개발자 도구</div>
                <div className="text-sm text-gray-600">디버깅 도구에요</div>
              </div>
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
