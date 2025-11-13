/**
 * GlobalSettingsPanel 컴포넌트
 * 전역 슬라이드 설정 패널 (일괄 조정)
 */

'use client';

import { usePresentationStore } from '@/store/presentationStore';
import FontSizeSlider from './FontSizeSlider';
import IconSelector from './IconSelector';
import { Button } from '@/components/ui/button';
import { Settings, CheckCircle2 } from 'lucide-react';

export default function GlobalSettingsPanel() {
  const {
    globalSettings,
    setGlobalSettings,
    applyGlobalSettingsToAll,
    currentPresentation,
  } = usePresentationStore();

  const handleFontSizeChange = (fontSize: number) => {
    setGlobalSettings({ fontSize });
  };

  const handleIconChange = (iconType: 'arrow' | 'dot' | 'check') => {
    setGlobalSettings({ iconType });
  };

  const handleApplyToAll = () => {
    applyGlobalSettingsToAll();
  };

  // 프리젠테이션이 없으면 표시하지 않음
  if (!currentPresentation) {
    return null;
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-bold text-gray-900">
          전역 슬라이드 설정
        </h3>
      </div>

      <p className="text-sm text-gray-600">
        모든 슬라이드에 일괄 적용할 스타일을 설정하세요.
        적용 후에도 개별 슬라이드를 따로 조정할 수 있어요.
      </p>

      <div className="space-y-4">
        {/* 텍스트 크기 */}
        <FontSizeSlider
          value={globalSettings.fontSize}
          onChange={handleFontSizeChange}
          label="텍스트 크기"
          defaultValue={18}
        />

        {/* 불릿 아이콘 */}
        <IconSelector
          value={globalSettings.iconType}
          onChange={handleIconChange}
          label="불릿 아이콘"
        />
      </div>

      {/* 모든 슬라이드에 적용 버튼 */}
      <Button
        onClick={handleApplyToAll}
        className="w-full"
        variant="default"
      >
        <CheckCircle2 className="w-4 h-4 mr-2" />
        모든 슬라이드에 적용
      </Button>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-xs text-amber-700 leading-relaxed">
          <strong>💡 참고:</strong> 일괄 적용 버튼을 누르면 현재 설정이 모든 슬라이드에 적용돼요.
          개별 슬라이드에서 이미 수정한 내용도 모두 덮어써지니 주의하세요!
        </p>
      </div>
    </div>
  );
}
