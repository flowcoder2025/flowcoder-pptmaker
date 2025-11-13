/**
 * FontSizeSlider 컴포넌트
 * 텍스트 크기 조정 슬라이더
 */

'use client';

import { RotateCcw, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FontSizeSliderProps {
  /** 현재 폰트 크기 (px) */
  value: number;
  /** 폰트 크기 변경 핸들러 */
  onChange: (size: number) => void;
  /** 레이블 텍스트 */
  label?: string;
  /** 최소 크기 (기본: 12px) */
  min?: number;
  /** 최대 크기 (기본: 32px) */
  max?: number;
  /** 기본값 (리셋 시 사용, 기본: 18px) */
  defaultValue?: number;
}

export default function FontSizeSlider({
  value,
  onChange,
  label = '본문 크기',
  min = 12,
  max = 32,
  defaultValue = 18,
}: FontSizeSliderProps) {
  const handleReset = () => {
    onChange(defaultValue);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Type className="w-4 h-4" />
          {label}
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900 min-w-[3rem] text-right">
            {value}px
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="h-7 px-2"
            title="기본값으로 되돌리기"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 w-8">{min}px</span>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, hsl(217 91% 60%) 0%, hsl(217 91% 60%) ${((value - min) / (max - min)) * 100}%, rgb(229 231 235) ${((value - min) / (max - min)) * 100}%, rgb(229 231 235) 100%)`,
          }}
        />
        <span className="text-xs text-gray-500 w-8 text-right">{max}px</span>
      </div>

      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: hsl(217 91% 60%);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .slider-thumb::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: hsl(217 91% 60%);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .slider-thumb:hover::-webkit-slider-thumb {
          background: hsl(217 91% 55%);
        }

        .slider-thumb:hover::-moz-range-thumb {
          background: hsl(217 91% 55%);
        }
      `}</style>
    </div>
  );
}
