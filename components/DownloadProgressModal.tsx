'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface DownloadProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'downloading' | 'success' | 'error';
  format: 'html' | 'pdf' | 'pptx';
  errorMessage?: string;
}

/**
 * 다운로드 진행 상태 모달
 *
 * @description
 * 파일 다운로드의 진행 상태를 표시하는 모달입니다.
 * - downloading: 스피너 + 진행 메시지
 * - success: 체크 아이콘 + 성공 메시지 (2초 후 자동 닫힘)
 * - error: 에러 아이콘 + 에러 메시지 + 닫기 버튼
 */
export default function DownloadProgressModal({
  isOpen,
  onClose,
  status,
  format,
  errorMessage,
}: DownloadProgressModalProps) {
  // 성공 시 2초 후 자동으로 모달 닫기
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [status, onClose]);

  if (!isOpen) return null;

  const formatLabel = format === 'html' ? 'HTML' : format === 'pdf' ? 'PDF' : 'PowerPoint';

  return (
    <div
      onClick={status !== 'downloading' ? onClose : undefined}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <Card
        onClick={(e) => e.stopPropagation()}
        className="relative p-8 max-w-md w-full mx-4 bg-white shadow-2xl border-4 border-primary rounded-2xl"
      >
        {/* 닫기 버튼 (다운로드 중이 아닐 때만) */}
        {status !== 'downloading' && (
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

        {/* 아이콘 */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 flex items-center justify-center">
            {status === 'downloading' && (
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="w-16 h-16 text-primary" />
            )}
            {status === 'error' && (
              <XCircle className="w-16 h-16 text-destructive" />
            )}
          </div>
        </div>

        {/* 타이틀 */}
        <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
          {status === 'downloading' && '다운로드 중이에요'}
          {status === 'success' && '다운로드 완료'}
          {status === 'error' && '다운로드 실패'}
        </h3>

        {/* 메시지 */}
        <p className="text-gray-600 mb-6 text-center whitespace-pre-line">
          {status === 'downloading' && (
            `${formatLabel} 파일을 준비하고 있어요\n잠시만 기다려주세요`
          )}
          {status === 'success' && (
            `${formatLabel} 파일을 다운로드했어요!\n(이 창은 자동으로 닫혀요)`
          )}
          {status === 'error' && (
            errorMessage
              ? `다운로드하지 못했어요\n${errorMessage}`
              : '다운로드하지 못했어요'
          )}
        </p>

        {/* 에러 상태일 때만 닫기 버튼 표시 */}
        {status === 'error' && (
          <div className="flex gap-3 justify-end">
            <Button
              onClick={onClose}
              variant="outline"
              size="lg"
              className="px-8"
            >
              닫기
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
