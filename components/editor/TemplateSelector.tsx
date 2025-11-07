/**
 * TemplateSelector 컴포넌트
 * 템플릿 선택 UI
 */

'use client';

interface Template {
  id: string;
  name: string;
  category: 'free' | 'premium';
  description: string;
}

interface TemplateSelectorProps {
  isOpen: boolean;
  currentTemplateId: string;
  onSelect: (templateId: string) => void;
  onClose: () => void;
}

export default function TemplateSelector({
  isOpen,
  currentTemplateId,
  onSelect,
  onClose,
}: TemplateSelectorProps) {
  if (!isOpen) return null;

  // 현재는 기본 템플릿만 제공 (향후 프리미엄 템플릿 추가 가능)
  const templates: Template[] = [
    {
      id: 'toss-default',
      name: 'Toss 기본',
      category: 'free',
      description: 'TDS 디자인 시스템 기반 무료 템플릿',
    },
  ];

  const handleSelect = (templateId: string) => {
    onSelect(templateId);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">템플릿 선택</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => {
            const isSelected = template.id === currentTemplateId;

            return (
              <button
                key={template.id}
                onClick={() => handleSelect(template.id)}
                className={`
                  p-4 border-2 rounded-lg text-left transition-all
                  ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }
                `}
              >
                {/* 템플릿 카테고리 뱃지 */}
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`
                    px-2 py-1 text-xs font-semibold rounded
                    ${
                      template.category === 'premium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }
                  `}
                  >
                    {template.category === 'premium' ? '프리미엄' : '무료'}
                  </span>
                  {isSelected && (
                    <span className="text-blue-500 text-sm font-semibold">
                      ✓ 사용 중
                    </span>
                  )}
                </div>

                {/* 템플릿 이름 */}
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {template.name}
                </h3>

                {/* 템플릿 설명 */}
                <p className="text-sm text-gray-600">{template.description}</p>
              </button>
            );
          })}
        </div>

        {/* 프리미엄 템플릿 안내 (향후 추가 시) */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            💡 <strong>프리미엄 템플릿</strong>은 향후 업데이트를 통해 추가될
            예정이에요
          </p>
        </div>
      </div>
    </div>
  );
}
