/**
 * ConfirmDialog 컴포넌트
 * 재사용 가능한 확인 다이얼로그
 */

'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmButtonColor?: 'blue' | 'red';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  confirmButtonColor = 'blue',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <Card
        onClick={(e) => e.stopPropagation()}
        className="relative p-8 max-w-md w-full mx-4 bg-white shadow-2xl border-4 border-primary rounded-2xl"
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onCancel}
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

        {/* 아이콘 */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 flex items-center justify-center">
            <Trash2 size={48} className="text-red-500" strokeWidth={1.5} />
          </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
          {title}
        </h3>

        <p className="text-gray-600 mb-6 text-center whitespace-pre-line">
          {message}
        </p>

        <div className="flex gap-3 justify-end">
          <Button
            onClick={onCancel}
            variant="outline"
            size="lg"
            className="px-8"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            size="lg"
            className={`px-8 ${
              confirmButtonColor === 'red'
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {confirmLabel}
          </Button>
        </div>
      </Card>
    </div>
  );
}
