/**
 * 파일 업로드 컴포넌트 (PDF, 이미지)
 * 요금제별 파일 개수 및 크기 제한 적용
 */

'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { AttachmentFile } from '@/types/research';
import {
  PLAN_LIMITS,
  ALLOWED_FILE_TYPES,
  isAllowedMimeType,
  isAllowedExtension,
  isFileSizeAllowed,
  isFileCountAllowed,
} from '@/constants/multimodal';
import {
  fileToBase64,
  formatFileSize,
  isImageFile,
  isPdfFile,
} from '@/utils/file';

interface FileUploaderProps {
  /** 현재 첨부된 파일 목록 */
  files: AttachmentFile[];
  /** 파일 변경 핸들러 */
  onChange: (files: AttachmentFile[]) => void;
  /** 현재 요금제 (free, pro, premium) */
  plan: keyof typeof PLAN_LIMITS;
  /** 비활성화 여부 */
  disabled?: boolean;
}

export default function FileUploader({
  files,
  onChange,
  plan,
  disabled = false,
}: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>('');

  const limits = PLAN_LIMITS[plan];

  /**
   * 파일 선택 핸들러
   */
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError('');

    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;

    // 파일 개수 검증
    const totalFileCount = files.length + selectedFiles.length;
    if (!isFileCountAllowed(totalFileCount, plan)) {
      setError(`${plan} 플랜은 최대 ${limits.maxFiles}개의 파일만 첨부할 수 있어요`);
      return;
    }

    // 각 파일 검증
    const validatedFiles: File[] = [];
    for (const file of selectedFiles) {
      // 파일 타입 검증
      if (!isAllowedMimeType(file.type)) {
        setError(
          `${file.name}은 지원하지 않는 파일 형식이에요. PDF 또는 이미지 파일만 가능해요`
        );
        continue;
      }

      if (!isAllowedExtension(file.name)) {
        setError(`${file.name}의 확장자가 허용되지 않았어요`);
        continue;
      }

      // 파일 크기 검증
      if (!isFileSizeAllowed(file.size, plan)) {
        setError(
          `${file.name}의 크기가 너무 커요. ${plan} 플랜은 파일당 최대 ${formatFileSize(limits.maxFileSize)}까지 가능해요`
        );
        continue;
      }

      validatedFiles.push(file);
    }

    if (validatedFiles.length === 0) {
      event.target.value = ''; // input 초기화
      return;
    }

    // Base64 변환
    try {
      const attachments: AttachmentFile[] = await Promise.all(
        validatedFiles.map(file => fileToBase64(file))
      );

      onChange([...files, ...attachments]);
      event.target.value = ''; // input 초기화
    } catch (err) {
      setError('파일을 읽지 못했어요. 다시 시도해주세요');
    }
  };

  /**
   * 파일 제거 핸들러
   */
  const handleFileRemove = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onChange(newFiles);
    setError('');
  };

  /**
   * 파일 선택 버튼 클릭
   */
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // FREE 플랜: 파일 첨부 불가
  if (limits.maxFiles === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🔒</span>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-yellow-800 mb-1">
              파일 첨부는 Pro 플랜부터 가능해요
            </h4>
            <p className="text-xs text-yellow-700 mb-3">
              PDF나 이미지를 첨부해서 더 풍부한 슬라이드를 만들고 싶다면 Pro 플랜으로 업그레이드해주세요.
            </p>
            <div className="text-xs text-yellow-600 space-y-1 mb-3">
              <div>• <strong>Pro 플랜</strong>: 최대 3개 파일, 파일당 30MB</div>
              <div>• <strong>Premium 플랜</strong>: 최대 5개 파일, 파일당 50MB</div>
            </div>
            <button
              type="button"
              onClick={() => window.location.href = '/subscription'}
              className="px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
            >
              플랜 업그레이드 →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 파일 선택 버튼 */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={handleButtonClick}
          disabled={disabled || files.length >= limits.maxFiles}
          variant="outline"
        >
          📎 파일 첨부
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={[
            ...ALLOWED_FILE_TYPES.pdf.extensions,
            ...ALLOWED_FILE_TYPES.image.extensions,
          ].join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        <span className="text-sm text-gray-600">
          {files.length} / {limits.maxFiles}개
        </span>
      </div>

      {/* 제한 안내 */}
      <div className="text-xs text-gray-500 space-y-1">
        <div>• PDF 또는 이미지 (JPG, PNG, GIF, WebP)</div>
        <div>
          • 파일당 최대 {formatFileSize(limits.maxFileSize)}
        </div>
        <div>• 최대 {limits.maxFiles}개 파일</div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">
          {error}
        </div>
      )}

      {/* 첨부된 파일 목록 */}
      {files.length > 0 && (
        <div className="space-y-2 mt-4">
          <div className="text-sm font-medium text-gray-700">
            첨부된 파일 ({files.length}개)
          </div>

          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* 파일 아이콘 */}
                  <div className="text-2xl shrink-0">
                    {isImageFile(file.mimeType) ? '🖼️' : '📄'}
                  </div>

                  {/* 파일 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatFileSize(file.size)} •{' '}
                      {isImageFile(file.mimeType)
                        ? '이미지'
                        : isPdfFile(file.mimeType)
                        ? 'PDF'
                        : '문서'}
                    </div>
                  </div>
                </div>

                {/* 제거 버튼 */}
                <button
                  type="button"
                  onClick={() => handleFileRemove(index)}
                  disabled={disabled}
                  className="text-red-500 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed ml-2"
                  aria-label={`${file.name} 제거`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
