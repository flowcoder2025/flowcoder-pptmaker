/**
 * IconSelector 컴포넌트
 * 불릿 아이콘 선택
 */

'use client';

import { Check } from 'lucide-react';

interface IconSelectorProps {
  value: 'arrow' | 'dot' | 'check';
  onChange: (iconType: 'arrow' | 'dot' | 'check') => void;
  label?: string;
}

const ICON_OPTIONS = [
  { type: 'arrow' as const, label: '화살표', icon: '→' },
  { type: 'dot' as const, label: '점', icon: '•' },
  { type: 'check' as const, label: '체크', icon: '✓' },
];

export default function IconSelector({ value, onChange, label = '아이콘' }: IconSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {ICON_OPTIONS.map((option) => (
          <button
            key={option.type}
            type="button"
            onClick={() => onChange(option.type)}
            className={`
              relative px-4 py-3 border rounded-lg transition-all
              ${
                value === option.type
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">{option.icon}</span>
              <span className="text-xs font-medium">{option.label}</span>
            </div>
            {value === option.type && (
              <div className="absolute top-1 right-1">
                <Check className="w-4 h-4 text-blue-600" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
