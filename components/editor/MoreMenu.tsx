/**
 * MoreMenu 컴포넌트
 * 모바일 화면에서 추가 액션을 표시하는 더보기 메뉴
 */

'use client';

import { useState, useRef, useEffect } from 'react';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'danger';
}

interface MoreMenuProps {
  items: MenuItem[];
}

export default function MoreMenu({ items }: MoreMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleItemClick = (item: MenuItem) => {
    item.onClick();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* 더보기 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 border border-gray-400 text-gray-700 rounded hover:bg-gray-50 transition-colors"
        aria-label="더보기 메뉴"
        title="더보기"
      >
        <span className="text-xl">⋮</span>
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
          {items.map((item, index) => {
            const isDisabled = item.disabled || false;
            const isDanger = item.variant === 'danger';

            return (
              <button
                key={index}
                onClick={() => !isDisabled && handleItemClick(item)}
                disabled={isDisabled}
                className={`
                  w-full px-4 py-3 text-left flex items-center gap-3
                  transition-colors
                  ${isDisabled
                    ? 'opacity-50 cursor-not-allowed bg-gray-50'
                    : isDanger
                      ? 'hover:bg-red-50 text-red-600'
                      : 'hover:bg-gray-50 text-gray-900'
                  }
                  ${index !== items.length - 1 ? 'border-b border-gray-100' : ''}
                `}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
